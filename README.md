# proj2 — Employee Management Portal

End-to-end onboarding portal for new hires and HR teams. Two roles
(Employee / HR), token-based registration, document uploads with HR
approval workflow, and an OPT visa step machine.

**Figma design:** https://www.figma.com/design/0e6s7OVp4eaFRrN0uSmkFE/Untitled?node-id=1-664&t=bXubJCZnhT2qEQA8-1

**Project Slides:** https://docs.google.com/presentation/d/15sv5fS6klgq0wAY-DsD8KCEJYAOQzm5O/edit?usp=sharing&ouid=106374268678134928750&rtpof=true&sd=true

**.env setup:** https://drive.google.com/file/d/1a9P5el4rzZJtE4tG7DL7gmr2WyNQy1nU/view?usp=sharing

## Tech stack

| Layer    | Choice                                                |
| -------- | ----------------------------------------------------- |
| Backend  | Node.js + Express + MongoDB (Mongoose)                |
| Frontend | React 18 + Redux Toolkit + React Router + MUI         |
| Forms    | react-hook-form (FormProvider + useFormContext)       |
| Auth     | JWT in localStorage; bcrypt password hashing          |
| Email    | Nodemailer (registration links + reminders)           |
| Uploads  | Multer disk storage + ownership-checked download      |

## Repository layout

```
proj2/
├── backend/                 Node + Express MVC service (port 3001)
│   ├── scripts/seed-hr.js   one-shot HR account seeder
│   └── src/
│       ├── config/          db connection
│       ├── models/          mongoose schemas
│       ├── controllers/     auth · onboarding · employee · visa · hr
│       ├── routes/          per-controller routers, mounted in app.js
│       ├── middleware/      auth · role · upload · errorHandler
│       ├── services/        emailService · tokenService
│       ├── utils/           validators · asyncHandler
│       ├── app.js
│       └── server.js
├── frontend/                React SPA (CRA, port 3000)
    └── src/
        ├── api/             axios instance + per-domain API modules
        ├── components/
        │   ├── common/      Navbar · ProtectedRoute · LoadingSpinner
        │   ├── forms/       6 reusable RHF section components
        │   └── documents/   Uploader · Preview
        ├── pages/           login · register · onboarding · personal info · visa
        │   └── hr/          hiring · employee profiles · visa review
        ├── store/slices/    auth · onboarding · employee · visa
        ├── routes/          AppRoutes with ProtectedRoute guards
        ├── App.jsx · index.js
        └── utils/constants.js

```

## Local setup

### 1. Backend

```bash
cd backend
cp .env.example .env          # fill in MONGO_URI, JWT_SECRET (SMTP_* optional)
npm install
node scripts/seed-hr.js       # creates the HR account: admin / admin123
npm run dev                   # http://localhost:3001
```

### 2. Frontend (in a second terminal)

```bash
cd frontend
cp .env.example .env
npm install
npm start                     # http://localhost:3000
```

> MongoDB can be local (`brew install mongodb-community` + `brew services
> start mongodb-community`) or a free MongoDB Atlas cluster — the backend
> works the same way as long as `MONGO_URI` is set.

## Feature checklist (Project-2 spec)

**Employees**

- [x] Token-gated registration (HR generates 3-hour token + emails link)
- [x] Login with auto role detection + JWT + session restore on refresh
- [x] Onboarding application — never_submitted / pending / rejected / approved branching
- [x] OPT-only OPT Receipt upload triggered by F1 selection
- [x] Personal Information page — sectioned editing with discard-confirm
- [x] Visa Status Management — OPT 4-step state machine (Receipt → EAD → I-983 → I-20)
- [x] File upload / browser preview / download with ownership enforcement

**HR**

- [x] Hiring Management — token generation + history + 3-tab onboarding review
- [x] Application review opens in new tab; approve/reject only on Pending
- [x] Employee Profiles list — count, alphabetical sort, debounced search, new-tab profile, pagination
- [x] Visa Status Management — In Progress (covers every stage) + All tabs
- [x] Document review with browser preview + Approve / Reject + feedback
- [x] Send Notification email for any next-step reminder

**Cross-cutting**

- [x] Client- and server-side input validation
- [x] Role-based route guards (frontend) + per-endpoint role middleware (backend)
- [x] Direct-URL access protection
- [x] 401 auto-clears stale localStorage session

## Deferred (with planned approach)

- **TypeScript** — spec marks optional. Migrate incrementally: rename `.jsx` → `.tsx`, add types per file.
- **Token revocation / resend** — currently rely on 3-hour expiry. Approach: `DELETE /api/hr/tokens/:id` + a Resend button.

## Default credentials

| Role | Username | Password    |
| ---- | -------- | ----------- |
| HR   | `admin`  | `admin123`  |

(Set up by `backend/scripts/seed-hr.js`.)

## Team

- **Chi Zhang** ([@abbiezhang87-lang](https://github.com/abbiezhang87-lang)) — Lead. Base layout (Navbar / ProtectedRoute / AppRoutes) + employee-side core (Onboarding, Personal Info, Visa Status).
- **Yukun Tao** ([@yukun-tech](https://github.com/yukun-tech)) — Auth (login + JWT + session) + Registration page + HR Employee Profiles.
- **Bangling Yin** ([@Bonnie998](https://github.com/Bonnie998)) — HR-side features (Hiring Management, Application Review, HR Visa Status).
