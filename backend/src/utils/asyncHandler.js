// Tiny helper that lets controller fns be async without try/catch boilerplate.
//   router.post('/x', asyncHandler(async (req, res) => { ... }))
module.exports = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
