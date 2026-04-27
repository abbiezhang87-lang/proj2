const mongoose = require('mongoose');

// One step in the OPT progression. Status drives the UI step machine.
const stepSchema = new mongoose.Schema(
  {
    document: { type: mongoose.Types.ObjectId, ref: 'Document' },
    status: {
      type: String,
      enum: ['not_uploaded', 'pending', 'approved', 'rejected'],
      default: 'not_uploaded',
    },
    feedback: { type: String, default: '' },
    uploadedAt: Date,
    reviewedAt: Date,
  },
  { _id: false }
);

const visaStatusSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    // Sequential — each unlocked only after the previous is approved.
    optReceipt: { type: stepSchema, default: () => ({}) },
    optEad: { type: stepSchema, default: () => ({}) },
    i983: { type: stepSchema, default: () => ({}) },
    i20: { type: stepSchema, default: () => ({}) },
  },
  { timestamps: true }
);

// Returns the key of the step the employee should act on next, or null if all
// four steps are approved.
visaStatusSchema.methods.nextStep = function nextStep() {
  const order = ['optReceipt', 'optEad', 'i983', 'i20'];
  for (const key of order) {
    if (this[key].status !== 'approved') return key;
  }
  return null;
};

module.exports = mongoose.model('VisaStatus', visaStatusSchema);
