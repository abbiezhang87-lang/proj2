// Entry point — loads env, connects to MongoDB, starts the HTTP server.
// TODO: implement actual startup logic once config/db and app are filled in.

require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3001;

async function start() {
  // TODO: await connectDB();
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
