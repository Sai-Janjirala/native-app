# Nexora Mobile Client

This is the React Native (Expo) frontend for Nexora.

See the root [README.md](../../README.md) for full setup instructions.

## Quick Start

```bash
npm install
npx expo start
```

Scan the QR code in Expo Go on your physical device.

## Native Builds

Run native builds from this `client` directory (the Expo project root):

```bash
npx expo run:android   # requires Android Studio + Android SDK
npx expo run:ios       # requires macOS + Xcode
```

`npm run android` / `npm run ios` are aliases for the same commands. On a physical device, set
`EXPO_PUBLIC_API_URL` in `client/.env` to your machine's LAN URL (including `/api`) so the app can
reach the backend.

## Folder Structure

```
src/
├── app/           # Expo Router screens (index, tasks, calendar, analytics, profile)
├── components/    # Reusable UI components
├── constants/     # Theme colors, spacing, API base URL
├── context/       # AuthContext — user session and token management
├── hooks/         # use-tasks — task list state hook
└── services/      # api.js, taskApi.js, notifications.js
```
