const mongoose = require('mongoose');

const registrationTokenSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, trim: true, default: '' },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
    // populated once the registration leads to an account
    user: { type: mongoose.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Quick check used in middleware/services.
registrationTokenSchema.methods.isValid = function isValid() {
  return !this.used && this.expiresAt > new Date();
};

module.exports = mongoose.model('RegistrationToken', registrationTokenSchema);
