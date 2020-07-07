const util = require("util");
class Tree{
    constructor(){
        this.nodes = new Array();
        this.n = 0;
        this.root = new BranchNode(this);
    }
    insert(ukey, key){
        var data = {
            key: ukey,
            active: false
        }
        data.pub = key;
        this.nodes.push(data);
        //this.branch_nodes = this.requiredBranches();
        var node = new LeafNode(data.key, data.pub, data.active);
        this.root.append(node);
    }
    requiredBranches(){
        var counter = {n:0};
        const root = new BranchNode(counter);
        for(var node of this.nodes){
            var node = new LeafNode(node.key, node.pub, true);
            root.append(node);
        }
        return root.getBranches().slice(1);
    }
    activate(ukey){
        this.nodes.find(n => n.key == ukey).active=true;
        this.n = 0;
        this.root = new BranchNode(this);
        for(var node of this.nodes){
            var node = new LeafNode(node.key, node.pub, node.active);
            this.root.append(node);
        }
    }
    setKeys(ukey, keys){
        const trace = this.root.search(ukey);
        trace.forEach((b,i) => {
            b.key = keys[i];
        });
    }
    setPrivKey(ukey, key){
        const trace = this.root.search(ukey).shift();
        trace.priv = key;
        console.log(trace);
    }
    async calcUserKey(ukey){
        const trace = this.root.search(ukey);
        for(var i = 1; i < trace.length; i++){
            var alg = {};
            var ext = true;
            if(i==trace.length){
                alg = {
                    name: "HKDF"
                };
                ext = false
            }else{
                alg = {
                    name: "AES-GCM",
                    length: 256
                };
            }
            if(trace[i].left.id == trace[i-1].id){
                trace[i].priv = await crypto.subtle.deriveKey(
                    {
                        name: "ECDH",
                        public: trace[i].right.key
                    },
                    trace[i-1].priv,
                    alg,
                    ext,
                    ["deriveKey"]
                );
                trace[i].key = await crypto.subtle.deriveKey();
            }else if(trace[i].right.id == trace[i-1].id){
                trace[i].priv = await crypto.subtle.deriveKey(
                    {
                        name: "ECDH",
                        public: trace[i].left.key
                    },
                    trace[i-1].priv,
                    alg,
                    ext,
                    ["deriveKey"]
                );
            }
        }
        return this.root.priv;
    }
}

class BranchNode {
    constructor(tree){
        this.left = null;
        this.right = null;
        this.tree = tree;
    }
    append(node){
        if(this.left == null){
            this.left = node;
        }else if(this.right == null){
            this.right = node;
        }else if(!this.right.isfull){
            this.right.append(node);
        }else if(this.right.count == this.left.count){
            var left = new BranchNode(this.tree);
            left.append(this.left);
            left.append(this.right);
            this.left = left;
            this.left.id = this.tree.n;
            this.tree.n++;
            this.right = node;
        }else{
            if(this.right == null){
                this.right = node;
            }else if(this.right.isleaf&&this.right.active){
                var right = new BranchNode(this.tree);
                delete this.right.id;
                right.append(this.right);
                right.append(node);
                this.right = right;
                this.right.id = this.tree.n;
                this.tree.n++;
            }else if(this.right.isleaf){
                var left = new BranchNode(this.tree);
                left.append(this.left);
                left.append(this.right);
                this.left = left;
                this.left.id = this.tree.n;
                this.tree.n++;
                this.right = node;
            }else{
                this.right.append(node);
            }
        }
    }
    get isleaf(){
        return false;
    }
    get isfull(){
        const l = this.left!=null?this.left.isfull:false;
        const r = this.right!=null?this.right.isfull:false;
        return l&&r;
    }
    get count(){
        const l = this.left!=null?this.left.count:0;
        const r = this.right!=null?this.right.count:0;
        return l+r;
    }
    get max(){
        return this.right!=null?this.right.max:this.left.max;
    }
    get min(){
        return this.left.min;
    }
    getBranches(){
        var branches = [
            {
                id: this.id,
                left: {
                    id: this.left!=null?this.left.isleaf?this.left.ukey:this.left.id:null,
                    isleaf: this.left!=null?this.left.isleaf:false
                },
                right: {
                    id: this.right!=null?this.right.isleaf?this.right.ukey:this.right.id:null,
                    isleaf: this.right!=null?this.right.isleaf:false
                }
            }
        ];
        if(this.left!=null&&!this.left.isleaf){
            branches = branches.concat(this.left.getBranches());
        }
        if(this.right!=null&&!this.right.isleaf){
            branches = branches.concat(this.right.getBranches());
        }
        return branches;
    }
    search(key){
        if(this.left.max >= key){
            const arr = this.left.search(key);
            arr.push(this);
            return arr;
        }else if(this.right.min <= key){
            const arr = this.right.search(key);
            arr.push(this);
            return arr;
        }
    }
}

class LeafNode{
    constructor(v, key, active, priv){
        this.ukey = v;
        this.key = key;
        this.active = active;
        this.priv = priv;
        console.log(v, key, active, priv);
    }
    get max(){
        return this.ukey;
    }
    get min(){
        return this.ukey;
    }
    get isleaf(){
        return true;
    }
    get isfull(){
        return true;
    }
    get count(){
        return 1;
    }
    search(ukey){
        return ukey == this.ukey ? [this] : [false];
    }
}

const b = new Tree();
b.insert(0, 0);
b.insert(1, 1);
b.insert(2, 2);
b.insert(3, 3);
b.insert(4, 4);
b.insert(5, 5);
b.insert(6, 6);
b.insert(7, 7);
b.activate(0);
b.setPrivKey(0, 100);
console.log(util.inspect(b.calcUserKey(0), false,null))
console.log(util.inspect(b.root, false,null))
