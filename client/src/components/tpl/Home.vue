<template>
  <div id="home">
      <v-app-bar dark app>
          <v-toolbar-title>ルーム一覧</v-toolbar-title>
      </v-app-bar>
      <v-main>
          <div>
              <router-link to="/room/create">
                  <button>
                      部屋を作成
                  </button>
              </router-link>
              <ul>
                  <li v-for="room in rooms" v-bind:key="room._id">
                      <router-link :to="{name: 'retrieveRoom', params: { id: room._id }}">
                          <h4>{{room.name}}</h4>
                          <p>{{room.description}}</p>
                      </router-link>
                  </li>
              </ul>
          </div>
      </v-main>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: 'Home',
  data(){
    return {
      rooms:[]
    }
  },
  mounted(){
      this.getList();
  },
  methods: {
      async getList(){
          const rooms = await axios.get("/api/v1/rooms");
          this.rooms = rooms.data;
      }
  }
}
</script>
