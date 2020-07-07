class Tree{
    constructor(...nodes){
        this.n = 0;
        this.nodes = [];
        this.insert(nodes);
    }
    insert(nodes){
        this.nodes = this.nodes.concat(nodes);
        this.nodes.forEach(e => {
            e.id = this.n;
            this.n++;
        });
        this.nodes = this.nodes.sort((a,b) => {
            return a.key < b.key ? -1 : 1;
        });
    }
    build(){
        var before = this.nodes.concat([]);
        var after = new Array();
        var n = this.n;
        var solids = this.list_solids();
        while(before.length > 1){
            for(var j = 0; j < before.length;j++){
                let l = Math.floor(j/2) * 2;
                const a = before[l];
                const b = before[l+1];
                if(before[j]==null) continue
                if(b==null||!(a.active||b.active)){
                    after.push(before[j]);
                }else{
                    const branch = new BranchNode(a, b);
                    const solid_ = solids.find(e => e.left==a.id&&e.right==b.id);
                    if(solid_){
                        branch.id = solid_.id;
                    }
                    after.push(branch);
                    n++;
                    if(j==l) j++;
                }
            }
            before = after.concat([]);
            after = new Array();
        }
        this.root = before[0];
    }
    list_solids(){
        var solids = new Array();
        var root = new BranchNode();
        var n = this.n;
        for(var j = 0; j < this.nodes.length;j++){
            if(root.isfull()){
                var root_ = new BranchNode();
                root_.append(root);
                root_.append(this.nodes[j]);
                root = root_;
            }else{
                root.append(this.nodes[j]);
            }
        }
        console.log(root);
        return root;
    }
    search(key){
        const branches = new Array();
        var current = this.root;
        while(!current.is_leaf){
            if(key >= current.right.min){
                branches.push(current);
                current = current.right;
            }else if(key <= current.left.max){
                branches.push(current);
                current = current.left;
            }else{
                return false;
            }
        }
        console.log(current);
        if(current.value.key != key) return false;
        return branches;
    }
}

class Node {
    constructor(active, is_leaf, min, max){
        this.active = active;
        this.is_leaf = is_leaf;
        this.min = min;
        this.max = max;
    }
}

class BranchNode extends Node {
    constructor(id=-1){
        super(true, false, -1, -1);
        this.id = id;
        this.left = null;
        this.right = null;
    }
    isfull(){
        if(this.right == null) return false;
        if(this.left == null) return false;
        return this.left.isfull()&&this.right.isfull();
    }
    append(node){
        if(this.left==null){
            this.left = node;
            this.min = this.left.min;
        }else if(this.right==null){
            this.right = node;
            this.max = this.right.max;
        }else if(!this.left.isfull()){
            this.left.append(node);
            this.min = this.left.min;
        }else if(!this.right.isfull()){
            this.right.append(node);
            this.max = this.right.max;
        }else{
            var left = new BranchNode();
            left.append(this.left);
            left.append(node);
            this.left = left;
        }
    }
    toArr(){
        var left = this.left.is_leaf?this.left.value.key:this.left.toArr();
        var right = this.right.is_leaf?this.right.value.key:this.right.toArr();
        return [left, right];
    }
}
class LeafNode extends Node {
    constructor(value, active){
        super(active, true, value.key, value.key);
        this.value = value;
    }
    isfull(){
        return true;
    }
}

var tree = new Tree(
    new LeafNode({key: 1}, true),
    new LeafNode({key: 2}, false),
    new LeafNode({key: 3}, true),
    new LeafNode({key: 4}, false),
    new LeafNode({key: 5}, true),
    new LeafNode({key: 6}, false),
    new LeafNode({key: 7}, true),
    new LeafNode({key: 8}, false),
    new LeafNode({key: 9}, true)
);

const r = tree.list_solids();
const util = require("util");
console.log(util.inspect(r.toArr(), false, null));
