import { loadScript } from 'vue-plugin-load-script'
import { computed, ref } from 'vue'

const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4'
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/drive.readonly'

const gapiInited = ref(false)
const gisInited = ref(false)
const authenticated = ref(false)
let tokenClient: google.accounts.oauth2.TokenClient
let onAuthCallback: (() => void) | undefined

const GAPIKey: string = import.meta.env.VITE_GOOGLE_API_KEY
const GClientId: string = import.meta.env.VITE_GOOGLE_CLIENT_ID
const GAppID: string = import.meta.env.VITE_GOOGLE_APP_ID

const authEnabled = computed(() => gapiInited.value && gisInited.value)

async function initializeGIS() {
  await loadScript('https://accounts.google.com/gsi/client')
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: GClientId,
    scope: SCOPES,
    callback: (tokenResponse: google.accounts.oauth2.TokenResponse) => {
      if (tokenResponse.error !== undefined) {
        throw tokenResponse
      }
      authenticated.value = true
      if (onAuthCallback) {
        onAuthCallback()
        onAuthCallback = undefined
      }
    },
  })
  gisInited.value = true
}

async function initializeGAPI() {
  await loadScript('https://apis.google.com/js/api.js')
  return new Promise<void>((resolve) => {
    gapi.load('client', async () => {
      await gapi.client.init({
        apiKey: GAPIKey,
        discoveryDocs: [DISCOVERY_DOC],
      })
      gapiInited.value = true
      resolve()
    })
  })
}

export function useGoogleAuth() {
  async function initialize() {
    if (!gisInited.value) {
      await initializeGIS()
    }
    if (!gapiInited.value) {
      await initializeGAPI()
    }
  }

  function authenticate(onAuth: () => void) {
    onAuthCallback = onAuth
    if (gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' })
    } else {
      tokenClient.requestAccessToken({ prompt: '' })
    }
  }

  function signOut(onSignOut: () => void) {
    const token = gapi.client.getToken()
    if (token !== null) {
      google.accounts.oauth2.revoke(token.access_token, onSignOut)
      gapi.client.setToken({ access_token: '' })
      authenticated.value = false
    }
  }

  function getToken(): string | null {
    return gapi.client.getToken()?.access_token ?? null
  }

  return {
    GAPIKey,
    GClientId,
    GAppID,
    authEnabled,
    authenticated,
    initialize,
    authenticate,
    signOut,
    getToken,
  }
}
