# Nexora — Personal Productivity & Task Management App

> Organize your work. Manage your time. Track your progress.

Nexora is a full-stack mobile productivity application built with **React Native (Expo)** on the frontend and **Node.js + Express + MongoDB Atlas** on the backend.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Mobile App Setup](#mobile-app-setup)
- [API Reference](#api-reference)
- [Git Commit History](#git-commit-history)
- [Environment Variables](#environment-variables)

---

## Overview

Nexora helps students and working professionals stay organized by giving them a single place to manage tasks, track deadlines, and understand their productivity trends.

The app is built as a genuine student full-stack project — simple, readable code, no unnecessary complexity.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile Frontend | React Native, Expo, Expo Router, JavaScript |
| Backend | Node.js, Express.js, JavaScript |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | JSON Web Tokens (JWT), bcryptjs |
| Notifications | expo-notifications (local) |
| Version Control | Git, GitHub |

---

## Project Structure

```
native-app/
├── .gitignore
└── nexora/
    ├── client/                    # Expo React Native mobile app
    │   ├── src/
    │   │   ├── app/               # Expo Router screens
    │   │   │   ├── _layout.jsx    # Root layout + AuthProvider
    │   │   │   ├── index.jsx      # Home — dashboard + Focus Timer
    │   │   │   ├── tasks.jsx      # Tasks — CRUD list
    │   │   │   ├── calendar.jsx   # Calendar — weekly view
    │   │   │   ├── analytics.jsx  # Analytics — charts & stats
    │   │   │   └── profile.jsx    # Profile — account & notifications
    │   │   ├── components/        # Reusable UI components
    │   │   │   ├── auth-screen.jsx
    │   │   │   ├── app-tabs.jsx
    │   │   │   ├── screen-header.jsx
    │   │   │   ├── task-badges.jsx
    │   │   │   ├── task-form-modal.jsx
    │   │   │   └── focus-timer.jsx
    │   │   ├── constants/
    │   │   │   ├── theme.js       # Colors, spacing
    │   │   │   └── api.js         # Auto-resolves backend base URL
    │   │   ├── context/
    │   │   │   └── AuthContext.jsx  # Auth state + token persistence
    │   │   ├── hooks/
    │   │   │   └── use-tasks.js   # Task state + notification wiring
    │   │   └── services/
    │   │       ├── api.js         # Base fetch helper + 401 handling
    │   │       ├── taskApi.js     # Task-specific API calls
    │   │       └── notifications.js # Expo local notifications
    │   ├── app.json
    │   └── package.json
    │
    └── server/                    # Node.js + Express backend
        ├── config/
        │   └── db.js              # MongoDB Atlas connection
        ├── controllers/
        │   ├── authController.js  # Register, login, me, update profile
        │   └── taskController.js  # Task CRUD + dashboard + analytics
        ├── middleware/
        │   └── authMiddleware.js  # JWT protect middleware
        ├── models/
        │   ├── User.js            # User schema (name, email, passwordHash)
        │   └── Task.js            # Task schema (title, priority, category, dueDate...)
        ├── routes/
        │   ├── authRoutes.js
        │   └── taskRoutes.js
        ├── .env.example           # Safe placeholder — copy to .env
        ├── server.js              # Express app entry point
        └── package.json
```

---

## Features

### Authentication
- User registration and login
- Password hashing with bcryptjs
- JWT tokens stored securely on-device (AsyncStorage)
- Auto-restore session on app launch
- Automatic sign-out on token expiry

### Dashboard (Home)
- Personalized greeting
- Real-time stats: Total, Completed, Pending, Today, Overdue
- Completion percentage with progress bar
- **Focus Timer** (25-minute Pomodoro / 5-minute break)

### Task Management
- Create, edit, delete tasks
- Mark tasks complete with one tap
- Priority levels: **Low**, **Medium**, **High** (colour-coded)
- Categories: **Personal**, **Study**, **Work**
- Optional due date and description
- Pull-to-refresh, overdue warnings, empty state

### Calendar
- 7-day horizontal scrollable week strip
- Task dots on days that have due tasks
- Tap any day to see its tasks
- Overdue tasks highlighted in a separate section
- Tasks without a due date shown at the bottom

### Analytics
- 7-day bar chart of tasks completed per day
- Daily breakdown table (created vs completed)
- Completion % by Priority (High / Medium / Low)
- Completion % by Category (Work / Study / Personal)
- Recently completed tasks list

### Notifications
- Local notifications — 1 hour before a task is due
- Auto-scheduled when creating/editing a task with a due date
- Auto-cancelled when a task is completed or deleted
- Permission management from the Profile screen

### Profile
- View email and join date
- Edit display name
- Manage notification permissions
- Sign out

---

## Getting Started

### Prerequisites

- Node.js 18+
- Expo Go app on your Android or iOS device
- MongoDB Atlas account with a cluster

---

### Backend Setup

```bash
# 1. Navigate to server directory
cd nexora/server

# 2. Install dependencies
npm install

# 3. Create your .env file (never commit this)
cp .env.example .env
```

Edit `nexora/server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/nexora?retryWrites=true&w=majority
JWT_SECRET=replace_with_a_long_random_secret
```

> **How to get your MongoDB URI:**
> 1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
> 2. Click **Connect** on your cluster
> 3. Choose **Drivers** → Node.js
> 4. Copy the connection string and replace `<password>` with your database user password

> In Atlas, open **Network Access → IP Access List → Add IP Address** and allow your current public IP (or `0.0.0.0/0` for local testing). Otherwise the API exits with "Could not connect to any servers in your MongoDB Atlas cluster".

```bash
# 4. Start the server
node server.js
# → MongoDB connected: ...
# → Nexora server running on port 5000

# 5. Test the health endpoint
curl http://localhost:5000/api/health
# → {"status":"ok","service":"nexora-server","database":"connected"}
```

---

### Mobile App Setup

```bash
# From the nexora directory, install the client dependencies
cd nexora/client

# Install dependencies
npm install

# Start Expo from the client directory
npx expo start
```

Alternatively, from the `nexora` directory run `npm start`; the project wrapper forwards the command to `client`.

Scan the QR code with **Expo Go** on your physical device.

For a native build (custom native code, emulator/simulator) run from `nexora/client`:

```bash
npx expo run:android   # requires Android Studio + Android SDK
npx expo run:ios       # requires macOS + Xcode
```

The `npm run android` / `npm run ios` scripts in `nexora` and `nexora/client` forward to these commands.

> **Important:** When testing on a physical Android or iOS device, the mobile app needs to reach your laptop's backend on the local network. The `src/constants/api.js` file auto-resolves the correct IP from Expo's `hostUri`. As long as both devices are on the same Wi-Fi network, it works automatically.

> **Custom API URL:** To use a deployed backend or override auto-detection, set `EXPO_PUBLIC_API_URL` in `nexora/client/.env` (for example, `EXPO_PUBLIC_API_URL=https://api.example.com/api`) before starting Expo. Include the `/api` path.

---

## API Reference

All task routes require the `Authorization: Bearer <token>` header.

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/me` | Get current user (protected) |
| PUT | `/api/auth/profile` | Update display name (protected) |

### Tasks

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks` | Get all user tasks |
| POST | `/api/tasks` | Create a task |
| GET | `/api/tasks/:id` | Get one task |
| PUT | `/api/tasks/:id` | Update a task |
| PATCH | `/api/tasks/:id/toggle` | Toggle completion |
| DELETE | `/api/tasks/:id` | Delete a task |
| GET | `/api/tasks/dashboard` | Dashboard stats |
| GET | `/api/tasks/analytics` | Weekly + priority + category stats |

---

## Git Commit History

| Commit | Description |
|---|---|
| `2878386` | 1st commit — initial repository |
| `e8d1f02` | feat: configure Nexora app and 5-tab navigation |
| `a4d3f4f` | refactor: convert Nexora mobile app from TypeScript to JavaScript |
| `49ce1c5` | chore: organize project into nexora/client and nexora/server |
| `e26aee2` | feat: initialize Express backend and health check endpoint |
| `33e56cd` | feat: add user authentication — register, login, JWT middleware, mobile auth flow |
| `fc37b1f` | feat: add Task model, CRUD API, dashboard stats, and Tasks/Home screens |
| `ea8766f` | feat: add Calendar screen, Analytics screen, and weekly/priority/category stats API |
| `c61c51a` | feat: add local notifications, task reminders, and Focus Timer |

---

## Environment Variables

### `nexora/server/.env` (never commit)

| Variable | Description |
|---|---|
| `PORT` | Port the Express server listens on (default: 5000) |
| `MONGODB_URI` | Full MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens — keep this long and random |

> See `nexora/server/.env.example` for a safe placeholder template.

---

## Security Notes

- Passwords are hashed with bcryptjs (10 salt rounds) — never stored in plain text
- JWTs expire after 7 days
- All task routes are protected — users can only access their own data
- `.env` is in `.gitignore` — credentials are never committed
- The React Native app never connects directly to MongoDB
