<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {  GoogleAuthService } from "@/services/GoogleAuth.service.ts";

const content = ref()
const googleAuthService: GoogleAuthService = new GoogleAuthService();

async function listMajors(): Promise<void> {
  let response;
  try {
    // Fetch first 10 files
    response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
      range: 'Class Data!A2:E',
    });
  } catch (err: any) {
    content.value = err.message;
    return;
  }
  const range = response.result;
  if (!range || !range.values || range.values.length == 0) {
    content.value = 'No values found.';
    return;
  }
  // Flatten to string to display
  const output = range.values.reduce(
    (str, row) => `${str}${row[0]}, ${row[4]}\n`,
    'Name, Major:\n');
  content.value = output;
}

async function handleAuthClick() {
  googleAuthService.Authenticate(listMajors);
}

async function handleSignOutClick() {
  googleAuthService.SignOut();
}

onMounted(() => {
  googleAuthService.Initialize()
})
</script>

<template>
  <header>
    <h1>SCAG Game Utility</h1>

    <button v-bind:disabled="!googleAuthService.AuthEnabled.value" @click="handleAuthClick" id="auth-btn">
      {{ googleAuthService.Authenticated.value ? 'Refresh' : 'Authorize' }}
    </button>
    <button v-bind:disabled="!(googleAuthService.AuthEnabled.value && googleAuthService.Authenticated.value)" @click="handleSignOutClick" id="signout-btn">
      SignOut
    </button>
  </header>

  <main>
    {{ content }}
  </main>
</template>

<style scoped>
header {
  padding: 20px;
}
</style>
