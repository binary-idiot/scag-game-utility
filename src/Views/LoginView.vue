<script setup lang="ts">
import { type Router, useRouter } from 'vue-router'
import { useGoogleAuth } from '@/composables/useGoogleAuth.ts'

const router: Router = useRouter()
const { authenticate } = useGoogleAuth()
async function handleAuthClick() {
  authenticate(onAuthenticated)
}

function onAuthenticated() {
  router.push('/')
}
</script>

<template>
  <button @click="handleAuthClick">Sign In</button>
</template>

<style scoped></style>
