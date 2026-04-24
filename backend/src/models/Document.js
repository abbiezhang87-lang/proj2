// Generic uploaded document — profile picture, driver's license, OPT receipt, etc.

const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    // user: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    // kind: {
    //   type: String,
    //   enum: [
    //     'profile_picture',
    //     'drivers_license',
    //     'work_authorization',
    //     'opt_receipt',
    //     'opt_ead',
    //     'i983',
    //     'i20',
    //   ],
    //   required: true,
    // },
    // originalName: String,
    // storedName: String,      // filename on disk / in object storage
    // mimeType: String,
    // size: Number,
    // url: String,             // public/signed URL for preview+download
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', documentSchema);
