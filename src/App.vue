<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { loadScript } from 'vue-plugin-load-script';

declare const google: any;

const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4'
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly'

const GAPIKey: string = import.meta.env.VITE_GOOGLE_API_KEY
const GClientId: string = import.meta.env.VITE_GOOGLE_CLIENT_ID

let tokenClient: any
let gapiInited: boolean = false
let gisInited: boolean = false

const authEnabled = ref(false)
const signoutEnabled = ref(false)
const content = ref()

function maybeEnableAuth(): void {
  if (gapiInited && gisInited) {
    authEnabled.value = true
  }
}

function handleAuthClick(): void {
  tokenClient.callback = async (response: any) => {
    if (response.error !== undefined) {
      throw response
    }
    signoutEnabled.value = true;
    await listMajors();
  }

  if (gapi.client.getToken() === null) {
    tokenClient.requestAccessToken({ prompt: 'consent' })
  } else {
    tokenClient.requestAccessToken({ prompt: '' })
  }
}

function handleSignOutClick(): void {
  const token = gapi.client.getToken()
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token)
    gapi.client.setToken('')
    signoutEnabled.value = false
  }
}

async function initializeGAPIClient(): Promise<void> {
  await gapi.client.init({
    apiKey: GAPIKey,
    discoveryDocs: [DISCOVERY_DOC],
  })
  gapiInited = true
  maybeEnableAuth()
}

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

onMounted(() => {
  loadScript('https://accounts.google.com/gsi/client').then(() => {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: GClientId,
      scope: SCOPES,
      callback: '',
    })
    gisInited = true
    maybeEnableAuth()
  })

  loadScript('https://apis.google.com/js/api.js').then(() => {
    gapi.load('client', initializeGAPIClient)
  })
})
</script>

<template>
  <header>
    <h1>SCAG Game Utility</h1>

    <button v-bind:disabled="!authEnabled" @click="handleAuthClick" id="auth-btn">
      {{ signoutEnabled ? 'Refresh' : 'Authorize' }}
    </button>
    <button v-bind:disabled="!signoutEnabled" @click="handleSignOutClick" id="signout-btn">
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
