<script setup lang="ts">
import { onMounted, type Ref, ref } from 'vue'
import { GoogleAuthService } from '@/services/GoogleAuth.service.ts'
import { type Router, useRouter } from 'vue-router'

const router: Router = useRouter()
const googleAuthService: GoogleAuthService = new GoogleAuthService();

const appLoaded: Ref<boolean> = ref(false)

async function handleSignOutClick() {
  googleAuthService.SignOut(() => {
    router.push('/login')
  })
}

onMounted(() => {
  googleAuthService.Initialize().then(() => {
    appLoaded.value = true
  })
})
</script>

<template>
  <header>
    <h1>SCAG Game Utility</h1>
    <button
      v-if="googleAuthService.AuthEnabled.value && googleAuthService.Authenticated.value"
      @click="handleSignOutClick"
      id="signout-btn"
    >
      SignOut
    </button>
  </header>

  <main>
    <RouterView v-if="appLoaded"></RouterView>
  </main>
</template>

<style scoped>
header {
  padding: 20px;
}
</style>
