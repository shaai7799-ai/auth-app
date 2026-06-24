// server.js - Main entry point for our backend API

const express = require('express');
const cors    = require('cors');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const pool    = require('./db');
const logger  = require('./logger');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────

app.use(cors({
  origin: '*',
}));
app.use(express.json());

// Request logger — logs every incoming API request
app.use((req, res, next) => {
  const ip     = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const start  = Date.now();

  res.on('finish', () => {
    const ms     = Date.now() - start;
    const level  = res.statusCode >= 500 ? 'ERROR'
                 : res.statusCode >= 400 ? 'WARNING'
                 : 'INFO';
    logger[level.toLowerCase()]('HTTP_REQUEST', {
      method: req.method,
      path:   req.path,
      status: res.statusCode,
      ms,
      ip,
    });
  });

  next();
});


// ─── HELPER: Verify JWT Token ─────────────────────────────────────────────────
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token      = authHeader && authHeader.split(' ')[1];
  const ip         = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

  if (!token) {
    logger.warning('AUTH_MISSING_TOKEN', { ip, path: req.path });
    return res.status(401).json({ error: 'Access denied. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    logger.warning('AUTH_INVALID_TOKEN', { ip, path: req.path, reason: err.message });
    return res.status(403).json({ error: 'Invalid or expired token. Please log in again.' });
  }
}


// ─── ROUTE: Health Check ──────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running!' });
});


// ─── ROUTE: Register ──────────────────────────────────────────────────────────
app.post('/api/register', async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

  try {
    const { name, email, password } = req.body;

    logger.info('REGISTER_ATTEMPT', { ip, email: email || 'unknown' });

    if (!name || !email || !password) {
      logger.warning('REGISTER_VALIDATION_FAIL', { ip, reason: 'Missing fields' });
      return res.status(400).json({ error: 'Please fill in all fields.' });
    }
    if (password.length < 6) {
      logger.warning('REGISTER_VALIDATION_FAIL', { ip, email, reason: 'Password too short' });
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      logger.warning('REGISTER_VALIDATION_FAIL', { ip, email, reason: 'Invalid email format' });
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existingUser.rows.length > 0) {
      logger.warning('REGISTER_EMAIL_TAKEN', { ip, email });
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name.trim(), email.toLowerCase(), hashedPassword]
    );

    const newUser = result.rows[0];

    logger.success('REGISTER_SUCCESS', { ip, email: newUser.email, userId: newUser.id, name: newUser.name });

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    });

  } catch (err) {
    logger.error('REGISTER_ERROR', { ip, message: err.message });
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});


// ─── ROUTE: Login ─────────────────────────────────────────────────────────────
app.post('/api/login', async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

  try {
    const { email, password } = req.body;

    logger.info('LOGIN_ATTEMPT', { ip, email: email || 'unknown' });

    if (!email || !password) {
      logger.warning('LOGIN_VALIDATION_FAIL', { ip, reason: 'Missing fields' });
      return res.status(400).json({ error: 'Please enter your email and password.' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);

    if (result.rows.length === 0) {
      logger.warning('LOGIN_USER_NOT_FOUND', { ip, email });
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user          = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      logger.warning('LOGIN_WRONG_PASSWORD', { ip, email, userId: user.id });
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    logger.success('LOGIN_SUCCESS', { ip, email: user.email, userId: user.id, name: user.name });

    res.json({
      message: 'Logged in successfully!',
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });

  } catch (err) {
    logger.error('LOGIN_ERROR', { ip, message: err.message });
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});


// ─── ROUTE: Get Current User (Protected) ─────────────────────────────────────
app.get('/api/me', authenticateToken, async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  try {
    const result = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );
    if (result.rows.length === 0) {
      logger.warning('GET_USER_NOT_FOUND', { ip, userId: req.user.userId });
      return res.status(404).json({ error: 'User not found.' });
    }
    logger.info('GET_USER_SUCCESS', { ip, userId: req.user.userId });
    res.json({ user: result.rows[0] });
  } catch (err) {
    logger.error('GET_USER_ERROR', { ip, message: err.message });
    res.status(500).json({ error: 'Something went wrong.' });
  }
});


// ─── ROUTE: Get Logs (for the viewer page) ───────────────────────────────────
// GET http://localhost:5000/api/logs?limit=100&level=ERROR&search=email
app.get('/api/logs', authenticateToken, (req, res) => {
  const { limit = 200, level = '', search = '' } = req.query;

  logger.info('LOGS_VIEWED', { userId: req.user.userId, email: req.user.email });

  const logs  = logger.readLogs({
    limit:  parseInt(limit),
    level:  level || null,
    search: search || '',
  });
  const stats = logger.getStats();
  const file  = logger.LOG_FILE;

  res.json({ logs, stats, file });
});


// ─── ROUTE: Clear Logs ────────────────────────────────────────────────────────
// DELETE http://localhost:5000/api/logs
app.delete('/api/logs', authenticateToken, (req, res) => {
  logger.warning('LOGS_CLEARED', { userId: req.user.userId, email: req.user.email });
  logger.clearLogs();
  // Write one entry after clearing so the file isn't empty
  logger.info('LOGS_CLEARED_BY', { userId: req.user.userId, email: req.user.email });
  res.json({ message: 'Logs cleared successfully.' });
});


// ─── START SERVER ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  logger.success('SERVER_START', { message: `Running on port ${PORT}` });
  console.log(`\n🚀 Backend server running at http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
  console.log(`   Log file:     ${logger.LOG_FILE}\n`);
});
