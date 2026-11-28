const os = require('os');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const connectDB = require('./config/db');

const app = express();
const PORT = Number(process.env.PORT) || 5000;
// Bind to all interfaces so phones on the same Wi-Fi/hotspot can reach the API.
const HOST = process.env.HOST || '0.0.0.0';

let usingLocalStore = false;

// Native Expo Go requests are not subject to browser CORS, but Expo web and
// browsers are. Allow everything by default; restrict via CORS_ORIGIN if needed
// (comma-separated list, e.g. "https://app.example.com").
const corsOrigin = process.env.CORS_ORIGIN;
app.use(
  cors(
    corsOrigin
      ? { origin: corsOrigin.split(',').map((origin) => origin.trim()) }
      : {}
  )
);
app.use(express.json());

function getLanAddresses() {
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

app.get('/api/health', (req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  res.json({
    status: 'ok',
    service: 'nexora-server',
    database: usingLocalStore ? 'local' : dbReady ? 'connected' : 'disconnected',
  });
});

async function startServer() {
  if (process.env.MONGODB_URI) {
    try {
      await connectDB();
    } catch (error) {
      usingLocalStore = true;
      console.warn('MongoDB unavailable; using the local offline data store.');
      console.warn(error.message);
    }
  } else {
    usingLocalStore = true;
    console.warn('MONGODB_URI not set; using the local offline data store.');
  }

  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'nexora-local-development-secret';
    console.warn('JWT_SECRET not set; using a local development secret.');
  }

  process.env.NEXORA_LOCAL_STORE = usingLocalStore ? 'true' : 'false';

  const authRoutes = require('./routes/authRoutes');
  const taskRoutes = require('./routes/taskRoutes');

  app.use('/api/auth', authRoutes);
  app.use('/api/tasks', taskRoutes);

  app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
      message: err.message || 'Internal server error',
    });
  });

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
      console.log('Use one of the Network URLs above on your phone (same Wi-Fi/hotspot).');
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
}

startServer();
