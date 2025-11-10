<script setup>
import {ref} from "vue"
import {useUserStore} from "@/stores/user.js"
import axios from "axios"

const userStore = useUserStore()
defineProps({
    show: Boolean
})

const toAuthData = ref({})

const handleAvatarUpload = (event) => {
    toAuthData.value.avatar = event.target.files[0];
} 

const toRegisterUser = async () => {
    try {
        const formData = new FormData();
        formData.append("email", toAuthData.value.email);
        formData.append("name", toAuthData.value.name);
        formData.append("password", toAuthData.value.password);
        if(toAuthData.value.avatar) {
            formData.append("avatar", toAuthData.value.avatar);
        }
        // {email: toAuthData.value.email, name: toAuthData.value.name, password: toAuthData.value.password}
        const response = await axios.post("http://localhost:5001/api/auth/register",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }
         );
        userStore.currentUser = response.data.user;
        localStorage.setItem('user', JSON.stringify(response.data.user));
        emit("close");
    } catch (error) {
        console.log("Ошибка регистрации", error);
    }
}

const emit = defineEmits(['close'])
</script>

<template>
    <div v-if="show" class="modalWindow">
        <h3>Регистрация</h3>
        <form @submit.prevent="toRegisterUser">
            <input v-model="toAuthData.email" type="email" placeholder="email">
            <input v-model="toAuthData.name" type="text" placeholder="имя">
            <input type="file" @change="handleAvatarUpload" accept="image/*">  
            <input v-model="toAuthData.password" type="text" placeholder="Пароль">
            <button type="submit">Зарегистрироваться</button>
        </form>
        <button @click="emit('close')" class="modalCloseBtn">X</button>
    </div>
</template>

<style scoped>
    .modalWindow {
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
    .modalCloseBtn {
        position: absolute;
        top: 10px;
        right: 10px;
        background-color: inherit;
        border: none;
        font-size: 20px;
    }
    .modalWindow form {
        display: flex;
        flex-direction: column;
    }
    .modalWindow input {
        padding: 10px 7px;
        border: 2px solid black;
        border-radius: 7px;
        margin-bottom: 15px;
    }
    .modalWindow form button {
        width: 50%;
        height: 30px;
        border-radius: 10px;
        align-self: center;
    }
</style>