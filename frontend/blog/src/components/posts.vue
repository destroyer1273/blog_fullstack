<script setup>
import { ref, onMounted } from 'vue'
import axios from "axios"

const posts = ref([])
const loading = ref(false)

const getAllPosts = async () => {
    try {
        const response = await axios.get("http://localhost:5001/api/posts");
        posts.value = response.data;
        
        
    } catch (error) {
        console.log("Ошибка загрузки постов", error);
    }
}

onMounted(() => {
    getAllPosts()
})
</script>

<template>
    <div class="posts-container">
        <div v-for="item in posts" class="post">
            <img v-if="item.image_url" :src="`http://localhost:5001${item.image_url}`" alt="КРутое" class="post-image">
            <div class="post-bottom">
                <div class="posts-title-cont">
                    <h3>{{ item.title }}</h3>
                    <p>Автор: {{ item.username }}</p>
                </div>
                <p class="content-p">{{ item.content }}</p>
                
            </div>
        </div>
    </div>
</template>

<style scoped>
.posts-container {
    margin: 0 auto;
    width: 70%;
}
.posts-title-cont {
    max-width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
}
.post {
    display: flex;
    flex-direction: column;
    margin-bottom: 30px;
    border: 1px solid #3e3;
    padding: 10px 10px;
}
.content-p {
    margin: 0;
}
.post-bottom {
    padding: 0 10px 10px 10px;
    width: 100%;
}
.blue {
    background-color: blue;
    height: 300px;
}
.post-image {
    max-width: 500px;
}
</style>