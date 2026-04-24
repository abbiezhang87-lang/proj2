// Registration token helpers — generate, validate, consume.
// TODO: use crypto.randomBytes + RegistrationToken model.

async function generate(_email, _name) {
  throw new Error('Not implemented: generate token');
}

async function validate(_token) {
  throw new Error('Not implemented: validate token');
}

async function consume(_token, _userId) {
  throw new Error('Not implemented: consume token');
}

module.exports = { generate, validate, consume };
