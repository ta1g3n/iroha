import Vue from 'vue'
import Signup from '../components/tpl/Signup.vue'
//import axios from "axios";
//import VueAxios from "vue-axios";

require("@/assets/sass/main.scss");

Vue.config.productionTip = false;

new Vue({
    render: h => h(Signup)
}).$mount('#app');
