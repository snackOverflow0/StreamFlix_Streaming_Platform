# StreamFlix Android app (APK): build guide

The phone app is your existing **client** app, wrapped with Capacitor. Nothing was rewritten.

Supabase login, profiles, Kids mode, My List, Continue Watching, ratings, Merch and Stripe all run the same code as the website.

## What was added
| File | Purpose |
|---|---|
| `client/capacitor.config.ts` | App name **StreamFlix**, id `com.streamflix.app`, dark background |
| `client/assets/*.png` | App icon (owl logo) and splash screen sources |
| `client/.env.mobile.example` | Where the phone app finds your backend |
| `client/package.json` | Capacitor packages and the `build:mobile`, `android` and `android:icons` scripts |
| `client/vite.config.ts` | Adds your backend address to the page's security policy for mobile builds |

## One-time setup (about 30 minutes, mostly downloads)
1. Install **Android Studio** (developer.android.com/studio). Open it once and let it finish installing the Android SDK.
2. Make sure you have **Node 22**: run `node -v` to check.

## Step 1: Let the phone reach your backend
A phone can't use "localhost" on your computer. Pick one option.

**Option A, same Wi-Fi (good for the defense demo)**
1. Find your computer's Wi-Fi IP: run `ipconfig` on Windows and look for the IPv4 address, e.g. `192.168.1.23`.
2. In `backend/.env`, add or change these lines:
   ```
   HOST=0.0.0.0
   FRONTEND_URL=http://localhost:5173,https://localhost
   ```
   `https://localhost` is the app's own address inside the phone. Your backend's CORS check needs it.
3. Restart the backend. If Windows asks, allow Node through the firewall on private networks.

**Option B, deployed backend (works anywhere)**
1. Deploy the backend to Render or Railway.
2. Add `https://localhost` to `FRONTEND_URL` there too.

## Step 2: Point the app at the backend
```
cd client
copy .env.mobile.example .env.mobile      (Mac/Linux: cp .env.mobile.example .env.mobile)
```
Edit `.env.mobile` and set `VITE_API_URL`, e.g. `http://192.168.1.23:4000/api`.

## Step 3: Build the Android project
```
cd client
npm install
npx cap add android          (first time only)
npm run android:icons        (first time only; creates the icon and splash)
npm run build:mobile         (run again every time you change the app)
npm run android              (opens Android Studio)
```

## Step 4: Make the APK
In Android Studio, choose **Build → Build App Bundle(s) / APK(s) → Build APK(s)**.

When it finishes, click **locate**. The file is:
`client/android/app/build/outputs/apk/debug/app-debug.apk`

Send that file to your phone (Google Drive, Messenger, USB) and open it. Allow "Install unknown apps" when Android asks.

To test faster, plug in your phone with USB debugging on and press the green **Run ▶** button.

## Good to know
- **Sign in with email and password inside the app.** Google blocks its sign-in page inside apps (error "disallowed_useragent"). Google login keeps working on the website.
- **Stripe checkout** opens in the phone's browser. After paying, go back to the app: the subscription is confirmed by your backend webhook as usual.
- `allowMixedContent: true` in `capacitor.config.ts` is only there so Option A (http on Wi-Fi) works. Set it to `false` once you use an `https` backend.
- This is a **debug APK**, fine for demos and classmates. A Play Store release needs a signed build: **Build → Generate Signed Bundle / APK**.

## If something goes wrong
| Symptom | Fix |
|---|---|
| App opens but shows "Failed to fetch" or no titles | Check that `VITE_API_URL` is your computer's IP, `HOST=0.0.0.0` is set, the phone is on the same Wi-Fi, and the firewall allows Node |
| CORS error in Logcat | Add `https://localhost` to `FRONTEND_URL` in `backend/.env` and restart the backend |
| Old version still showing | Run `npm run build:mobile` again before building the APK |
| `npx cap` not found | Run `npm install` inside `client/` first |
