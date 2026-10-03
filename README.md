# Chat App Mobile

Standalone React Native application for the Chat App.

The application supports account registration with a unique username, authentication, profile management, direct conversations, real-time messaging, presence, typing indicators, message receipts, replies, reactions, message deletion, unread counts, and application theme preferences.

The **Profile & Settings** screen allows users to update their username, display name, bio, online-status privacy, and system/light/dark theme preference.

---

## Stack

- React Native CLI
- React Native 0.87
- TypeScript
- Redux Toolkit
- RTK Query
- React Navigation
- Socket.IO Client
- Android / Kotlin
- Yarn 4

---

## Project Structure

```text
src/        Application source
android/    Native Android project
ios/        Native iOS project
scripts/    Local device checks and launch helpers
```

---

# Requirements

For Android development on macOS, install:

- Git
- Homebrew
- Node.js 24
- Yarn via Corepack
- Java 17
- Android Studio
- Android SDK
- Android Platform Tools / ADB
- A physical Android device or Android emulator

Check your environment:

```bash
git --version
node -v
yarn -v
java -version
adb --version
```

The project requires **Node.js 24**.

---

# Install Node.js 24 on macOS

Check your current Node.js version:

```bash
node -v
```

If Node.js 24 is not installed:

```bash
brew install node@24
```

Add Node.js 24 to your PATH:

```bash
echo 'export PATH="/opt/homebrew/opt/node@24/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

Verify:

```bash
node -v
```

You should see:

```text
v24.x.x
```

Enable Corepack:

```bash
corepack enable
```

Verify Yarn:

```bash
yarn -v
```

This project uses Yarn 4.

---

# Install Android Platform Tools

If `adb` is not installed:

```bash
brew install android-platform-tools
```

Verify:

```bash
adb --version
```

Android Studio should also be installed and configured with the required Android SDK.

---

# Clone the Project

```bash
git clone https://github.com/MHRimon44/chat-app-mobile.git
cd chat-app-mobile
```

For development:

```bash
git checkout devMain
git pull origin devMain
```

For the production branch:

```bash
git checkout main
git pull origin main
```

---

# Install Dependencies

Make sure Node.js 24 is active:

```bash
node -v
```

Enable Corepack:

```bash
corepack enable
```

Install dependencies:

```bash
yarn install --immutable
```

---

# Environment Configuration

The mobile application's environment values live in the root `.env`.

The application uses only:

```text
APP_ENV
API_BASE_URL
SOCKET_BASE_URL
```

`src/config/environment.ts` exposes these values to the application.

Backend secrets must never be added to the mobile `.env`.

---

## Local Development Environment

Create `.env` in the project root if it does not already exist:

```bash
touch .env
```

For local development:

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

The backend must be running locally on:

```text
http://127.0.0.1:4000
```

When using a physical Android phone over USB, ADB reverse makes the phone's `127.0.0.1:4000` connect to the Mac's local backend.

---

# Create the Android Debug Keystore

A fresh checkout may not contain:

```text
android/app/debug.keystore
```

Check:

```bash
ls -l android/app/debug.keystore
```

If the file does not exist, create it:

```bash
keytool -genkeypair \
  -v \
  -storetype PKCS12 \
  -keystore android/app/debug.keystore \
  -alias androiddebugkey \
  -storepass android \
  -keypass android \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -dname "CN=Android Debug,O=Android,C=US"
```

Verify:

```bash
ls -lh android/app/debug.keystore
```

The debug keystore is only for local/debug builds.

Do not use a production signing key for local development.

---

# Run on a Physical Android Phone

Enable **Developer Options** and **USB Debugging** on the Android phone.

Connect the phone to the Mac using USB.

## 1. Verify the Device

```bash
adb devices
```

The device should appear similar to:

```text
List of devices attached
XXXXXXXXXXXX    device
```

If the device shows `unauthorized`, unlock the phone and accept the USB debugging authorization dialog.

---

## 2. Configure ADB Reverse

Forward the backend port:

```bash
adb reverse tcp:4000 tcp:4000
```

Forward the Metro port:

```bash
adb reverse tcp:8081 tcp:8081
```

Verify:

```bash
adb reverse --list
```

You should see both:

```text
tcp:4000 tcp:4000
tcp:8081 tcp:8081
```

---

## 3. Start Metro

Open Terminal 1:

```bash
cd chat-app-mobile
yarn start
```

Metro should start on:

```text
http://localhost:8081
```

Keep this terminal running.

---

## 4. Build and Install the Android App

Open Terminal 2:

```bash
cd chat-app-mobile
yarn android
```

Alternatively, if the project-specific local script is preferred:

```bash
yarn android:local
```

The application will be built, installed, and launched on the connected Android device.

---

# Normal Daily Development

After completing the first-time setup, the normal workflow is much shorter.

First make sure the backend is already running.

### Terminal 1 — Backend

From the backend repository:

```bash
yarn infra:up
yarn dev
```

### Terminal 2 — ADB + Metro

From the mobile repository:

```bash
adb devices

adb reverse tcp:4000 tcp:4000
adb reverse tcp:8081 tcp:8081

yarn start
```

### Terminal 3 — Android App

```bash
yarn android
```

That's the normal local development workflow.

---

# After Reconnecting the Phone

ADB reverse rules may need to be recreated after:

- Disconnecting/reconnecting the USB cable
- Restarting the phone
- Restarting ADB
- Restarting the Mac

Run:

```bash
adb reverse tcp:4000 tcp:4000
adb reverse tcp:8081 tcp:8081
```

Then verify:

```bash
adb reverse --list
```

---

# Reset Metro Cache

After changing `.env`, stop Metro with:

```text
Ctrl + C
```

Then restart it:

```bash
yarn start --reset-cache
```

Rebuild the Android application if necessary:

```bash
yarn android
```

---

# Clean the Android Build

If Gradle behaves unexpectedly or an old build is being reused:

```bash
cd android
./gradlew clean
cd ..
```

Then:

```bash
yarn android
```

---

# Verify the Project

Before pushing or merging important changes:

```bash
yarn format:check
yarn lint
yarn typecheck
yarn test
```

Or run them together:

```bash
yarn format:check && yarn lint && yarn typecheck && yarn test
```

---

# Application URLs

When developing with a physical Android phone and ADB reverse:

```text
Backend API:
http://127.0.0.1:4000

Socket.IO:
http://127.0.0.1:4000

Metro:
http://127.0.0.1:8081
```

---

# Android Emulator

For an Android emulator without ADB reverse, use:

```dotenv
APP_ENV=development
API_BASE_URL=http://10.0.2.2:4000
SOCKET_BASE_URL=http://10.0.2.2:4000
```

`10.0.2.2` allows the standard Android emulator to access the host computer.

Restart Metro after changing `.env`:

```bash
yarn start --reset-cache
```

---

# Physical Phone Over Wi-Fi

If developing without `adb reverse`, use the Mac's LAN IP address.

For example:

```dotenv
APP_ENV=development
API_BASE_URL=http://192.168.x.x:4000
SOCKET_BASE_URL=http://192.168.x.x:4000
```

The Mac and Android phone must be connected to the same network.

ADB reverse over USB is recommended for normal local development because it avoids LAN/network configuration.

---

# Production Environment

For a production build, disable the development values and enable the production values:

```dotenv
# Dev
# APP_ENV=development
# API_BASE_URL=http://127.0.0.1:4000
# SOCKET_BASE_URL=http://127.0.0.1:4000

# Prod
APP_ENV=production
API_BASE_URL=https://chat-app-backend-2s97.onrender.com
SOCKET_BASE_URL=https://chat-app-backend-2s97.onrender.com
```

Never put backend credentials, database credentials, JWT private keys, Redis passwords, or API secrets in the React Native application.

---

# Build a Production APK on macOS

After selecting the production environment, stop Metro and clear its cache if it was previously running:

```bash
yarn start --reset-cache
```

Stop Metro after the cache has been reset if you only need to build the release APK.

Then:

```bash
cd android
./gradlew assembleRelease
```

The generated APK is located at:

```text
android/app/build/outputs/apk/release/app-release.apk
```

Environment selection is manual.

A release build does not automatically switch from development to production configuration.

---

# Important Environment Rules

Keep exactly one environment active.

For local development:

```dotenv
APP_ENV=development
```

For production:

```dotenv
APP_ENV=production
```

Do not leave both Dev and Prod assignments active simultaneously.

Production builds must use HTTPS backend URLs.

Only these values are embedded into the mobile JavaScript bundle:

```text
APP_ENV
API_BASE_URL
SOCKET_BASE_URL
```

Backend-only environment variables are not used by this repository.

The `.env` file is ignored by Git and must be recreated when setting up a fresh checkout.

---

# Profile & Settings

After signing in, open **Profile** from the Chats screen.

Users can manage:

- Username
- Display name
- Bio
- Online-status privacy
- System/light/dark theme preference

Email is read-only because changing an email address requires a separate verification flow.

Usernames must follow the validation rules enforced by the backend.

---

# iOS

The repository also contains the native iOS project.

iOS development requires macOS and Xcode.

To run the local iOS application:

```bash
yarn ios:local
```

Android is the primary development workflow documented above.

---

# Troubleshooting

## `debug.keystore` not found

If the build fails with:

```text
Execution failed for task ':app:validateSigningDebug'.
Keystore file 'android/app/debug.keystore' not found
```

Generate the debug keystore using the command in the **Create the Android Debug Keystore** section.

Then:

```bash
cd android
./gradlew clean
cd ..

yarn android
```

---

## Phone cannot connect to Metro

Check:

```bash
adb devices
adb reverse --list
```

Restore the Metro forwarding:

```bash
adb reverse tcp:8081 tcp:8081
```

Make sure Metro is running:

```bash
yarn start
```

---

## App cannot connect to the local backend

Make sure the backend is running on port `4000`.

Then:

```bash
adb reverse tcp:4000 tcp:4000
```

Verify:

```bash
adb reverse --list
```

The local `.env` should contain:

```dotenv
API_BASE_URL=http://127.0.0.1:4000
SOCKET_BASE_URL=http://127.0.0.1:4000
```

---

## Gradle warnings during Android build

The Android build may display deprecation warnings from Gradle, React Native, or third-party native dependencies.

Warnings do not necessarily mean the build failed.

Always look near the end of the output for:

```text
BUILD SUCCESSFUL
```

or:

```text
BUILD FAILED
```

If it failed, find the first relevant `What went wrong` or failed Gradle task rather than treating every warning as the root cause.

---

# Fresh Mac Quick Setup

For a fresh macOS machine:

```bash
# Install Node.js 24
brew install node@24

# Make Node 24 the default
echo 'export PATH="/opt/homebrew/opt/node@24/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Enable Yarn
corepack enable

# Install ADB if necessary
brew install android-platform-tools

# Verify
node -v
yarn -v
adb --version
```

Clone and prepare the project:

```bash
git clone https://github.com/MHRimon44/chat-app-mobile.git
cd chat-app-mobile

git checkout devMain

yarn install --immutable
```

Create the local `.env`.

If necessary, create the debug keystore:

```bash
keytool -genkeypair \
  -v \
  -storetype PKCS12 \
  -keystore android/app/debug.keystore \
  -alias androiddebugkey \
  -storepass android \
  -keypass android \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -dname "CN=Android Debug,O=Android,C=US"
```

Connect the Android phone and configure forwarding:

```bash
adb devices
adb reverse tcp:4000 tcp:4000
adb reverse tcp:8081 tcp:8081
```

Start Metro:

```bash
yarn start
```

In another terminal:

```bash
yarn android
```

The backend must also be running locally on port `4000`.
