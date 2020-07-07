const crypto = require("crypto");
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
var http = require("http").Server(app);
const io = require("socket.io")(http);
//const err = require("./err.js");
const user = require("./user.js");
const room = require("./room.js");
//const team = require("./team.js");
//const dev = require("./dev.js");

app.use("/", express.static(__dirname+"/../client/dist"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.all("/login", (req, res, next) => {
    res.sendFile(path.resolve(__dirname+"/../client/dist/login.html"));
});
app.all("/signup", (req, res, next) => {
    res.sendFile(path.resolve(__dirname+"/../client/dist/signup.html"));
});
app.all("/about", (req, res, next) => {
    res.sendFile(path.resolve(__dirname+"/../client/dist/signup.html"));
});

app.post("/api/v1/login", async (req, res) => {
    const screen = req.body.screen;
    const password = req.body.password;
    const deviceId = req.body.deviceId;
    const nonce = req.body.nonce;
    const sign = req.body.sign;
    const session = await user.login(screen, password);
    if (!session) {
        res.status(401).send({
            code: err.code.WRONG_MESSAGE,
            message: err.mes.WRONG_MESSAGE
        });
        return;
    }
    /*if (!dev.exists(session.id, deviceId)) {
        dev.startAuthorize(deviceId, session.id, pinhash);
        res.status(401).send({
            code: err.code.UNAUTHORIZED_DEVICE,
            message: err.mes.UNAUTHORIZED_DEVICE
        });
        return;
    }*/
    res.send({token: session.token});
});

app.get("/api/v1/session/profile", async (req, res) => {
    const token = req.header("Authorization");
    const session = await user.auth(token);
    res.send(session);
});

app.get("/api/v1/rooms", async (req, res) => {
    const token = req.header("Authorization");
    const session = await user.auth(token);
    const rooms = await room.list(session.id);
    res.send(rooms);
});

app.post("/api/v1/rooms", async (req, res) => {
    const token = req.header("Authorization");
    const session = await user.auth(token);
    const name = req.body.name;
    const description = req.body.description;
    const users = req.body.users;
    const private = req.body.private;
    const r = await room.create(token, name, description, users, private);
    res.send(r);
});

app.get("/api/v1/rooms/:id", async (req, res) => {
    const token = req.header("Authorization");
    const session = await user.auth(token);
    const id = req.params.id;
    const since = req.query.since ? req.query.since : 0;
    const r = await room.retrieve(id, since);
    res.send(r);
});

app.delete("/api/v1/rooms/:id", async (req, res) => {
    const token = req.header("Authorization");
    const session = await user.auth(token);
    const id = req.params.id;
    const r = await room.delete(id);
    res.send(r);
});

app.post("/api/v1/rooms/:id/messages", async (req, res) => {
    const token = req.header("Authorization");
    const session = await user.auth(token);
    const id = req.params.id;
    const u = session.id;
    const payload = req.body.payload;
    const keys = req.body.keys;
    const r = await room.send(id, u, payload, keys).catch(err => console.log(err));
    res.send(r);
});
app.get("/api/v1/users", async (req, res) => {
    const token = req.header("Authorization");
    const users = await user.list(token);
    res.send(users);
});
app.post("/api/v1/register", async (req,res) => {
    const token = req.header("Authorization");
    const session = await user.auth(token);
    const id = req.params.id;
    const u = session.id;
    user.register(u, req.body.key);
    res.send();
})

app.all("*", (req, res, next) => {
    res.sendFile(path.resolve(__dirname+"/../client/dist/index.html"));
});

http.listen(80, function(){
    console.log("server started!");
});

