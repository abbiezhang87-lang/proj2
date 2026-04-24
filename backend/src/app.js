// Express app — middleware + route mounting.
// Kept separate from server.js so it can be imported in tests.

const express = require('express');
const cors = require('cors');

const app = express();

// Global middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static serving for uploaded files (preview/download)
app.use('/uploads', express.static('uploads'));

// TODO: mount routers
// app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/onboarding', require('./routes/onboardingRoutes'));
// app.use('/api/employees', require('./routes/employeeRoutes'));
// app.use('/api/visa', require('./routes/visaRoutes'));
// app.use('/api/hr', require('./routes/hrRoutes'));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// TODO: global error handler
// app.use(require('./middleware/errorHandler'));

module.exports = app;
