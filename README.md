# Integrated Student Support & Academic Service Platform (ISSASP)

A centralized digital platform where students raise academic/support requests, track their status, and receive verified responses from relevant departments.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Redis (optional, for notifications)
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
Login: `admin@university.edu` / `Admin@123`

---

## 🛠 Tech Stack

| Layer       | Tech |
|-------------|------|
| Frontend    | React 18, Vite, React Router v6, Axios |
| Backend     | Node.js, Express 4 |
| Database    | MongoDB + Mongoose |
| Auth        | JWT (httpOnly cookies) + bcryptjs |
| Access      | Role-Based Access Control (RBAC) |
| Email       | Nodemailer |
| Cache       | Redis (optional) |
| Deployment  | Docker + Docker Compose |

---

## ▲ Deploy on Vercel

Deploy as **two Vercel projects**: one for backend (`server`) and one for frontend (`client`).

### 1) Deploy Backend API (`server`)

1. In Vercel, click **New Project** and import this repo.
2. Set **Root Directory** to `server`.
3. Keep defaults (Vercel uses `server/vercel.json` to route `/api/*` to Express).
4. Add Environment Variables:
	 - `MONGO_URI`
	 - `JWT_SECRET`
	 - `JWT_EXPIRES_IN` (optional, e.g. `7d`)
	 - `CLIENT_URL` (your frontend Vercel URL, e.g. `https://your-app.vercel.app`)
	 - `NODE_ENV=production`
	 - `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM` (if email features are used)
5. Deploy and copy backend URL (example: `https://issasp-api.vercel.app`).

### 2) Deploy Frontend (`client`)

1. Create another **New Project** from same repo.
2. Set **Root Directory** to `client`.
3. Add Environment Variable:
	 - `VITE_API_BASE_URL=https://issasp-api.vercel.app/api`
4. Deploy.

### 3) Final CORS Check

- In backend project environment variables, ensure:
	- `CLIENT_URL=https://your-frontend-project.vercel.app`
- Redeploy backend once after setting `CLIENT_URL`.

### 4) Quick Verification

- Open frontend URL and test login/register.
- Verify API health:
	- `https://your-backend-project.vercel.app/api/health`
