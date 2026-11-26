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
