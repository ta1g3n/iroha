const crypto = require("crypto");
const express = require("express");
const app = express();
const http = require("http").Server(app);
//const io = require("socket.io")(http);

const mongodb = require("mongodb");
const mongocli = mongodb.MongoClient
const dbaddr = "mongodb://localhost:27017/chat";

/** Message Scheme
 * {
 *      "version": Number,
 *      "userId": Number,
 *      "prevId": Number,
 *      "pubKey": String,
 *      "hmac": String,
 *      "payload": String
 * }
 */

app.post("/api/v1/channels", async (req, res)=>{
    mongocli.connect(dbaddr, (err, db) => {
        db.collection("channels").insertOne(data, (err, result)=>{
            resolve();
            db.close();
        });
    });
});

app.get("/api/v1/channels/:id", (req, res)=>{
    mongocli.connect(dbaddr, (err, db) => {
        db.collection("channels").find({_id: req.params.id}, {
            messages: 0
        }).then(result=>{
            resolve();
            db.close();
        });
    });
});

app.delete("/api/v1/channels/:id", ()=>{
    mongocli.connect(dbaddr, (err, db) => {
        db.collection("channels").deleteOne({_id: req.params.id}, (err, result)=>{
            resolve();
            db.close();
        });
    });
});

app.post("/api/v1/channels/:id/members", (req, res)=>{
    mongocli.connect(dbaddr, (err, db) => {
        db.collection("channels").updateOne({
            _id: req.params.id
        }, {
            $push: {
                members: {}
            }
        }, (err, result)=>{
            resolve();
            db.close();
        });
    });
});

app.delete("/api/v1/channels/:id/members/:mid", ()=>{

});

app.get("/api/v1/channels/:id/messages", (req, res)=>{
    mongocli.connect(dbaddr, (err, db) => {
        db.collection("channels").find({}, {
            _id: 0,
            name: 0,
            created: 0,
            members: 0,
        });
    });
});

app.post("/api/v1/channels/:id/messages", (req, res)=>{
    mongocli.connect(dbaddr, (err, db) => {
        db.collection("channels").updateOne({
            _id: req.params.id
        }, {
            $push: {
                messages: {
                    version: 1,
                    userId: Number,
                    prevIndex: Number,
                    pubKey: String,
                    hmac: String,
                    payload: String
                }
            }
        }, (err, result)=>{
            res.send()
            db.close();
        });
    });
});

app.post("/api/v1/users", (req, res)=>{
    mongocli.connect(dbaddr, (err, db) => {
        db.collection("users").insertOne({
            
        }, (err, result)=>{
            res.send()
            db.close();
        });
    });
});

app.get("/api/v1/users/:id", (req, res)=>{
    
});

app.put("/api/v1/users/:id", (req, res)=>{
    
});

app.delete("/api/v1/users/:id", (req, res)=>{
    
});

http.listen(80, function() {
    console.log("start server");
});
