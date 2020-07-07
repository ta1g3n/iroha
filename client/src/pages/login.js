import Vue from 'vue'
import Login from './../components/tpl/Login.vue'
//import axios from "axios";
//import VueAxios from "vue-axios";

require("@/assets/sass/main.scss");

Vue.config.productionTip = false;

new Vue({
    render: h => h(Login)
}).$mount('#app');
