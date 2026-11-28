const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

let usingLocalStore = false;

app.use(cors());
app.use(express.json());

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

  app.listen(PORT, () => {
    console.log(`Nexora server running on port ${PORT}`);
    console.log(`Storage: ${usingLocalStore ? 'local offline store' : 'MongoDB'}`);
  });
}

startServer();
