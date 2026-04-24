# Backend

Express + Mongoose. Standard MVC layout.

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

Default port 3001.

## Layout

```
src/
  config/        db connection
  models/        mongoose schemas
  controllers/   route handlers
  routes/        express routers
  middleware/    auth, role check, multer, error handler
  services/      email + token helpers
  utils/         validators
  app.js
  server.js
```

## TODO

- [ ] models: User / OnboardingApplication / VisaStatus / Document / RegistrationToken
- [ ] auth: register with token, login, JWT middleware
- [ ] onboarding submit + HR review
- [ ] OPT visa state machine (receipt -> EAD -> I-983 -> I-20)
- [ ] HR employee profiles + search
- [ ] file upload / download / preview
- [ ] input validation on both sides
