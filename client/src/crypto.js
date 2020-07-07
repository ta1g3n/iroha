import KeyStore from "./keystore.js";
import {Tree} from "./tree.js";

export class KeyManager{
    constructor(){
        this.handlers = {};
        this.sending = false;
        this.root_rat;
        this.send_rat;
        this.recv_rat;
        this.dh_key;
        this.root_key;
        this.keytree = new Tree();
    }
    async setPrivKey(user, id){
        const keystore = new KeyStore();
        const priv = await keystore.getPrivKey(id);
        this.priv = await crypto.subtle.importKey(
            "jwk",
            priv.priv,
            {
                name: "ECDH",
                namedCurve: "P-384"
            },
            false,
            ["deriveKey"]
        );
        this.keytree.activate(user);
        this.keytree.setPrivKey(user, this.priv);
    }
    setSharedSalt(salt){
        this.sharedSalt = salt;
    }
    async setOpponentKey(user, imp){
        const key = await crypto.subtle.importKey(
            "jwk",
            imp,
            {
                name: "ECDH",
                namedCurve: "P-384"
            },
            true,
            []
        );
        this.keytree.insert(user, key);
    }
    async importOpponentKeys(user, keys){
        this.keytree.activate(user);
        const branches = this.keytree.search(user);
        branches.forEach((b,i) => {
            b.key = keys[i];
        });
    }
    async generateKey(){
        return await crypto.subtle.generateKey(
            {
                name: "ECDH",
                namedCurve: "P-384"
            },
            true,
            ["deriveKey", "deriveBits"]
        ).then(res => {
            this.priv = res.privateKey;
            this.pub = res.publicKey;
        });
    }
    async regenerateKey(){
        return await this.generateKey().then(async () => {
            for(var k in this.opponent_keys) {
                await this.importKey(this.opponent_keys[k]);
            }
        });
    }
    async receive(data){
        if(data.user == window.session.id) return false;
        this.sending = false;
        if("keys" in data && data.keys.length>0){
            await this.setOpponentKey(data.user, data.keys[0]);
            await this.generateDHKey();
            this.recv_rat = new Ratchet(await this.root_rat.getChainKey(this.dh_key));
            this.opponent_keys[data.user] = data.keys[0];
        }
        const result = await this.recv_rat.decrypt(data.payload);
        return result;
    }
    on(evt, callback){
        this.handlers[evt] = e => callback(e);
    }
    async exportKey(){
        return await crypto.subtle.exportKey("jwk", this.pub);
    }
    async generateDHKey(me){
        this.dh_key = await this.keytree.calcUserKey(me);
        if(this.root_key==null){
            const bin = atob(this.sharedSalt);
            const bytes = new Uint8Array(bin.length);
            for(let i = 0; i<bin.length; i++){
                bytes[i] = bin.charCodeAt(i);
            }
            this.root_rat = new RootRatchet();
            await this.root_rat.start(this.dh_key, bytes);
        }
    }
    async encrypt(message){
        var data = {};
        if(!this.sending){
            await this.regenerateKey();
            data.pub = await this.exportKey();
            this.sending = true;
            this.send_rat = new Ratchet(
                await this.root_rat.getChainKey(this.dh_key)
            );
        }
        data.body = await this.send_rat.encrypt(message);
        return data;
    }
}

export default class RootRatchet{
    constructor(){
        this.root_key;
    }
    async derive(input){
        const key = await crypto.subtle.deriveKey(
            {
                name: "HKDF",
                hash: {name: "SHA-512"},
                salt: await crypto.subtle.exportKey("raw", this.root_key),
                info: new ArrayBuffer()
            },
            input,
            {
                name: "HMAC",
                hash: "SHA-512",
                length: 512
            },
            true,
            ["sign"]
        );
        const raw_key = await crypto.subtle.exportKey("raw", key);
        console.log("root key derived", raw_key);
        const keyarr = new Uint8Array(raw_key);
        const root_key = keyarr.slice(0, 32);
        const chain_key = keyarr.slice(32, 64);
        return {
            root: await crypto.subtle.importKey(
                "raw",
                root_key,
                {
                    name: "HMAC",
                    hash: "SHA-512"
                },
                true,
                ["sign"]
            ),
            chain: await crypto.subtle.importKey(
                "raw",
                chain_key,
                {
                    name: "HMAC",
                    hash: "SHA-512"
                },
                true,
                ["sign"]
            )
        }
    }
    async start(key, salt){
        this.root_key = await crypto.subtle.deriveKey(
            {
                name: "HKDF",
                hash: {name: "SHA-512"},
                salt: salt.buffer,
                info: new ArrayBuffer()
            },
            key,
            {
                name: "HMAC",
                hash: "SHA-512",
                length: 512
            },
            true,
            ["sign"]
        );
    }
    async getChainKey(input){
        const kdf_result = await this.derive(input);
        this.root_key = kdf_result.root;
        return kdf_result.chain;
    }
}
export class Ratchet{
    constructor(key){
        this.root_key = key;
    }
    async derive(){
        const r_data = new ArrayBuffer(4);
        const r_data_ = new Uint32Array(r_data);
        r_data_[0] = 2;
        const root_key = await crypto.subtle.sign(
            {
                name: "HMAC"
            },
            this.root_key,
            r_data
        );
        this.root_key = await crypto.subtle.importKey(
            "raw",
            root_key,
            {
                name: "HMAC",
                hash: "SHA-512"
            },
            true,
            ["sign"]
        );
        const c_data = new ArrayBuffer(4);
        const c_data_ = new Uint32Array(c_data);
        c_data_[0] = 2;
        const chain = await crypto.subtle.sign(
            {
                name: "HMAC",
                hash: "SHA-512",
                length: 256
            },
            this.root_key,
            r_data
        );
        const chain_cliped = new Uint8Array(chain, 0, 32);
        const chain_key = await crypto.subtle.importKey(
            "raw",
            chain_cliped,
            {
                name: "AES-GCM"
            },
            true,
            ["encrypt", "decrypt"]
        );
        console.log("chain_key derived", chain_cliped);
        return {
            root: this.root_key,
            chain: chain_key
        }
    }
    async getChainKey(){
        const kdf_result = await this.derive();
        this.root_key = kdf_result.root;
        return kdf_result.chain;
    }
    async encrypt(mes){
        const enc = new TextEncoder();
        mes = enc.encode(mes);
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encoded = await crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            await this.getChainKey(),
            mes
        );
        return {
            data: btoa(
                String.fromCharCode(
                    ...new Uint8Array(encoded)
                )
            ),
            iv: iv
        }
    }
    async decrypt(data){
        const bin = atob(data.data);
        const len = bin.length;
        const arrbuffer = new ArrayBuffer(len);
        const bytes = new Uint8Array(arrbuffer);
        const iv = new Uint8Array(Object.keys(data.iv).length);
        for(let i = 0; i<len; i++) bytes[i] = bin.charCodeAt(i);
        Object.keys(data.iv).forEach(k => {
            iv[k] = data.iv[k];
        })
        const buf = await crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            await this.getChainKey(),
            arrbuffer
        );
        console.log(buf);
        const dec = new TextDecoder();
        return dec.decode(buf);
    }
}

