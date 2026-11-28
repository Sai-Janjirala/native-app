# Nexora Server

Express.js + MongoDB Atlas backend for Nexora.

See the root [README.md](../../README.md) for full setup instructions.

## Quick Start

```bash
# 1. Copy and fill in environment variables
cp .env.example .env

# 2. Install dependencies
npm install

# 3. Start server
node server.js
```

## Network Access (phone on same Wi-Fi / hotspot)

The server binds to `HOST` (default `0.0.0.0`) on `PORT` (default `5000`), so it
accepts connections from other devices on your network — not just `localhost`.
On startup it prints the reachable Network URLs, e.g.:

```
Nexora server running on port 5000 (bound to 0.0.0.0)
Local:   http://localhost:5000/api/health
Network: http://10.164.109.249:5000/api/health
```

If your phone still cannot connect, allow the port through Windows Firewall
(run in an elevated PowerShell):

```powershell
New-NetFirewallRule -DisplayName "Nexora API 5000" -Direction Inbound -Protocol TCP -LocalPort 5000 -Action Allow
```

CORS allows all origins by default. To restrict it, set `CORS_ORIGIN` in `.env`
to a comma-separated list of allowed origins.

## Folder Structure

```
server/
├── config/        # MongoDB Atlas connection (db.js)
├── controllers/   # authController.js, taskController.js
├── middleware/    # authMiddleware.js (JWT protect)
├── models/        # User.js, Task.js
├── routes/        # authRoutes.js, taskRoutes.js
├── .env.example   # Safe placeholder — copy to .env
└── server.js      # App entry point
```

## API Endpoints

- `GET  /api/health`              — Server + DB health check
- `POST /api/auth/register`       — Register
- `POST /api/auth/login`          — Login
- `GET  /api/auth/me`             — Current user (protected)
- `PUT  /api/auth/profile`        — Update name (protected)
- `GET  /api/tasks`               — All tasks (protected)
- `POST /api/tasks`               — Create task (protected)
- `PUT  /api/tasks/:id`           — Update task (protected)
- `PATCH /api/tasks/:id/toggle`   — Toggle complete (protected)
- `DELETE /api/tasks/:id`         — Delete task (protected)
- `GET  /api/tasks/dashboard`     — Dashboard stats (protected)
- `GET  /api/tasks/analytics`     — Weekly analytics (protected)
