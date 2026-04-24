# Employee Management Portal

Team project scaffold. Two folders, nothing implemented yet.

## Stack

- Backend: Node/Express + MongoDB (Mongoose)
- Frontend: React + Redux Toolkit + MUI, forms with react-hook-form
- JWT auth, Nodemailer for registration emails, Multer for uploads

## Running locally

Two terminals:

```bash
cd backend
cp .env.example .env     # set MONGO_URI, JWT_SECRET, SMTP_*
npm install
npm run dev              # :3001
```

```bash
cd frontend
cp .env.example .env
npm install
npm start                # :3000
```

## Git

- branch off `main` as `feat/<thing>` or `fix/<thing>`
- open a PR, don't push straight to main

## Status

Nothing wired up yet, all route handlers return 501. Next up: Mongoose
schemas, then auth flow end to end.
