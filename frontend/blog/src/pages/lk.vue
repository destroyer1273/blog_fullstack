<script setup>
import { useUserStore } from '@/stores/user'
import { ref, onMounted } from "vue"
import axios from 'axios';
import router from '@/router';
import defaultAvatar from "@/assets/zaglushka.png";
const userStore = useUserStore()
const toDeAuth = () => {
    localStorage.removeItem('user');
    userStore.currentUser = {};
    router.push('/');
}
const post = ref({})
const allPosts = ref([]);
const toMakePost = async () => {
    try {
        const response = await axios.post("http://localhost:5001/api/posts/create", {title: post.value.title, content: post.value.content, authorId: userStore.currentUser.id});
        console.log(response);
    } catch(error) {
        console.log("Ошибка: ", error);
    }
}

const getUserPosts = async () => {
    try {
        const response = await axios.get("http://localhost:5001/api/posts/userPosts", { params: {userId: userStore.currentUser.id}});
        allPosts.value = response.data.posts
        console.log(allPosts.value);
    } catch(error) {
        console.log("Ошибка: ", error);
    }
}

onMounted(() => {
    console.log(userStore.currentUser.id);
    getUserPosts();
});
</script>

<template>
<div class="header__container">
    <h1>Личный кабинет</h1>
    <router-link to="/">На главную</router-link>
    <button @click="toDeAuth" class="button1">Выйти</button>
</div>
<div class="userInfo">
    <div>
        <img :src="defaultAvatar" alt="avatar" class="user-avatar">
        <p>{{ userStore.currentUser.name }}</p>
    </div>
</div>
<div class="main_cont">
    <div class="form-cont">
        <p>Создать пост</p>
        <form @submit.prevent="toMakePost">

            <input v-model="post.title" type="text" placeholder="Название поста" class="form1">
            <textarea v-model="post.content" placeholder="Текст поста..." rows="6" class="textarea"></textarea>
            <div class="image-upload">
                <label for="image-upload" class="upload-table">
                    Добавить изображение
                </label>
                <input id="image-upload" type="file" @change="handleImageUpload" accept="image/*" class="file-input">
                
                <div v-if="imagePreview" class="image-preview">
                    <img :src="imagePreview" alt="Preview">
                    <button type="button" @click="removeImage" class="remove-btn">X</button>
                </div>
            </div>
            <button type="submit">Создать пост</button>

        </form>
    </div>
    <div class="posts-list">
        <p>Ваши посты</p>
        <p v-if="allPosts == 0">Вы ещё не добавили ни одного поста :(</p>
        <ul v-else>
            <li v-for="item in allPosts">{{ item.title }}</li>
        </ul>
    </div>
</div>
</template>

<style>
    .main_cont {
        padding: 2px 20px;
        display: grid;
        grid-template-columns: repeat(8, 1fr);
    }
    .header__container {
    display: flex;
    align-items: center;
    padding: 10px 20px;
    justify-content: space-between;
    background-color: #f2e6fa;
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
        grid-column: 1/5;
    }
    .posts-list {
        grid-column: 6/9;
    }
    .posts-list ul {
        list-style-type: none;
        padding-left: 0;
    }
    .posts-list li  {
        margin-bottom: 20px;
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
    .user-avatar {
        width:35px;
        height: 35px;
        margin-right: 20px;
    }
    .userInfo {
        padding: 5px 20px;
        border-bottom: 2px solid #a3a3a3;
    }
    .userInfo div {
        display: flex;
        flex-direction: row;
        align-items: center;
    }
</style>