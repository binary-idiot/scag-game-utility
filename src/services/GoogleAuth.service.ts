import {loadScript} from "vue-plugin-load-script";
import {computed, type Ref, ref} from "vue";

export interface IGoogleAuthService {
  GAPIKey: string;
  GClientId: string;
  GAppID: string;
  AuthEnabled: Ref<boolean>;
  Authenticated: Ref<boolean>;
  Initialize(): Promise<void>;
  Authenticate(OnAuth: () => void): void;
  SignOut(onSignOut: () => void): void;
  GetToken(): string | null;
}

export class GoogleAuthService implements IGoogleAuthService {
  private static instance: GoogleAuthService;
  private readonly DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
  private readonly SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly ';

  private TokenClient!: google.accounts.oauth2.TokenClient;
  private GapiInited: Ref<boolean> = ref(false);
  private GisInited: Ref<boolean> = ref(false);

  readonly GAPIKey: string = import.meta.env.VITE_GOOGLE_API_KEY;
  readonly GClientId: string = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  readonly GAppID: string = import.meta.env.VITE_GOOGLE_APP_ID;

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

  private onAuthCallback?: () => void;

  Authenticate(onAuth: () => void): void {
    this.onAuthCallback = onAuth;
    if (gapi.client.getToken() === null) {
      this.TokenClient.requestAccessToken({ prompt: 'consent' })
    } else {
      this.TokenClient.requestAccessToken({ prompt: '' })
    }
  }

  SignOut(onSignOut: () => void): void {
    const token = gapi.client.getToken()
    if (token !== null) {
      google.accounts.oauth2.revoke(token.access_token, onSignOut)
      gapi.client.setToken({
        access_token: '',
      })
      this.Authenticated.value = false
    }
  }

  GetToken(): string | null {
    return gapi.client.getToken()?.access_token ?? null;
  }

  private async initializeGIS(){
    await loadScript('https://accounts.google.com/gsi/client');
    this.TokenClient = google.accounts.oauth2.initTokenClient({
      client_id: this.GClientId,
      scope: this.SCOPES,
      callback: (tokenResponse: google.accounts.oauth2.TokenResponse) => {
        if (tokenResponse.error !== undefined) {
          throw tokenResponse
        }
        this.Authenticated.value = true;
        if (this.onAuthCallback) {
          this.onAuthCallback();
          this.onAuthCallback = undefined;
        }
      },
    })
    this.GisInited.value = true;
  }

  private async initializeGAPI(){
    await loadScript('https://apis.google.com/js/api.js');
    return new Promise<void>((resolve) => {
      gapi.load('client', async () => {
        await gapi.client.init({
          apiKey: this.GAPIKey,
          discoveryDocs: [this.DISCOVERY_DOC],
        })
        this.GapiInited.value = true;
        resolve();
      })
    })
  }

}
