<script setup>
import { useUserStore } from '@/stores/user'
const user = useUserStore();
const emit = defineEmits(['open-register', 'open-login'])
const openRegister = () => {
    emit('open-register')
}
const openLogin = () => {
    emit('open-login')
}
</script>

<template>
  <div class="header__container">
    <h1>Блог!</h1>
    <router-link v-if="user.currentUser.id" to="/lk">личный кабинет</router-link>
    <div class="button-cont">
        <button @click="openRegister" class="button1">Зарегистрироваться</button>
        <button @click="openLogin" class="button2">Войти</button>
    </div>  
  </div>
</template>

<style scoped>
.header__container {
    display: flex;
    align-items: center;
    padding: 10px 20px;
    justify-content: space-between;
    margin-bottom: 40px;
}
.button1 {
    margin-right: 30px;
    padding: 10px 15px;
    border: none;
    border-radius: 20px;
    background-color: rgb(105, 105, 210);
    color: #0a2f09;
}
.button2 {
    padding: 10px 15px;
    border: none;
    border-radius: 20px;
    background-color: rgb(105, 105, 210);
    color: #0a2f09;
}
</style>
