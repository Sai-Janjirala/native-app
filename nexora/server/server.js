const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const connectDB = require('./config/db');

const app = express();
const PORT = Number(process.env.PORT) || 5000;
// Bind to all interfaces so the API is reachable from mobile devices on the same Wi‑Fi/hotspot.
const HOST = process.env.HOST || '0.0.0.0';

let usingLocalStore = false;

// CORS configuration:
// - In production, restrict via CORS_ORIGIN env var (comma‑separated list).
// - For native Expo Go, allow all origins by default (requests are not subject to browser CORS).
// - For web/expo web, allow specific origins if CORS_ORIGIN is set.
const corsOrigin = process.env.CORS_ORIGIN;
app.use(
  cors(
    corsOrigin
      ? { origin: corsOrigin.split(',').map((o) => o.trim()) }
      : {} // {} reflects the request origin, which is safe for native apps
  )
);
app.use(express.json());

// Helper: list of local upload paths that would be lost on redeploy
// (Check your routes/controllers for any `require('fs').writeFile` targeting `uploads/`)
const LOCAL_UPLOAD_PATHS = [];

// ─── Health check ───────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  res.json({
    status: 'ok',
    service: 'nexora-server',
    database: usingLocalStore ? 'local' : dbReady ? 'connected' : 'disconnected',
  });
});

// ─── API Routes ────────────────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// ─── Catch‑all 404 ─────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

// ─── Server start ─────────────────────────────────────────────────────
// Print reachable URLs so the operator knows which LAN IP to use on the phone.
function getLanAddresses() {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  const addresses = [];

  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push(net.address);
      }
    }
  }
  return addresses;
}

const server = app.listen(PORT, HOST, () => {
  console.log(`Nexora server running on port ${PORT} (bound to ${HOST})`);
  console.log(`Local:   http://localhost:${PORT}/api/health`);

  const lanAddresses = getLanAddresses();
  if (lanAddresses.length === 0) {
    console.log('Network: no LAN IPv4 address detected.');
  } else {
    for (const address of lanAddresses) {
      console.log(`Network: http://${address}:${PORT}/api/health`);
    }
    console.log('Use one of the Network URLs above on your phone (same Wi‑Fi/hotspot).');
  }

  console.log(`Storage: ${usingLocalStore ? 'local offline store' : 'MongoDB'}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(
      `Port ${PORT} is already in use. Stop the other process or change PORT in server/.env.`
    );
  } else {
    console.error(`Failed to start server: ${error.message}`);
  }
  process.exit(1);
});