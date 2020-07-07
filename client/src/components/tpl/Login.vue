<template>
  <div id="login">
    <login-form/>
  </div>
</template>

<script>
import LoginForm from '../org/LoginForm.vue'

export default {
  name: 'Login',
  components: {
    LoginForm
  }
}
</script>

<style lang="scss" scoped>
#login{
    display:block;
    position:fixed;
    width:100vw;
    height:100vh;
    background: $main;
    padding-top:124px;
    color: #fff;
}
</style>
