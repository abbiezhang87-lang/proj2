# Frontend

React + Redux Toolkit + MUI. Forms use react-hook-form.

## Setup

```bash
cp .env.example .env
npm install
npm start
```

Runs on 3000, expects backend at 3001 (change via `REACT_APP_API_BASE_URL`).

## Layout

```
src/
  api/             axios + per-domain API modules
  components/
    common/        Navbar, ProtectedRoute, LoadingSpinner
    forms/         reusable sections: Name / Address / Contact / ...
    documents/     Uploader + Preview
  pages/
    hr/            HR-only pages
    ...            Login, Registration, Onboarding, PersonalInfo, VisaStatus, Home
  store/
    slices/        auth, employee, onboarding, visa
    index.js
  routes/
  utils/
  App.jsx
  index.js
```

## TODO

- [ ] login + protected routes + JWT session restore
- [ ] registration page (reads token from URL)
- [ ] onboarding form with file uploads
- [ ] personal info page (section-level edit + discard confirm)
- [ ] visa status page (OPT steps)
- [ ] HR pages: hiring management, employee profiles, visa review
