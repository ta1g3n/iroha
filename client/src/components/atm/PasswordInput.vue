<template>
    <div id="container">
        <input type="password" v-bind:placeholder="placeholder" v-bind:value="value">
    </div>
</template>
<script>
export default {
    name: "PasswordInput",
    props: ["placeholder", "value"]
}
</script>
<style lang="scss" scoped>
@import "@/assets/sass/input.scss";
</style>
