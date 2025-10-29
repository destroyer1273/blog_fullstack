<script setup>
import { ref } from "vue"
import HeaderComp from "@/components/header.vue"
import AuthModal from "@/components/AuthModal.vue"
import LoginModal from "@/components/LoginModal.vue"
import PostComp from "@/components/posts.vue"

const showRegisterModal = ref(false)
const showLoginModal = ref(false)

const openRegisterModal = () => {
  if(showLoginModal.value != true) {
    showRegisterModal.value = true
  }
} 
const openLoginModal = () => {
  if(showRegisterModal.value != true) {
    showLoginModal.value = true
  }
}

const closeLoginModal = () => {
  showLoginModal.value = false
}
const closeRegisterModal = () => {
  showRegisterModal.value = false
}
</script>

<template>
  <HeaderComp @open-register="openRegisterModal" @open-login="openLoginModal"/>
  <LoginModal :show="showLoginModal" @close="closeLoginModal"/>
  <AuthModal :show="showRegisterModal" @close="closeRegisterModal"/>
  <PostComp />
</template>

<style scoped></style>
