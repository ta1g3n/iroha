const request = require("request");
const mongo = require("mongodb");
const cli = require("./db.js");

module.exports = {
    register(id, key){
        return new Promise(async (resolve, reject) => {
            try{
                const db = await cli.getDb();
                const user = await db.collection("users").findOne({
                    user: id
                });
                if(user==null){
                    await db.collection("users").insertOne({
                        user: id,
                        key: key
                    });
                }else{
                    await db.collection("users").updateOne({
                        user: mongo.ObjectId(id),
                    },{
                        $set: {
                            key: key
                        }
                    });
                }
                resolve();
            }catch(err){
                reject(err);
            }
        });
    },
    login(screen, password){
        return new Promise((resolve, reject) => {
            request({
                method: "POST",
                url: "http://mitama/api/v1/login",
                json: true,
                form: {
                    screen: screen,
                    password: password
                }
            }, (err,res,body)=>{
                if(err) reject(err);
                if(res.statusCode==200){
                    resolve(body);
                }else{
                    reject(body);
                }
            });
        });
    },
    auth(token){
        return new Promise((resolve, reject) => {
            request({
                method: "POST",
                url: "http://mitama/api/v1/auth",
                json: true,
                form: {
                    token: token
                }
            }, (err,res,body)=>{
                if(!err){
                    if(res.statusCode==200){
                        resolve(body);
                    }else{
                        reject(body);
                    }
                }else{
                    reject(err);
                }
            });
        });
    },
    list(token){
        return new Promise((resolve, reject) => {
            request({
                uri: "http://mitama/api/v1/users",
                method: "GET",
                headers: {
                    "authorization": token
                }
            }, (err,res,body)=>{
                if(err) reject(err);
                if(res.statusCode==200){
                    resolve(body);
                }else{
                    reject(body);
                }
            });
        });
    },
    retrieve(token, id){
        return new Promise(async (resolve, reject) => {
            const db = await cli.getDb();
            request({
                uri: "http://mitama/api/v1/users/"+id,
                method: "GET",
                json: true,
                headers: {
                    "authorization": token
                }
            }, async (err,res,body)=>{
                if(err) reject(err);
                if(res.statusCode==200){
                    try{
                        const user_keys = await db.collection("users").findOne({user: id});
                        const u = Object.assign(body, { key: user_keys.key});
                        resolve(u);
                    }catch(err){
                        reject(err);
                    }
                }else{
                    reject(body);
                }
            });
        })
    }
}
