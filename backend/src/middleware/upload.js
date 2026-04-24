// Multer setup for file uploads.
// TODO: configure storage (disk or S3), limits, MIME filter.

const multer = require('multer');

const storage = multer.diskStorage({
  destination: 'uploads/',
  // filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

module.exports = upload;
