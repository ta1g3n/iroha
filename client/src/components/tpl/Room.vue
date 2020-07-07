<template>
  <div id="app">
    <v-app-bar dark app>
        <v-toolbar-title>{{room.name}}</v-toolbar-title>
    </v-app-bar>
    <v-main>
      <div id="messages">
          <p v-for="message in messages" v-bind:key="message._id">
              {{message.content}}
          </p>
      </div>
      <div id="send">
          <v-text-field id="text" label="メッセージを入力" v-model="message" />
          <button v-bind:disabled="message.length == 0" v-on:click="send">送信</button>
      </div>
    </v-main>
  </div>
</template>

<script>
import axios from "axios";
import {KeyManager} from "../../crypto.js";

const manager = new KeyManager();

export default {
  name: 'Room',
  data(){
      return {
          messages: [],
          room: {},
          message: "",
          last: 0,
          interval: null,
          this.key: -1,
      }
  },
  created(){
      this.init();
      this.interval = setInterval(()=>{
          this.reload();
      }, 1000);
  },
  beforeDestroy(){
      clearInterval(this.interval);
  },
  methods: {
      async init(){
          const id = this.$route.params.id;
          const room_info = await axios.get("/api/v1/rooms/"+id+"?since="+this.last);
          this.room = room_info.data;
          if(this.room.private){
              manager.setSharedSalt(this.room.sharedSalt);
              const me = this.room.users.find(u => u.id == window.session.id);
              for(var u of this.room.users){
                  manager.setOpponentKey(u.key, u.initKey.pub);
              }
              await manager.setPrivKey(me.key, me.initKey.id);
              await manager.generateDHKey(me.key);
              this.key = me.key;
          }
      },
      async reload(){
          const id = this.$route.params.id;
          const room_info = await axios.get("/api/v1/rooms/"+id+"?since="+this.last);
          this.room = room_info.data;
          var new_messages = new Array();
          for(var m of this.room.messages) {
              if(this.messages.some(m_ => m_._id == m._id)===true) continue;
              var data = {
                  _id: m.id,
                  user: m.user,
                  datetime: m.datetime
              };
              if(this.room.private){
                  data.content = await manager.receive(m);
              }else{
                  data.content = m.payload;
              }
              new_messages.push(data);
          }
          this.messages = this.messages.concat(new_messages);
          console.log(this.messages);
          this.last = (new Date()).getTime();
      },
      async send(){
          const id = this.$route.params.id;
          var message = this.message;
          var data = {
              payload: message,
          };
          if(this.room.private){
              const encrypted = await manager.encrypt(message);
              console.log(encrypted);
              if("pub" in encrypted) data.keys = [encrypted.pub];
              data.payload = encrypted.body;
          }
          axios.post("/api/v1/rooms/"+id+"/messages", data).then(res => {
              this.messages.push({
                  _id: res.data._id,
                  content: message,
                  user: res.data.user,
                  datetime: res.data.datetime
              });
              this.reload();
          });
      }
  }
}
</script>
