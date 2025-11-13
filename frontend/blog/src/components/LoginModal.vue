<script setup>
import {ref} from "vue"
import { useUserStore } from "@/stores/user"
import axios from "axios"

const userStore = useUserStore();

defineProps({
    show: Boolean
})
const toLoginData = ref({});

const user = ref();
const isLoading = ref(false);
const handleLogin = async () => {
    //Добавить валидацию email
    try {
        isLoading.value = true;
        const response = await axios.post("http://localhost:5001/api/auth/login", {email: toLoginData.value.email, password: toLoginData.value.password});
        user.value = response.data;
        
        localStorage.setItem("token", response.data.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;

        userStore.currentUser = user.value.user;
        localStorage.setItem("user", JSON.stringify(user.value.user));

        isLoading.value = false;
        emit('close');
    } catch (error) {
        console.log('Ошибка', error);
    }
}
const emit = defineEmits(['close'])
</script>

<template>
    <div v-if="show" class="modalWindow">
        <h3>Вход</h3>
        <p v-if="isLoading">Загрузка</p>
        <form @submit.prevent="handleLogin">
            <input v-model="toLoginData.email" type="text" placeholder="email">
            <input v-model="toLoginData.password" type="password" placeholder="Пароль">
            <button type="submit">Войти</button>
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