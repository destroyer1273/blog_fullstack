<script setup>
import { useUserStore } from '@/stores/user'
import { ref } from "vue"
import axios from 'axios';
import router from '@/router';
const userStore = useUserStore()
const toDeAuth = () => {
    localStorage.removeItem('user');
    userStore.currentUser = {};
    router.push('/');
}
const post = ref({})

const toMakePost = async () => {
    try {
        const response = await axios.post("http://localhost:5001/api/posts/create", {title: post.value.title, content: post.value.content, authorId: userStore.currentUser.id});
        console.log(response);
    } catch(error) {
        console.log("Ошибка: ", error);
    }
}
</script>

<template>
<div class="header__container">
    <h1>Личный кабинет</h1>
    <router-link to="/">На главную</router-link>
    <button @click="toDeAuth" class="button1">Выйти</button>
</div>
<div class="main_cont">
    <div class="form-cont">
        <form @submit.prevent="toMakePost">
            <input v-model="post.title" type="text" placeholder="Название поста" class="form1">
            <textarea v-model="post.content" placeholder="Текст поста..." rows="6" class="textarea"></textarea>
            <button type="submit">Создать пост</button>
        </form>
    </div>
</div>
</template>

<style>
    .main_cont {
        padding: 10px 20px;
        display: grid;
        grid-template-columns: repeat(8, 1fr);
    }
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
    .form-cont {
        grid-column: 1/3;
    }
    .form-cont form{
        display: flex;
        flex-direction: column;
    }
    .form-cont form input {
        margin-bottom: 15px;
        border: 1.5px solid #0a2f09;
        padding: 10px 15px;
        border-radius: 10px;
    }
    .form-cont form button {
        background-color: rgb(105, 105, 210);
        color: #0a2f09;
        padding: 10px 15px;
        border: none;
        border-radius: 10px;
    }
    .textarea {
        resize: none;
        margin-bottom: 15px;
        border-radius: 10px;
        padding: 10px 15px;
        border: 1.5px solid #0a2f09;
    }
    .form-cont form button:hover {
        background-color: rgb(79, 79, 158);
    }
    .form-cont form button:active {
        background-color: rgb(136, 136, 240);
    }
</style>