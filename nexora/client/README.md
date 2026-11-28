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

`npm run android` / `npm run ios` are aliases for the same commands.

## API Configuration

The app resolves the backend URL in this order (`src/constants/api.js`):

1. `EXPO_PUBLIC_API_URL` from `client/.env` (best for production / custom setups).
2. `expo.extra.apiUrl` from `app.json`.
3. Auto-detected Expo/Metro host IP + port `5000` (default for local Expo Go).
4. Platform fallback (`10.0.2.2` on Android emulator, `localhost` elsewhere).

For local Expo Go you usually do **not** need to set anything — it follows your
laptop's current LAN IP automatically, even when your hotspot/Wi-Fi IP changes.
The backend must be running and bound to `0.0.0.0` on port `5000`.

To override manually (e.g. auto-detect fails), copy `.env.example` to `.env`:

```bash
# client/.env
EXPO_PUBLIC_API_URL=http://10.164.109.249:5000
```

For a production APK, point it at your deployed HTTPS backend before building:

```bash
# client/.env
EXPO_PUBLIC_API_URL=https://api.yourdomain.com
```

The trailing `/api` is optional — it is appended automatically when missing.

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
