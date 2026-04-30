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
app.use('/api/onboarding', require('./routes/onboardingRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/visa', require('./routes/visaRoutes'));
app.use('/api/hr', require('./routes/hrRoutes'));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Friendly root — direct visits to http://localhost:3001 should not look broken.
app.get('/', (_req, res) => {
  res.type('html').send(`
    <html><head><title>Employee Management API</title></head>
    <body style="font-family: -apple-system, sans-serif; max-width: 540px; margin: 80px auto; color: #2d3033;">
      <h2>Employee Management API</h2>
      <p>This is the backend. The user interface lives at
        <a href="http://localhost:3000">http://localhost:3000</a>.</p>
      <ul>
        <li><a href="/api/health">/api/health</a> — health check</li>
        <li>/api/auth, /api/onboarding, /api/employees, /api/visa, /api/hr — JSON endpoints (need a JWT)</li>
      </ul>
    </body></html>`);
});

// 404 for unmatched API routes
app.use('/api', (_req, res) => res.status(404).json({ message: 'Not found' }));

app.use(errorHandler);

module.exports = app;
