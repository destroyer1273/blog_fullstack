import { createRouter, createWebHistory } from 'vue-router'
import lk from "@/pages/lk.vue"
import HomePage from "@/pages/HomePage.vue"
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage
    },
    {
      path: '/lk',
      name: "lk",
      component: lk
    }
  ],
})

export default router
