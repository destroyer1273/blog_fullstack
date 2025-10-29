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
            <!-- <img src="" alt="КРутое"> -->
            <div class="blue">FOTOS Lorem ipsum dolor sit, amet consectetur adipisicing elit. Explicabo voluptatum nemo aut. Deserunt sunt, officiis mollitia culpa, fugiat amet ipsa odio voluptates, obcaecati consequatur esse sed possimus quae autem nihil.</div>
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
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
}
.post {
    margin-bottom: 30px;
    border: 1px solid #3e3;
}
.content-p {
    margin: 0;
}
.post-bottom {
    padding: 0 10px 10px 10px;
}
.blue {
    background-color: blue;
    height: 300px;
}
</style>