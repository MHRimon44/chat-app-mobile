# Chat App Mobile

Standalone React Native application for the Chat App. It supports registration and login, editable profiles, username search, direct chats, real-time messaging, replies, reactions, deletion, presence, typing indicators, receipts and unread counts.

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

## Verify

```bash
corepack yarn format:check
corepack yarn lint
corepack yarn typecheck
corepack yarn test
```

The iOS application requires macOS and Xcode. Run it using `corepack yarn ios:local`.
