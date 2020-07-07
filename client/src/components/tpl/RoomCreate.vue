<template>
    <div id="room_create_form">
        <v-app-bar dark app>
            <v-toolbar-title>部屋作成</v-toolbar-title>
        </v-app-bar>
        <v-main>
            <v-text-field
                v-model="name"
                label="チャンネル名" />
            <v-textarea
                label="説明"
                v-model="description" />
            <v-select
                label="参加者"
                v-model="parts"
                :items="users"
                chips
                multiple
            ></v-select>
            <v-switch
                v-model="isPrivate"
                label="プライベートルーム" />
            <button v-on:click="createRoom">部屋を作成</button>
        </v-main>
    </div>
</template>
<script>
import axios from "axios";

export default {
    name: "RoomCreate",
    data(){
        return {
            name: "",
            description: "",
            isPrivate: false,
            users: [],
            parts: []
        }
    },
    created(){
        this.userList();
    },
    methods: {
        async userList(){
            const users = await axios.get("/api/v1/users");
            var user_list = [];
            users.data.forEach(u => {
                user_list.push({
                    text: u.name,
                    value: u.id,
                    disabled: false
                });
            });
            this.users = user_list;
        },
        createRoom(){
            axios.post("/api/v1/rooms", {
                name: this.name,
                description: this.description,
                private: this.isPrivate,
                users: this.parts
            }).then(res => {
                this.$router.push("/room/"+res.data.id);
            });
        }

    }
}
</script>
