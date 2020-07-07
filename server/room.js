const request = require("request");
const mongo = require("mongodb");
const cli = require("./db.js");
const user = require("./user.js");

module.exports = {
    async create(token, name, description, users, private){
        return new Promise(async (resolve, reject) => {
            try{
                var users_ = [];
                for(var i in users) {
                    var u = users[i];
                    const time = (new Date()).getTime();
                    var data = {
                        id: u,
                        key: i,
                        since: time,
                        epoch: 0
                    };
                    if(private){
                        const u_ = await user.retrieve(token, u);
                        data.initKey = u_.key;
                    }
                    users_.push(data);
                }
                var data = {
                    name: name,
                    description: description,
                    users: users_,
                    private: private,
                    messages:[]
                }
                if(private){
                    var arr = Buffer.alloc(32);
                    for(var i = 0; i < 32; i++){
                        arr[i] = Math.floor(Math.random()*255);
                    }
                    data.sharedSalt = arr.toString("base64");
                }
                const db = await cli.getDb();
                db.collection("rooms").insertOne(data, (err,r) => {
                    const id = r.insertedId;
                    data.id = id;
                    resolve(data);
                });
            }catch(err){
                console.log(err);
                reject(err);
            }
        });
    },
    async update(){},
    async retrieve(id, since=0){
        return new Promise(async (resolve, reject) => {
            try{
                const db = await cli.getDb();
                const r = await db.collection("rooms").findOne({
                    _id: mongo.ObjectId(id)
                });
                r.messages = r.messages.filter(e => e.datetime > since);
                r.users = r.users.filter(e => e.since > since);
                resolve(r);
            }catch(err){
                reject(err);
            }
        });
    },
    async delete(id){
        return new Promise(async (resolve, reject) => {
            try{
                const db = await cli.getDb();
                const r = await db.collection("rooms").deleteOne({
                    _id: mongo.ObjectId(room)
                });
                resolve();
            }catch(err){
                reject(err);
            }
        });
    },
    async list(user){
        return new Promise(async (resolve, reject) => {
            try{
                const db = await cli.getDb();
                const r = await db.collection("rooms").find({
                    "users.id": { $eq: user }
                }, {
                    _id: true,
                    name: true,
                    description: true,
                    private: true,
                    users: false,
                    messages: false
                }).toArray();
                resolve(r);
            }catch(err){
                reject(err);
            }
        });
    },
    async send(id, user, payload, keys){
        return new Promise(async (resolve, reject) => {
            try{
                var data = {
                    _id: mongo.ObjectId(),
                    user: user,
                    payload: payload,
                    datetime: (new Date()).getTime()
                };
                if(keys!=null){
                    data.keys=keys;
                }
                const db = await cli.getDb();
                const r = await db.collection("rooms").updateOne({
                    _id: mongo.ObjectId(id)
                },{
                    $push: {
                        messages: data
                    }
                }).catch(err => console.log(err));
                resolve(data);
            }catch(err){
                reject(err);
            }
        });
    }
}
