# eVoting System — Backend API

Node.js + Express + MongoDB backend for the eVoting MERN project.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy and configure environment
cp .env.example .env
# Edit .env — set your MONGO_URI and JWT_SECRET

# 3. Start server (seeds DB automatically on first run)
npm start

# Development mode (auto-restart)
npm run dev
```

---

## Project Structure

```
evoting-backend/
├── config/
│   └── db.js                  # Mongoose connection helper
├── controllers/
│   ├── authController.js      # register, login, getMe
│   ├── candidateController.js # getCandidates, getCandidateById
│   ├── voteController.js      # castVote, getVoteStatus, getResults
│   ├── adminController.js     # stats, activity, voters, export, election CRUD
│   └── profileController.js  # getProfile
├── middleware/
│   ├── auth.js                # protect (JWT verify) + adminOnly
│   └── validate.js            # express-validator error handler
├── models/
│   ├── User.js                # voterId, name, email, password, dob, state, role, hasVoted
│   ├── Candidate.js           # candidateId, name, party, voteCount …
│   ├── Vote.js                # voter ref, candidate ref, transactionId
│   ├── ActivityLog.js         # action, user, status, timestamps
│   └── Election.js            # title, deadline, totalRegistered
├── routes/
│   ├── authRoutes.js
│   ├── candidateRoutes.js
│   ├── voteRoutes.js
│   ├── adminRoutes.js
│   └── profileRoutes.js
├── utils/
│   ├── generateToken.js       # JWT sign helper
│   └── seeder.js              # Seeds candidates, admin user, election on first run
├── .env.example
├── .gitignore
├── package.json
└── server.js
```

---

## Seeded Data (auto-created on first run)

| Role  | Voter ID  | Password   |
|-------|-----------|------------|
| Admin | ADMIN001  | Admin@123  |

5 candidates are seeded with realistic vote counts.

---

## API Endpoints

### Auth  `/api/auth`

| Method | Route           | Auth     | Description                          |
|--------|-----------------|----------|--------------------------------------|
| POST   | `/register`     | Public   | Register new voter                   |
| POST   | `/login`        | Public   | Login with voterId + password → JWT  |
| GET    | `/me`           | 🔒 JWT   | Get current logged-in user           |

**Register body:**
```json
{
  "voterId": "VOTER-XYZ123",
  "name": "John Smith",
  "email": "john@example.com",
  "password": "Password1",
  "dob": "1990-05-20",
  "state": "California"
}
```

**Login body:**
```json
{ "voterId": "VOTER001", "password": "password123" }
```

---

### Candidates  `/api/candidates`

| Method | Route              | Auth   | Description                           |
|--------|--------------------|--------|---------------------------------------|
| GET    | `/`                | 🔒 JWT | List all candidates (search optional) |
| GET    | `/:candidateId`    | 🔒 JWT | Get single candidate (c001…c005)      |

Query: `GET /api/candidates?search=green`

---

### Votes  `/api/votes`

| Method | Route       | Auth   | Description                        |
|--------|-------------|--------|------------------------------------|
| POST   | `/cast`     | 🔒 JWT | Cast vote for a candidate          |
| GET    | `/status`   | 🔒 JWT | Has current user voted?            |
| GET    | `/results`  | 🔒 JWT | Aggregated results + turnout %     |

**Cast vote body:**
```json
{ "candidateId": "c001" }
```

---

### Profile  `/api/profile`

| Method | Route | Auth   | Description                           |
|--------|-------|--------|---------------------------------------|
| GET    | `/`   | 🔒 JWT | Full profile + vote status + txn ID   |

---

### Admin  `/api/admin`  *(requires admin role)*

| Method | Route                        | Description                        |
|--------|------------------------------|------------------------------------|
| GET    | `/stats`                     | Dashboard stats (votes, turnout …) |
| GET    | `/activity`                  | Last 50 activity log entries       |
| GET    | `/voters`                    | All registered voters              |
| GET    | `/export`                    | Results data for CSV export        |
| GET    | `/election`                  | Current election info              |
| PUT    | `/election`                  | Update election title / deadline   |
| POST   | `/candidates`                | Add a new candidate                |
| PUT    | `/candidates/:candidateId`   | Update candidate info              |
| DELETE | `/candidates/:candidateId`   | Soft-delete candidate              |

---

## Authentication

All protected routes require:

```
Authorization: Bearer <token>
```

Token is returned on login/register. Store it in localStorage or state on the frontend.

---

## Connecting to Frontend

In your React `src/services/api.js`, replace the mock functions with real `fetch`/`axios` calls to `http://localhost:5000/api/...` and pass the JWT token in the Authorization header.

Example:
```js
const BASE = 'http://localhost:5000/api';
const token = localStorage.getItem('evoting_token');

export const fetchCandidates = async (search = '') => {
  const res = await fetch(`${BASE}/candidates?search=${search}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  return data.candidates;
};
```
