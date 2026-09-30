# Chat App Mobile

Standalone React Native application for the Chat App. Registration includes a unique username. The Profile & Settings screen lets users update their username, display name, bio, online-status privacy, and system/light/dark theme preference. It also supports username search, direct chats, real-time messaging, replies, reactions, deletion, presence, typing indicators, receipts and unread counts.

## Stack

React Native CLI, TypeScript, Redux Toolkit, RTK Query, React Navigation and Socket.IO Client.

## Structure

```text
src/       Application source
android/   Native Android project
ios/       Native iOS project
scripts/   Local device checks and launch helpers
```

## First-time setup

Install Node.js 24, Java 17 and Android Studio/SDK, then run:

```bash
corepack yarn install --immutable
```

If `android/app/debug.keystore` is absent, create the local debug key before the first Android build:

```bash
keytool -genkeypair -v -storetype JKS -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
```

The backend must be running at `http://127.0.0.1:4000`.

## Run on an Android phone

Terminal 1:

```bash
corepack yarn start
```

Terminal 2:

```bash
adb devices
adb reverse tcp:4000 tcp:4000
adb reverse tcp:8081 tcp:8081
corepack yarn android:local
```

Keep the phone connected by USB with USB debugging enabled.

After signing in, open **Profile** from the Chats screen to edit profile and application settings. Email is read-only because changing it requires a separate verification flow.

## Verify

```bash
corepack yarn format:check
corepack yarn lint
corepack yarn typecheck
corepack yarn test
```

The iOS application requires macOS and Xcode. Run it using `corepack yarn ios:local`.

## Environment selection

All mobile environment values live in the root `.env`. `src/config/environment.ts`
only exposes those values to the app; it contains no environment-specific settings.
Gradle, Babel and Metro files remain necessary build tooling.

```dotenv
# Dev
APP_ENV=development
API_BASE_URL=http://127.0.0.1:4000
SOCKET_BASE_URL=http://127.0.0.1:4000

# Prod
# APP_ENV=production
# API_BASE_URL=https://chat-app-backend-2s97.onrender.com
# SOCKET_BASE_URL=https://chat-app-backend-2s97.onrender.com
```

For local work, leave Dev uncommented and Prod commented. The local address works
with the USB `adb reverse` commands above. For an Android emulator without reverse,
use `http://10.0.2.2:4000`; for a phone over Wi-Fi, use your computer's LAN address.

For a production APK, comment all three Dev assignments and uncomment all three
Prod assignments, then run from PowerShell:

```powershell
cd android
.\gradlew.bat assembleRelease
```

The APK is written to `android/app/build/outputs/apk/release/app-release.apk`.
The existing release configuration uses the debug signing key.

After changing `.env`, stop Metro and restart with `corepack yarn start --reset-cache`.
Rebuild an APK to apply new values. Selection is manual; a release build does not
switch sections automatically. Both sections active, missing values, and insecure
production URLs fail bundling. Release apps also reject HTTP URLs.

Only `APP_ENV`, `API_BASE_URL`, and `SOCKET_BASE_URL` are embedded in JavaScript.
Existing backend-only entries are not used by this mobile app. `.env` is ignored by
Git; create it with the values above when setting up another checkout.
