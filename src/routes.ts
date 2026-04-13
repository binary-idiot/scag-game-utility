import HomeView from '@/Views/HomeView.vue'
import LoginView from '@/Views/LoginView.vue'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { GoogleAuthService } from '@/services/GoogleAuth.service.ts'

const googleAuthService: GoogleAuthService = new GoogleAuthService();

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
      if(googleAuthService.Authenticated.value) {
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
  if(!googleAuthService.Authenticated.value && to.name !== 'login') {
    return {name: 'login'}
  }
})
