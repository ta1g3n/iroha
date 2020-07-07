const request = require("request");
const db_singleton = require("./db.js");

module.exports = {
    async createTable(){
        return new Promise((resolve, reject) => {
            const db = db_singleton.get();
            try{
                db.serialize(()=>{
                    db.run(`create table if not exists device (
                        hash text primary key,
                        priv text,
                        user integer
                    )`);
                });
                return resolve();
            }catch(err){
                return reject(err);
            }
        });
    },
    async exists(user, device){
        return new Promise((resolve,reject) => {
            const db = db_singleton();
            try{
                db.get(
                    "select count(*) as c from device where user=? and hash=?",
                    [user, device],
                    function(err, row){
                        if(err){
                            throw err;
                        }
                        resolve(row.c!=0);
                    }
                );
            }catch(err){
                return reject(err);
            }
        })
    }
    static async register(user, hash, priv){
        return new Promise((resolve,reject) => {
            const db = db_singleton();
            try{
                db.run(
                    "insert into device (user, hash, priv) values ($user, $hash, $priv)",
                    user, hash, priv
                );
                return resolve()
            }catch(err){
                return reject(err);
            }
        })
    }
    static validate(user, device, nonce, sign){
        return new Promise((resolve, reject)=>{
            const db = db_singleton();
            try{
                db.get(
                    "select key from device where user=? and hash=?",
                    [user, device],
                    function(err, row){
                        const key = crypto.createPublicKey(row.key);
                        const verifier = crypto.createVerify("SHA256");
                        verifier.update(data);
                        const verified = verifier.verify(key, sign, "base64");
                        if(verified){
                            resolve(user);
                        }else{
                            throw 
                        }
                    }
                );
            }catch(err){
                return reject(err);
            }
        })
    }
    /*static async startAuthorize(user, deviceId, hash){
        return new Promise((resolve, reject) => {
            const db = db_singleton();
            try{
                db.get(
                    "select count(*) as c from device where user=? and hash=?",
                    [user, device],
                    function(err, row){
                        if(err){
                            throw err;
                        }
                        resolve(row.c!=0);
                    }
                );
            }catch(err){
                return reject(err);
            }
        });
    }
    authorize(user, deviceId, hash){
        return new Promise((resolve, reject) => {

        });
    }*/
}
