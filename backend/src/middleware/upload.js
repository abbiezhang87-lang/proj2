const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

// Disk storage. Files land in /uploads with a randomised name to avoid clashes.
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = 'uploads/';
    // Defensive — server.js also creates this; this guard handles edge cases
    // like running tests in a fresh cwd.
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const stem = crypto.randomBytes(8).toString('hex');
    cb(null, `${Date.now()}-${stem}${ext}`);
  },
});

const ALLOWED = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

function fileFilter(_req, file, cb) {
  if (ALLOWED.has(file.mimetype)) return cb(null, true);
  const err = new Error(`Unsupported file type: ${file.mimetype}`);
  err.status = 400;
  cb(err, false);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

module.exports = upload;
