<script setup lang="ts">
import { type Router, useRouter } from 'vue-router'
import { GoogleAuthService } from '@/services/GoogleAuth.service.ts'

const router: Router = useRouter()
const googleAuthService: GoogleAuthService = new GoogleAuthService()
async function handleAuthClick() {
  googleAuthService.Authenticate(onAuthenticated)
}

function onAuthenticated() {
  router.push('/')
}
</script>

<template>
  <button @click="handleAuthClick">Sign In</button>
</template>

<style scoped></style>
