const mongoose = require('mongoose');

const DOCUMENT_KINDS = [
  'profile_picture',
  'drivers_license',
  'work_authorization',
  'opt_receipt',
  'opt_ead',
  'i983',
  'i20',
];

const documentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    kind: { type: String, enum: DOCUMENT_KINDS, required: true },
    originalName: { type: String, required: true },
    storedName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { timestamps: true }
);

documentSchema.statics.KINDS = DOCUMENT_KINDS;

module.exports = mongoose.model('Document', documentSchema);
