const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not set in server/.env');
  }

  const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log(`MongoDB connected: ${conn.connection.host}`);
  return conn;
}

module.exports = connectDB;
