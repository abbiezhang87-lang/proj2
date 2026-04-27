// Lightweight validators. Used by controllers to throw 400s with clear messages
// before hitting Mongoose. Keep these in sync with frontend form validation.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SSN_RE = /^\d{3}-?\d{2}-?\d{4}$/;
const PHONE_RE = /^\+?[\d\s\-().]{7,}$/;
const ZIP_RE = /^\d{5}(-\d{4})?$/;

exports.isEmail = (v) => typeof v === 'string' && EMAIL_RE.test(v.trim());
exports.isSSN = (v) => typeof v === 'string' && SSN_RE.test(v.trim());
exports.isPhone = (v) => typeof v === 'string' && PHONE_RE.test(v.trim());
exports.isZip = (v) => typeof v === 'string' && ZIP_RE.test(v.trim());

// Throws an error with status 400 and a `fields` map. Caught by errorHandler.
exports.assertFields = (fields) => {
  const missing = {};
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined || v === null || v === '') missing[k] = 'Required';
  }
  if (Object.keys(missing).length) {
    const err = new Error('Validation failed');
    err.status = 400;
    err.fields = missing;
    throw err;
  }
};

exports.httpError = (status, message, extra) => {
  const err = new Error(message);
  err.status = status;
  if (extra) Object.assign(err, extra);
  return err;
};
