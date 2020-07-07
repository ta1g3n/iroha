const mongodb = require("mongodb");

const MongoClient = mongodb.MongoClient;
const client = new MongoClient("mongodb://localhost:27017");

/*client.connect(function(err, client){
    const db = client.db("test");
    db.collection("test").insertOne({a:[1,3,4]}, function(err, r){
        console.log(r);
        client.close();
    });
    db.collection("test").find().toArray((err, r)=>{
        console.log(r);
        client.close();
    })
});*/

let database = null;
async function init(){
    return new Promise((resolve, reject) => {
        client.connect(async (err, cli) => {
            const db = cli.db("iroha");
            database = db;
            resolve();
        });
    });
}
module.exports = {
    async getDb(){
        if(database==null) await init();
        return database;
    }
};
