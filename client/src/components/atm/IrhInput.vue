<template>
    <div id="container">
        <input v-bind:type="type" v-bind:placeholder="placeholder" v-bind:value="value__" v-on:change="change">
    </div>
</template>
<script>
export default {
    name: "Input",
    props: ["type", "placeholder", "value"],
    data(){
        return {
            value__: this.value
        }
    },
    methods: {
        change(){
            console.log(this.value__);
            //const e = new Event("change");
            //this.dispatchEvent(e);
        }
    }
}
</script>
<style lang="scss" scoped>
@import "@/assets/sass/input.scss";
</style>
