# 🗳️ eVoting System — Full Stack MERN Application

A secure, full-stack electronic voting system built with **MongoDB, Express, React, Node.js**.

---

## 📁 Project Structure

```
evoting-fullstack/
├── backend/                    ← Node.js + Express + MongoDB
│   ├── config/db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── candidateController.js
│   │   ├── voteController.js
│   │   ├── adminController.js
│   │   └── profileController.js
│   ├── middleware/
│   │   ├── auth.js             ← JWT protect + adminOnly
│   │   └── validate.js         ← express-validator
│   ├── models/
│   │   ├── User.js
│   │   ├── Candidate.js
│   │   ├── Vote.js
│   │   ├── ActivityLog.js
│   │   └── Election.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── candidateRoutes.js
│   │   ├── voteRoutes.js
│   │   ├── adminRoutes.js
│   │   └── profileRoutes.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── seeder.js           ← Auto-seeds DB on first run
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── frontend/                   ← React + Tailwind CSS
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CandidateCard.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── UI.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.js  ← JWT-based, talks to backend
│   │   │   └── ThemeContext.js
│   │   ├── data/
│   │   │   └── candidates.js   ← Minimal fallback only
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── VotingPage.jsx
│   │   │   ├── ResultsPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── AdminPage.jsx
│   │   ├── services/
│   │   │   └── api.js          ← All HTTP calls to backend
│   │   └── utils/helpers.js
│   ├── .env
│   └── package.json
│
├── package.json                ← Root: run both with one command
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB running locally (or MongoDB Atlas URI)

### Step 1 — Install all dependencies

```bash
# From the root evoting-fullstack/ folder:
npm run install:all
```

Or manually:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### Step 2 — Configure environment

Backend `.env` is already pre-filled. Edit `backend/.env` if you use MongoDB Atlas:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/evoting_db
JWT_SECRET=your_long_random_secret_here
```

### Step 3 — Run both servers together

```bash
# From the root folder:
npm run dev
```

Or separately in two terminals:
```bash
# Terminal 1 — Backend (port 5000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend && npm start
```

### Step 4 — Open in browser

```
Frontend:  http://localhost:3000
Backend:   http://localhost:5000/api/health
```

---

## 🌱 Auto-Seeded Data

On first run, the backend **automatically seeds** the database with:

| Role  | Voter ID | Password   |
|-------|----------|------------|
| Admin | ADMIN001 | Admin@123  |

Plus 5 candidates and election info. Voter accounts are created via the Register page.

---

## 🔐 Security Features

| Feature | Implementation |
|---------|---------------|
| Password hashing | bcryptjs (12 rounds) |
| Authentication | JWT (7-day expiry) |
| Protected routes | Middleware on every non-public API |
| Role-based access | `voter` vs `admin` roles |
| One vote per user | DB-level unique constraint on Vote model |
| Input validation | express-validator on all POST routes |
| CORS | Restricted to frontend origin |

---

## 📡 API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | Public | Register new voter |
| POST | `/api/auth/login` | Public | Login → JWT token |
| GET | `/api/auth/me` | 🔒 | Get current user |
| GET | `/api/candidates` | 🔒 | List candidates (search) |
| GET | `/api/candidates/:id` | 🔒 | Single candidate |
| POST | `/api/votes/cast` | 🔒 | Cast a vote |
| GET | `/api/votes/status` | 🔒 | Did user vote? |
| GET | `/api/votes/results` | 🔒 | Aggregated results |
| GET | `/api/profile` | 🔒 | Full voter profile |
| GET | `/api/admin/stats` | 🔒 Admin | Dashboard stats |
| GET | `/api/admin/activity` | 🔒 Admin | Activity log |
| GET | `/api/admin/export` | 🔒 Admin | Export results data |
| GET | `/api/admin/voters` | 🔒 Admin | All voters list |
| GET | `/api/admin/election` | 🔒 Admin | Election info |
| PUT | `/api/admin/election` | 🔒 Admin | Update election |
| POST | `/api/admin/candidates` | 🔒 Admin | Add candidate |
| PUT | `/api/admin/candidates/:id` | 🔒 Admin | Update candidate |
| DELETE | `/api/admin/candidates/:id` | 🔒 Admin | Remove candidate |

---

## 🎨 Frontend Pages

| Route | Page | Access |
|-------|------|--------|
| `/login` | Login with Voter ID + Password | Public |
| `/register` | 2-step voter registration | Public |
| `/dashboard` | Welcome + stats + standings | Voter |
| `/vote` | Browse candidates + cast vote | Voter |
| `/results` | Live charts + leaderboard | Voter |
| `/profile` | Personal info + vote receipt | Voter |
| `/admin` | Full election management | Admin only |
