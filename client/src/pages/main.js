import Vue from 'vue'
import VueRouter from "vue-router";
import vuetify from "../plugins/vuetify.js";
import App from './../components/tpl/App.vue';
import Home from './../components/tpl/Home.vue';
import RoomCreate from './../components/tpl/RoomCreate.vue';
import Room from './../components/tpl/Room.vue';
import axios from "axios";
import VueAxios from "vue-axios";
import KeyStore from "../keystore.js";

require("@/assets/sass/main.scss");

Vue.config.productionTip = false;
Vue.use(VueRouter);
Vue.use(VueAxios, axios);

window.onload = async ()=>{
    var mtm_session_token = document.cookie
        .split(";")
        .find(row => row.trim().startsWith("mtm_session_token"));
    if(mtm_session_token==null){
        location.href = "/login";
    }else{
        mtm_session_token = mtm_session_token
            .trim()
            .split("=")[1];
    }
    axios.defaults.headers.common["Authorization"] = mtm_session_token;
    const session_ = await axios.get("/api/v1/session/profile");
    window.session = session_.data;
    if(!localStorage.getItem("deviceId")){
        const rand = crypto.getRandomValues(new Uint8Array(12));
        const time = (new TextEncoder()).encode(String(Date.now()));
        const raw = new Uint8Array(rand.length+time.length);
        for(let i = 0; i < rand.length; i++){
            raw[i] = rand[i];
        }
        for(let i = 0; i < time.length; i++){
            raw[rand.length+i] = time[i];
        }
        const digest = await crypto.subtle.digest("SHA-512", raw.buffer);
        const devId = btoa(String.fromCharCode(...new Uint8Array(digest)));
        localStorage.setItem("deviceId", devId);
    }
    const keystore = new KeyStore();
    const key = await keystore.generateKey();
    await axios.post("/api/v1/register", {
        key: key
    });
    const routes = [
        {
            name: "createRoom",
            path: "/room/create",
            component: RoomCreate
        },
        {
            name: "retrieveRoom",
            path: "/room/:id",
            component: Room
        },
        {
            name: "listRoom",
            path: "/",
            component: Home
        }
    ];

    const router = new VueRouter({
        mode: "history",
        base: process.env.BASE_URL,
        routes
    });

    new Vue({
        render: h => h(App),
        router,
        vuetify
    }).$mount('#app');
}
