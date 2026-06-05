import HomeView from '@/Views/HomeView.vue'
import LoginView from '@/Views/LoginView.vue'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useGoogleAuth } from '@/composables/useGoogleAuth.ts'

const { authenticated } = useGoogleAuth()

const routes : RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'login',
    beforeEnter: (to, from) => {
      if(authenticated.value) {
        return {name: 'home'}
      }
    },
    component: LoginView
  }
]

export const router = createRouter(
  {history: createWebHistory(), routes}
)

router.beforeEach((to, from) => {
  if(!authenticated.value && to.name !== 'login') {
    return {name: 'login'}
  }
})
