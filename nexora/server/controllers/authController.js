const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function formatUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });

    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);
    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash,
    });

    const token = signToken(user._id);
    return res.status(201).json({ token, user: formatUser(user) });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const firstMsg = Object.values(error.errors)[0]?.message || 'Invalid input';
      return res.status(400).json({ message: firstMsg });
    }
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(String(password), user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user._id);
    return res.json({ token, user: formatUser(user) });
  } catch (error) {
    return next(error);
  }
}

async function getMe(req, res) {
  return res.json({ user: formatUser(req.user) });
}

async function updateProfile(req, res, next) {
  try {
    const { name } = req.body;

    if (!name || String(name).trim().length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters' });
    }

    req.user.name = String(name).trim();
    await req.user.save();

    return res.json({ user: formatUser(req.user) });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const firstMsg = Object.values(error.errors)[0]?.message || 'Invalid input';
      return res.status(400).json({ message: firstMsg });
    }
    return next(error);
  }
}

module.exports = { register, login, getMe, updateProfile };
