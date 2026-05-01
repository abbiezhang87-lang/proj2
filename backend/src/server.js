// Entry point — loads env, connects to MongoDB, starts the HTTP server.
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3001;

// Ensure the uploads directory exists before multer needs it.
const uploadsDir = path.resolve('uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`Created uploads directory at ${uploadsDir}`);
}

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
