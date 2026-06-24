# 🔐 Full-Stack Auth App — Beginner Guide
### Next.js + Node.js + PostgreSQL

A complete login & registration system built for beginners.  
By the end of this guide, you'll have a working app running on your computer.

---

## 📁 Project Structure

```
auth-app/
├── backend/                  ← Node.js + Express API
│   ├── server.js             ← Main server file (start here!)
│   ├── db.js                 ← Database connection
│   ├── setup-database.sql    ← Run once to create the table
│   ├── .env.example          ← Copy this to .env and fill in your details
│   └── package.json          ← Node dependencies
│
└── frontend/                 ← Next.js React app
    ├── app/
    │   ├── layout.js         ← Global styles & layout
    │   ├── page.js           ← Home (redirects to login/dashboard)
    │   ├── login/page.js     ← Login form
    │   ├── register/page.js  ← Registration form
    │   └── dashboard/page.js ← Protected user dashboard
    ├── lib/
    │   └── api.js            ← Helper functions for API calls
    └── package.json          ← Next.js dependencies
```

---

## 🛠️ What You Need to Install First

Before starting, install these free tools:

| Tool | What it's for | Download |
|------|--------------|---------|
| **Node.js** (v18+) | Runs JavaScript outside the browser | https://nodejs.org |
| **PostgreSQL** | The database | https://www.postgresql.org/download |
| **VS Code** | Code editor | https://code.visualstudio.com |

### Recommended VS Code Extensions
Open VS Code → press `Ctrl+Shift+X` → search and install:
- **ESLint** — catches code errors
- **Prettier** — auto-formats code
- **PostgreSQL** (by Chris Kolkman) — view your database in VS Code

---

## 🚀 Step-by-Step Setup

### Step 1 — Set Up PostgreSQL

**Option A: Using pgAdmin (graphical tool, easier for beginners)**
1. Open pgAdmin (installed with PostgreSQL)
2. Right-click "Databases" → "Create" → "Database"
3. Name it `auth_db` → click Save
4. Click `auth_db` → click the "Query Tool" button
5. Paste this and click Run (▶):
```sql
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(255) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Option B: Using the terminal**
```bash
# Open terminal and connect to PostgreSQL
psql -U postgres

# Inside psql, create the database
CREATE DATABASE auth_db;

# Connect to it
\c auth_db

# Run the setup script
\i path/to/auth-app/backend/setup-database.sql

# Exit
\q
```

---

### Step 2 — Set Up the Backend

**Open a terminal in VS Code** (`Ctrl+` ` ` or Terminal → New Terminal)

```bash
# Go into the backend folder
cd auth-app/backend

# Install dependencies (express, bcrypt, jwt, pg, etc.)
npm install

# Create your .env file from the example
# On Windows:
copy .env.example .env
# On Mac/Linux:
cp .env.example .env
```

**Now edit `.env`** with your PostgreSQL password:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=auth_db
DB_USER=postgres
DB_PASSWORD=YOUR_ACTUAL_POSTGRES_PASSWORD
JWT_SECRET=any-long-random-string-you-make-up
PORT=5000
```

> ⚠️ Never share your `.env` file or commit it to GitHub!

**Start the backend:**
```bash
npm run dev
```

You should see:
```
✅ Connected to PostgreSQL database successfully!
🚀 Backend server running at http://localhost:5000
```

**Test it:** Open your browser and go to http://localhost:5000/api/health  
You should see: `{"status":"ok","message":"Server is running!"}`

---

### Step 3 — Set Up the Frontend

**Open a SECOND terminal** (click the `+` button in VS Code's terminal panel)

```bash
# Go into the frontend folder
cd auth-app/frontend

# Install Next.js and React
npm install

# Start the Next.js development server
npm run dev
```

You should see:
```
▲ Next.js 14.0.0
- Local: http://localhost:3000
✓ Ready
```

---

### Step 4 — Open the App

Go to **http://localhost:3000** in your browser.

You'll be taken to the login page. Click "Create one" to register!

---

## 🧪 Testing the App

1. **Register** — Go to `/register`, fill in the form, click "Create account"
2. **Dashboard** — You'll land on a dashboard showing your user info
3. **Log out** — Click "Log out" to return to login
4. **Log in again** — Use the same email and password you registered with

---

## 🔍 Understanding the Code

### How registration works:
```
User fills form → Frontend sends to POST /api/register
→ Backend validates input
→ Checks email doesn't already exist (in PostgreSQL)
→ Hashes the password with bcrypt (so it's never stored as plain text)
→ Saves user to database
→ Creates a JWT token
→ Sends token back to frontend
→ Frontend saves token to localStorage
→ User is redirected to dashboard
```

### How login works:
```
User fills form → Frontend sends to POST /api/login
→ Backend finds user by email (in PostgreSQL)
→ Compares entered password to stored hash (bcrypt.compare)
→ If match → creates JWT token → sends to frontend
→ Frontend saves token → redirects to dashboard
```

### What is JWT?
A **JSON Web Token** is a secure string that proves who you are.  
It looks like: `eyJhbG...` (very long string)  
The backend creates it after login, and the frontend sends it with every request.

---

## 🛑 Common Errors & Fixes

| Error | Fix |
|-------|-----|
| `ECONNREFUSED 5432` | PostgreSQL isn't running. Start it from Services (Windows) or `brew services start postgresql` (Mac) |
| `password authentication failed` | Wrong password in your `.env` file |
| `relation "users" does not exist` | You haven't run the SQL setup script yet |
| `Cannot find module 'express'` | Run `npm install` in the backend folder |
| Frontend shows blank page | Make sure both backend (port 5000) AND frontend (port 3000) are running |
| `JWT_SECRET is not defined` | Your `.env` file is missing or not in the right folder |

---

## 📚 What Each File Does

### Backend

**`server.js`** — The heart of the backend. Creates the Express server and defines 3 routes:
- `GET /api/health` — Check if server is running
- `POST /api/register` — Create a new account
- `POST /api/login` — Sign in to an existing account
- `GET /api/me` — Get current user info (requires token)

**`db.js`** — Connects to PostgreSQL using the `pg` library (node-postgres).

**`.env`** — Your secret config (passwords, JWT secret). Never share this!

### Frontend

**`app/layout.js`** — Wraps every page. Contains global CSS styles.

**`app/login/page.js`** — The login form. Uses React `useState` hooks to track form values.

**`app/register/page.js`** — The registration form with password strength indicator.

**`app/dashboard/page.js`** — Protected page. Checks for a valid token before showing content.

**`lib/api.js`** — Helper functions that call the backend API using `fetch()`.

---

## 🎯 Next Steps (When You're Ready)

Once you understand this project, try adding:

- **Forgot password** — Send a reset email (use Nodemailer)
- **Profile page** — Let users update their name or avatar
- **Google login** — Use OAuth / NextAuth.js
- **Remember me** — Longer JWT expiry or refresh tokens
- **Email verification** — Require users to verify their email
- **Rate limiting** — Prevent too many login attempts

---

## 🔒 Security Notes (For Production)

This project is for **learning purposes**. For a real app, also do:

- Move JWT token to an **httpOnly cookie** (safer than localStorage)
- Add **rate limiting** to prevent brute force attacks
- Use **HTTPS** (TLS/SSL)
- Add **email verification** before allowing login
- Set a strong, random `JWT_SECRET` (32+ characters)
- Use environment variables in production (never hardcode secrets)
