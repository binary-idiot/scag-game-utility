import {loadScript} from "vue-plugin-load-script";
import {computed, type Ref, ref} from "vue";

export interface GoogleAuthService {
  AuthEnabled: Ref<boolean>;
  Authenticated: Ref<boolean>;
  Initialize(): Promise<void>;
  Authenticate(OnAuth: () => void): void;
  SignOut(): void;
}

export class GoogleAuthService implements GoogleAuthService {
  private static instance: GoogleAuthService;
  private readonly DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
  private readonly SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly';

  private readonly GAPIKey: string = import.meta.env.VITE_GOOGLE_API_KEY;
  private readonly GClientId: string = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  private TokenClient: google.accounts.oauth2.TokenClient;
  private GapiInited: Ref<boolean> = ref(false);
  private GisInited: Ref<boolean> = ref(false);

  AuthEnabled: Ref<boolean> = computed(() => this.GapiInited.value && this.GisInited.value);
  Authenticated: Ref<boolean> = ref(false);

  constructor() {
    if (GoogleAuthService.instance) {
      return GoogleAuthService.instance;
    }
    GoogleAuthService.instance = this;
  }

  async Initialize() {
    if(!this.GisInited.value) {
      await this.initializeGIS();
    }

    if(!this.GapiInited.value) {
      await this.initializeGAPI();
    }
  }

  Authenticate(OnAuth: () => void): void {
    this.TokenClient.callback = async (response: { error: undefined; }) => {
      if (response.error !== undefined) {
        throw response
      }
      this.Authenticated.value = true;
      OnAuth();
    }

    if (gapi.client.getToken() === null) {
      this.TokenClient.requestAccessToken({ prompt: 'consent' })
    } else {
      this.TokenClient.requestAccessToken({ prompt: '' })
    }
  }

  SignOut(): void {
    const token = gapi.client.getToken()
    if (token !== null) {
      google.accounts.oauth2.revoke(token.access_token)
      gapi.client.setToken('')
      this.Authenticated.value = false
    }
  }

  private async initializeGIS(){
    await loadScript('https://accounts.google.com/gsi/client');
    this.TokenClient = google.accounts.oauth2.initTokenClient({
      client_id: this.GClientId,
      scope: this.SCOPES,
      callback: '',
    })
    this.GisInited.value = true;
  }

  private async initializeGAPI(){
    await loadScript('https://apis.google.com/js/api.js');
    gapi.load('client', async () => {
      await gapi.client.init({
        apiKey: this.GAPIKey,
        discoveryDocs: [this.DISCOVERY_DOC],
      })
      this.GapiInited.value = true
    })
  }

}
