export class Tree{
    constructor(){
        this.nodes = new Array();
        this.n = 0;
        this.root = new BranchNode(this);
        this.branch_nodes = {};
    }
    insert(ukey, key){
        const data = {
            key: ukey,
            pub: key,
            active: false
        }
        this.nodes.push(data);
        this.required = this.requiredBranches();
        var node = new LeafNode(data.key, data.pub, data.active);
        node.id = this.n;
        this.n++;
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
}

class BranchNode {
    constructor(tree){
        this.left = null;
        this.right = null;
        this.tree = tree;
        this.active = false;
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
        const v = this.tree.required.some(n => {
            if(n.left.isleaf==this.left.isleaf && n.left.id==this.left.id && n.right.isleaf ==this.right.isleaf && n.right.id == this.right.id) {
                this.id = n.id;
                this.active = true;
            }
        });
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
                    isleaf: this.left.isleaf
                },
                right: {
                    id: this.right!=null?this.right.isleaf?this.right.ukey:this.right.id:null,
                    isleaf: this.right.isleaf
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
    constructor(v, key, active){
        this.ukey = v;
        this.key = key;
        this.active = active;
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

