# Skill Merge Leaderboard

Full-stack CTF leaderboard with role-based login (`admin`, `player`), challenge management, answer/flag submission, and MySQL persistence.

## Stack

- Frontend: React + Vite + Tailwind
- Backend: Node.js + Express + JWT + MySQL (`mysql2`)
- Database: MySQL 8 (`schema.sql`)
- Containers: Docker Compose (`frontend`, `backend`, `mysql`)

## Features

- Landing leaderboard page at `/`
- Login/register page at `/login`
- Player dashboard at `/player`
  - View active challenges
  - Submit flag/answer
  - See failed attempts and solved status
- Admin dashboard at `/admin`
  - Create challenges with required answer, optional `answerFormat`, optional `hint`
  - View challenge stats (solves and failed attempts)
  - View recent submissions
- Bootstrap setup on backend start:
  - Always ensures first admin user exists
  - Optional bootstrap player via env vars

## Database

`schema.sql` creates:

- `users`
- `challenges`
- `submissions`
- `solves`
- `leaderboard_view`

Roles are enforced in DB and API as `admin` and `player`.

## Local Development

### 1. Start MySQL and initialize schema

```bash
mysql -u root -p < schema.sql
```

### 2. Run backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Backend default: `http://localhost:4000`

### 3. Run frontend

```bash
cd ..
npm install
cp .env.example .env
npm run dev
```

Frontend default: `http://localhost:5173`

## Docker (Independent Full Run)

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:4000/api`
- MySQL: `localhost:3306`

`schema.sql` is auto-applied through MySQL init mount.

## Environment Variables

### Frontend (`.env`)

- `VITE_API_BASE_URL` (example: `http://localhost:4000/api` for local dev)

### Backend (`backend/.env`)

- `PORT`
- `CORS_ORIGIN`
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `BCRYPT_ROUNDS`
- `ADMIN_USERNAME`, `ADMIN_PASSWORD` (first admin bootstrap)
- `PLAYER_USERNAME`, `PLAYER_PASSWORD` (optional first player bootstrap)
