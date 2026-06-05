<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useGoogleAuth } from '@/composables/useGoogleAuth.ts'
import { type Router, useRouter } from 'vue-router'

const router: Router = useRouter()
const { authEnabled, authenticated, initialize, signOut } = useGoogleAuth()

const appLoaded = ref(false)

async function handleSignOutClick() {
  signOut(() => {
    router.push('/login')
  })
}

onMounted(() => {
  initialize().then(() => {
    appLoaded.value = true
  })
})
</script>

<template>
  <header>
    <h1>SCAG Game Utility</h1>
    <button
      v-if="authEnabled && authenticated"
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
