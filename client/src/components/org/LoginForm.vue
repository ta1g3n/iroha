<template>
    <div id="container">
        <img alt="" src="./../../assets/logo.svg" id="logo">
        <input type="text" placeholder="ログイン名" class="input" v-model="screen"/>
        <input type="password" placeholder="パスワード" class="input" v-model="password"/>
        <button v-on:click="login">
            ログイン
        </button>
    </div>
</template>
<script>
import axios from "axios";

export default {
    name: "LoginForm",
    data(){
        console.log(document.cookie);
        return {
            screen: "",
            name: ""
        }
    },
    methods:{
        login(){
            if(this.screen == ""){
                this.error = "ログイン名を入力してください";
                return false;
            }
            if(this.password == ""){
                this.error = "パスワードを入力してください";
                return false;
            }
            axios.post("/api/v1/login", {
                screen: this.screen,
                password: this.password
            }).then(res => {
                document.cookie = "mtm_session_token="+res.data.token+"; path=/";
                location.href="/";
            });
        }
    },
    mounted(){
        if(document.cookie.search(/mtm_session_token/) != -1){
            location.href="/";
        }
    }
}
</script>
<style lang="scss" scoped>
    #container{
        width: 280px;
        margin: 0 auto;
        #logo{
            width:200px;
            height:200px;
            display:block;
            margin: 0 auto 24px;
        }
        .input{
            margin-bottom: 8px;
        }
        button{
            margin-top: 16px;
            width: 200px;
            margin-right:auto;
            margin-left:auto;
            display:block;
        }
    }
</style>
