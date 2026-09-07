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
