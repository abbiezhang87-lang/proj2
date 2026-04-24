// User model — both Employee and HR are Users (differ by `role`).
// TODO: define Mongoose schema.

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    // username: { type: String, required: true, unique: true },
    // email: { type: String, required: true, unique: true, lowercase: true },
    // password: { type: String, required: true },          // bcrypt hash
    // role: { type: String, enum: ['employee', 'hr'], default: 'employee' },
    // onboardingApplication: { type: mongoose.Types.ObjectId, ref: 'OnboardingApplication' },
    // visaStatus: { type: mongoose.Types.ObjectId, ref: 'VisaStatus' },
  },
  { timestamps: true }
);

// TODO: pre-save hook to hash password
// TODO: method to compare password

module.exports = mongoose.model('User', userSchema);
