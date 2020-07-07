import Dexie from "dexie";

export default class KeyStore{
    constructor(){
        this.db = new Dexie("iroha");
        this.db.version(1).stores({
            keys: "++id,priv"
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
        ).then(async res => {
            var id = await this.db.keys.put({
                priv: await crypto.subtle.exportKey("jwk", res.privateKey)
            });
            return {
                pub: await crypto.subtle.exportKey("jwk",res.publicKey),
                id: id
            };
        });
    }
    async getPrivKey(id){
        return await this.db.keys.where({id: id}).first(key => {
            return key;
        });
    }
}
