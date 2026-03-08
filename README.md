# Integrated Student Support & Academic Service Platform (ISSASP)

A centralized digital platform where students raise academic/support requests, track their status, and receive verified responses from relevant departments.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Supabase project (Auth + Postgres)
- Docker & Docker Compose (optional)

---

### Option A — Run with Docker (Recommended)

```bash
git clone https://github.com/your-repo/issasp.git
cd issasp
cp .env.example .env        # Fill in your values
docker-compose up --build
```

- Frontend: http://localhost:5173
- Backend:  http://localhost:5000

---

### Option B — Run Manually

**Backend**
```bash
cd server
npm install
cp ../.env.example .env     # Fill in values
npm run dev
```

Before first run, execute `server/supabase/schema.sql` in your Supabase SQL Editor.

**Frontend**
```bash
cd client
npm install
npm run dev
```

---

## 📁 Project Structure

```
issasp/
├── client/          # React + Vite frontend
├── server/          # Node.js + Express backend
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 👤 Default Roles

| Role    | Capabilities |
|---------|-------------|
| student | Raise queries, track status, view profile |
| admin   | Manage all queries, assign, respond, analytics |
| faculty | View & respond to queries in their department |

---

## 🔑 Seed Admin Account

After running the server, seed an admin:
```bash
cd server && npm run seed
```
Login: `admin@university.edu` / `admin123`

If admin does not exist, create/update admin safely:
```bash
cd server
ADMIN_EMAIL="admin@university.edu" ADMIN_PASSWORD="admin123" npm run create-admin
```

Or auto-create/update admin on backend startup (recommended for Vercel):
- `BOOTSTRAP_ADMIN_EMAIL` (example: `newadmin@university.edu`)
- `BOOTSTRAP_ADMIN_PASSWORD` (example: `NewAdmin@123`)
- `BOOTSTRAP_ADMIN_NAME` (optional)
- `BOOTSTRAP_ADMIN_FORCE_RESET=true` (optional, resets password on deploy)

---

## 🛠 Tech Stack

| Layer       | Tech |
|-------------|------|
| Frontend    | React 18, Vite, React Router v6, Axios |
| Backend     | Node.js, Express 4 |
| Database    | Supabase Postgres |
| Auth        | Supabase Auth |
| Access      | Role-Based Access Control (RBAC) |
| Email       | Nodemailer |
| Deployment  | Docker + Docker Compose |

---

## ▲ Deploy on Vercel

Deploy as **two Vercel projects**: one for backend (`server`) and one for frontend (`client`).

### 1) Deploy Backend API (`server`)

1. In Vercel, click **New Project** and import this repo.
2. Set **Root Directory** to `server`.
3. Keep defaults (Vercel uses `server/vercel.json` to route `/api/*` to Express).
4. Add Environment Variables:
	 - `SUPABASE_URL` (e.g. `https://your-project-ref.supabase.co`)
	 - `SUPABASE_ANON_KEY` (your Supabase anon public key)
	 - `SUPABASE_SERVICE_ROLE_KEY` (your Supabase service role key)
	 - `CLIENT_URL` (your frontend Vercel URL, e.g. `https://your-app.vercel.app`)
	 - `BOOTSTRAP_ADMIN_EMAIL` (e.g. `newadmin@university.edu`)
	 - `BOOTSTRAP_ADMIN_PASSWORD` (e.g. `NewAdmin@123`)
	 - `BOOTSTRAP_ADMIN_FORCE_RESET=true` (for first deploy with new password)
	 - `NODE_ENV=production`
	 - `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM` (if email features are used)
5. Deploy and copy backend URL (example: `https://issasp-api.vercel.app`).

### 2) Deploy Frontend (`client`)

1. Create another **New Project** from same repo.
2. Set **Root Directory** to `client`.
3. Add Environment Variable:
	 - `VITE_API_BASE_URL=https://issasp-api.vercel.app/api`
	 - `VITE_SUPABASE_URL=https://your-project-ref.supabase.co`
	 - `VITE_SUPABASE_ANON_KEY=your_supabase_anon_key`
4. Deploy.

### 3) Final CORS Check

- In backend project environment variables, ensure:
	- `CLIENT_URL=https://your-frontend-project.vercel.app`
- Redeploy backend once after setting `CLIENT_URL`.

### 4) Quick Verification

- Open frontend URL and test login/register.
- Verify API health:
	- `https://your-backend-project.vercel.app/api/health`
