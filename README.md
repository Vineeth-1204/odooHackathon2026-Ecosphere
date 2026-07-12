# Ecosphere - ESG & Sustainability Platform

Ecosphere is a modern, modular web application designed for tracking and managing corporate Environmental, Social, and Governance (ESG) performance.

This codebase contains the implementation for **Team Member 1 — Authentication & Core Administration**.

---

## Technical Stack
* **Frontend**: React (Vite), TypeScript, Tailwind CSS, Lucide Icons, React Router DOM v6
* **Backend**: Express.js, TypeScript, Prisma ORM, CORS, JSON Web Token (JWT), bcryptjs
* **Database**: PostgreSQL (Prisma Client)

---

## Directory Structure
```text
ecosphere/
├── frontend/             # Vite + React Client
│   ├── src/
│   │   ├── components/   # Navbar, Sidebar, Reusable cards, Protected/Role routing guards
│   │   │   └── ui/       # Shared UI primitives (Button, Input, Modal, Dialog, Table, SearchBar...)
│   │   ├── context/      # Global Authentication State Context
│   │   ├── pages/        # Login, Register, Forgot Password, Admin Dashboard, Users, Depts, Settings...
│   │   ├── services/     # API service layer (authService, userService, departmentService...)
│   │   ├── routes/       # Router indexing
│   │   └── theme.ts      # Visual token overrides
│
└── backend/              # Node + Express API
    ├── controllers/      # Route controllers (auth, user, department, category, settings)
    ├── routes/           # REST endpoints mapping
    ├── middleware/       # JWT Authentication & Role-based Authorization guards
    ├── models/           # Custom validation logics and DTO interfaces
    └── prisma/           # Prisma configurations, seeds, and PostgreSQL migrations
```

---

## Getting Started

### 1. Database Configuration
Rename/configure your environment values in `backend/.env`. Set your PostgreSQL server address:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecosphere?schema=public"
```

Then, run database migrations and seed default values:
```bash
# Inside backend/
npx prisma migrate dev --name init
npx prisma db seed
```

### 2. Run the Application
You can run both client and server concurrently from the root directory:
```bash
# In workspace root (runs concurrently)
npm install
npm run install:all # installs frontend and backend dependencies
npm run dev         # starts API on port 5000 and Web client on port 3000
```

---

## Seed Credentials
The database seed script generates the following default testing credentials:

### 1. System Administrator
* **Email**: `admin@ecosphere.com`
* **Password**: `adminPassword123`
* **Role**: `ADMIN`
* **Permissions**: Access to User Accounts, Settings Dashboard, and Category configs.

### 2. Standard User
* **Email**: `employee@ecosphere.com`
* **Password**: `userPassword123`
* **Role**: `USER`
* **Permissions**: General metrics reading, department lookup, Profile updates.
