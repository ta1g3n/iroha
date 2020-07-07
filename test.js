const crypto = require("crypto");

class Tree{
    constructor(...nodes){
        this.layers = [];
        let l = nodes.length;
        while(l > 1){
            this.layers.push(new Array(Math.floor(l)));
            l = Math.floor(l/2)
        }
        nodes.forEach((node,i) => {
            this.layers[0][i] = node;
        });
        for(var i=0;i < this.layers.length - 1;i++){
            for(var j = 0; j < this.layers[i].length;j++){
                let l = Math.floor(j/2) * 2;
                if(this.layers[i][j]==null) continue
                if((this.layers[i][j].isLeaf()&&this.layers[i][j].active) || (!this.layers[i][j].isLeaf()&&this.layers[i][l]!=null&&this.layers[i][l+1]!=null)){
                    this.layers[i+1][l/2] = new TreeNode(l, (l+1));
                    j++;
                }
            }
        }
    }

}

class TreeNode {
    constructor(left, right){
        this.left = left;
        this.right = right;
        this.active = false;
    }
    isLeaf(){
        return false;
    }
}
class Leaf {
    constructor(value, active){
        this.left = null;
        this.right = null;
        this.value = value;
        this.active = active;
    }
    isLeaf(){
        return true;
    }
}

class Server {
    constructor(){
        this.nodes = [];
        this.messages = [];
    }
    append(node){
        this.nodes.push(node);
    }
    table(){
        return this.nodes;
    }
    recv(...args){
    }
}

class Node {
    constructor(i){
        this.id = i;
        this.keys = crypto.createECDH("secp256k1");
        this.keys.generateKeys();
    }
    getPub(){
        return this.keys.getPublicKey();
    }
    getPriv(){
        return this.keys.getPrivateKey();
    }
    compute(other){
        return this.keys.computeSecret(other.getPub())
    }
    computeOthers(others){
        var sec_keys = crypto.createECDH("secp256k1");
        sec_keys.setPrivateKey(this.getPriv());
        var secret;
        others.forEach(other => {
            secret = sec_keys.computeSecret(other.getPub());
            sec_keys.setPrivateKey(secret);
        });
        return secret;
    }
    send(){
        const nodes = this.table();
        this.server.recv()
    }
    recv(){}
}

var nodes = []
var server = new Server();

for(var i = 0; i < 7; i++) {
    nodes.push(new Node(i));
    server.append({
        id: i,
        pub: nodes[i].getPub(),
        active: false
    })
    nodes[i].server = server;
}
