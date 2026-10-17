import type { CapacitorConfig } from '@capacitor/cli';

/* Wraps the existing Vite client (dist/) as an Android app.
   The web app is unchanged; Supabase, Stripe checkout and profiles run exactly as in the browser. */
const config: CapacitorConfig = {
  appId: 'com.streamflix.app',
  appName: 'StreamFlix',
  webDir: 'dist',
  backgroundColor: '#070b1a',
  server: {
    // The app is served from https://localhost inside the phone.
    androidScheme: 'https',
  },
  android: {
    // Lets the app call a backend on your Wi-Fi (http://192.168.x.x:4000) while testing.
    // Turn this off once the backend is deployed on https.
    allowMixedContent: true,
    backgroundColor: '#070b1a',
  },
};

export default config;
