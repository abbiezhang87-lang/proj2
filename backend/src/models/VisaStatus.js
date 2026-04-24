// OPT visa state machine per spec §6:
// OPT Receipt → OPT EAD → I-983 → I-20, each pending/approved/rejected w/ feedback.

const mongoose = require('mongoose');

const documentStepSchema = new mongoose.Schema(
  {
    // document: { type: mongoose.Types.ObjectId, ref: 'Document' },
    // status: { type: String, enum: ['not_uploaded', 'pending', 'approved', 'rejected'], default: 'not_uploaded' },
    // feedback: String,
  },
  { _id: false }
);

const visaStatusSchema = new mongoose.Schema(
  {
    // user: { type: mongoose.Types.ObjectId, ref: 'User', required: true, unique: true },
    // optReceipt: documentStepSchema,
    // optEad: documentStepSchema,
    // i983: documentStepSchema,
    // i20: documentStepSchema,
  },
  { timestamps: true }
);

module.exports = mongoose.model('VisaStatus', visaStatusSchema);
