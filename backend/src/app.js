const express = require('express');
const cors = require('cors');

const errorHandler = require('./middleware/errorHandler');

const app = express();

// Global middleware
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Static serving for uploaded files (preview/download).
app.use('/uploads', express.static('uploads'));

// Routes — mount as features come online.
app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/onboarding', require('./routes/onboardingRoutes'));
// app.use('/api/employees', require('./routes/employeeRoutes'));
// app.use('/api/visa', require('./routes/visaRoutes'));
// app.use('/api/hr', require('./routes/hrRoutes'));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// 404 for unmatched API routes
app.use('/api', (_req, res) => res.status(404).json({ message: 'Not found' }));

app.use(errorHandler);

module.exports = app;
