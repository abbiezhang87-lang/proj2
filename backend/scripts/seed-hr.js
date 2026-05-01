// One-shot script to create the hardcoded HR account.
// Run from the backend folder: `node scripts/seed-hr.js`
// Edit USERNAME / EMAIL / PASSWORD below if you want a different default HR.

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const USERNAME = 'admin';
const EMAIL = 'admin@example.com';
const PASSWORD = 'admin123';

(async () => {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not set. Configure backend/.env first.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existing = await User.findOne({
      $or: [{ username: USERNAME }, { email: EMAIL }],
    });
    if (existing) {
      console.log(`HR already exists (${existing.username} / ${existing.email}) — skipping`);
    } else {
      await User.create({
        username: USERNAME,
        email: EMAIL,
        password: PASSWORD,
        role: 'hr',
      });
      console.log(`HR created: ${USERNAME} / ${PASSWORD}`);
    }
  } catch (err) {
    console.error('Failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
