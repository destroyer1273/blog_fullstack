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
const allPosts = ref([]);

const post = ref({})

const handleImageUpload = (event) => {
  post.value.image = event.target.files[0]
}

const toMakePost = async () => {
  try {
    const formData = new FormData()
    formData.append('title', post.value.title)
    formData.append('content', post.value.content)
    formData.append('authorId', userStore.currentUser.id)
    
    if (post.value.image) {
      formData.append('image', post.value.image)
    }

    const response = await axios.post(
      "http://localhost:5001/api/posts/create", 
      formData,
      { 
        headers: { 
          'Content-Type': 'multipart/form-data' 
        } 
      }
    )
    
    console.log("Пост создан:", response.data)
    await getUserPosts();
    
    post.value = { title: '', content: '', image: null }
    document.querySelector('#image-upload').value = ''
    
  } catch(error) {
    console.log("Ошибка: ", error)
  }
}

const isModalOpen = ref(false);
const postToEdit = ref({});
const toOpenModal = (post) => {
    isModalOpen.value = true;
    postToEdit.value = post;
    console.log(postToEdit.value);
}
const toCloseModal = () => {
    isModalOpen.value = false;
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

const imageUpload = (event) => {
    postToEdit.value.image = event.target.files[0];
}

const toEditPost = async () => {
    try {
        const formData = new FormData();
        formData.append('title', postToEdit.value.title);
        formData.append('content', postToEdit.value.content);
        formData.append('author_id', postToEdit.value.author_id);
        formData.append('post_id', postToEdit.value.id);
        if(postToEdit.value.image) {
            formData.append("image", postToEdit.value.image);
        }
        
        const response = await axios.post("http://localhost:5001/api/posts/edit", 
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        )
        await getUserPosts();

        post.value = { title: '', content: '', image: null }
        document.querySelector('#image-upload').value = ''
    } catch (error) {
        console.log(error);
    }
}

// EDIT USER EDIT USER EDIT USER EDIT USER EDIT USER EDIT USER EDIT USER EDIT USER EDIT USER EDIT USER EDIT USER EDIT USER

const isUserModalOpen = ref(false);
const toOpenUserModal = () => {
    isUserModalOpen.value = true;
}
const toCloseUserModal = () => {
    isUserModalOpen.value = false;
}

const editImageUpload = (event) => {
    userEditData.value.avatar = event.target.files[0];
}

const toEditUser = async () => {
    try {
        const formData = new FormData();
        formData.append('newName', userEditData.value.name);
        formData.append("user_id", userEditData.value.user_id);
        if(userEditData.value.avatar) {
            formData.append("avatar", userEditData.value.avatar);
        }

        const response = await axios.post("http://localhost:5001/api/user/edit",
            formData,
            {
                headers: {
                    "Content-Type": 'multipart/form-data'
                }
            }
        );
        userStore.currentUser = response.data.user
        localStorage.setItem('user', JSON.stringify(response.data.user))
        toCloseUserModal();
    } catch (error) {
        console.log("Ошибка: ", error);
    }
}
const userEditData = ref({
    user_id: userStore.currentUser.id,
    name: '', 
    avatar: null
});

// EDIT USER EDIT USER EDIT USER EDIT USER EDIT USER EDIT USER EDIT USER EDIT USER EDIT USER EDIT USER EDIT USER EDIT USER
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
        <img v-if="userStore.currentUser.avatar_url" :src="`http://localhost:5001${userStore.currentUser.avatar_url}`" alt="Аватарка" class="user-avatar">
        <img v-else :src="defaultAvatar" alt="avatar" class="user-avatar">
        <p>{{ userStore.currentUser.username }}</p>
        <button class="user-edit-btn" @click="toOpenUserModal">Редактировать</button>
    </div>
    <div v-if="isUserModalOpen" class="modalToEdit">
            <button @click="toCloseUserModal" class="modalCloseBtn">X</button>
            <form @submit.prevent="toEditUser" class="edit-form">
                <label for="nameEdit">Имя</label>
                <input v-model="userEditData.name" type="text" id="nameEdit" :placeholder="userStore.currentUser.username">
                <input type="file" @change="editImageUpload" accept="image/*" > 
                <button type="submit">Применить редактирование</button>
            </form>
    </div>
</div>
<div class="main_cont">
    <div class="form-cont">
        <p>Создать пост</p>
        <form @submit.prevent="toMakePost">

            <input v-model="post.title" type="text" placeholder="Название поста" class="form1">
            <textarea v-model="post.content" placeholder="Текст поста..." rows="6" class="textarea"></textarea>
            <input type="file" @change="handleImageUpload" accept="image/*" id="image-upload">
            
            <button type="submit">Создать пост</button>

        </form>
    </div>
    <div class="posts-list">
        <p>Ваши посты</p>
        <p v-if="allPosts.length === 0">Вы ещё не добавили ни одного поста :(</p>
        <ul v-else>
            <li v-for="item in allPosts">
                <div class="post">
                    <div>
                        <p>{{ item.title }}</p>
                        <p>{{ item.content }}</p>
                    </div>
                    <button @click="toOpenModal(item)">Редактировать</button>
                </div>
            </li>
        </ul>
        <div v-if="isModalOpen" class="modalToEdit">
            <button @click="toCloseModal" class="modalCloseBtn">X</button>
            <form @submit.prevent="toEditPost" class="edit-form">
                <label for="name">Название:</label>
                <input v-model="postToEdit.title" type="text" id="name" :placeholder="postToEdit.title">
                <label for="content">Содержание поста:</label>
                <textarea v-model="postToEdit.content" id="content" :placeholder="postToEdit"></textarea>
                <input type="file" @change="imageUpload" accept="image/*">
                <button type="submit">Применить редактирование</button>
            </form>
        </div>
    </div>
</div>
</template>

<style>
    .modalToEdit {
        position: absolute;
        width: 300px;
        height: 400px;
        left: 50%;
        right: 50%;
        top: 50%;
        bottom: 50%;
        border: 1px solid black;
        transform: translate(-50%, -50%);
        border-radius: 20px;
        padding: 30px 30px;
        background-color: white;
    }
    .edit-form {
        display: flex;
        flex-direction: column;
    }
    .edit-form input {
        padding: 10px 7px;
        border: 2px solid black;
        border-radius: 7px;
        margin-bottom: 15px;
    }
    .edit-form textarea {
        resize: none;
        margin-bottom: 15px;
        border-radius: 10px;
        padding: 10px 15px;
        border: 2px solid black;
    }
    .edit-form button {
        background-color: rgb(105, 105, 210);
        color: #0a2f09;
        padding: 10px 15px;
        border: none;
        border-radius: 10px;
    }
    .edit-form button:hover {
        background-color: rgb(90, 90, 180);
    }
    .edit-form button:active {
        background-color: rgb(53, 53, 121);
    }
    .edit-form label {
        margin-bottom: 10px;
    }
    .modalCloseBtn {
        position: absolute;
        top: 10px;
        right: 10px;
        background-color: inherit;
        border: none;
        font-size: 20px;
    }
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
    .post {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        border: 2px solid black;
        border-radius: 10px;
        padding: 5px 10px;
    }
    .post button {
        width: 120px;
        height: 30px;
        border: none;
        border-radius: 20px;
        background-color: rgb(105, 105, 210);
        color: #0a2f09;
    }
    .post button:hover {
        background-color: rgb(93, 93, 191);
    }
    .post button:active {
        background-color: rgb(63, 63, 134);
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
    .userInfo div p {
        margin-right: 20px;
    }
    .user-edit-btn {
        width: 120px;
        height: 30px;
        border: none;
        border-radius: 20px;
        background-color: rgb(105, 105, 210);
        color: #0a2f09;
    }
    .user-edit-btn:hover {
        background-color: rgb(79, 79, 158);
    }
    .user-edit-btn:active {
        background-color: rgb(136, 136, 240);
    }
</style>