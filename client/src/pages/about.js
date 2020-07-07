import Vue from 'vue'
import About from './../components/tpl/About.vue'

require("@/assets/sass/main.scss");

Vue.config.productionTip = false;
new Vue({
    render: h => h(About)
}).$mount('#app');
