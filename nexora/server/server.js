const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  res.json({
    status: 'ok',
    service: 'nexora-server',
    database: dbReady ? 'connected' : 'disconnected',
  });
});

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

async function startServer() {
  if (process.env.MONGODB_URI) {
    try {
      await connectDB();
    } catch (error) {
      console.error('MongoDB connection failed:', error.message);
      process.exit(1);
    }
  } else {
    console.warn('MONGODB_URI not set. Starting server without database connection.');
  }

  app.listen(PORT, () => {
    console.log(`Nexora server running on port ${PORT}`);
  });
}

startServer();
