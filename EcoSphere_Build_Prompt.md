# EcoSphere — ESG Management Platform: Build Prompt

Paste this whole prompt into your AI coding tool (Claude Code, Cursor, v0, Lovable, etc.) to scaffold and build the app.

---

## Project Overview

Build **EcoSphere**, a full-stack web application that lets an organization measure, manage, and improve its Environmental, Social, and Governance (ESG) performance. The platform integrates operational data, employee participation, and compliance activity into one dashboard, and uses gamification (XP, badges, rewards, leaderboards) to drive employee engagement.

Two user types exist:
- **Admin / Manager** — sets up master data, logs/verifies operational activity, approves submissions, runs audits, views org-wide analytics.
- **Employee** — joins CSR activities and challenges, uploads proof, acknowledges policies, tracks their own XP/badges/leaderboard rank, redeems rewards.

---

## Tech Stack (adjust to your preference, but default to this)

- **Frontend:** React + TypeScript, Tailwind CSS, shadcn/ui components, Recharts for charts
- **Backend:** Node.js (Express) or a BaaS like Supabase/Firebase — pick whichever lets you move fastest
- **Database:** PostgreSQL (relational — this app is relationship-heavy)
- **Auth:** Email/password with role-based access control (Admin, Manager, Employee)
- **File uploads:** for proof photos/documents (S3-compatible storage, or local storage for a hackathon)

---

## Data Model

### Master Data
- **Department**: name, code, head, parent department (self-referencing for hierarchy), employee count, status
- **Category**: name, type (`CSR_ACTIVITY` | `CHALLENGE`), status — shared category values
- **Emission Factor**: activity/fuel type, CO2-equivalent value per unit, unit
- **Product ESG Profile**: product, linked emission data
- **Environmental Goal**: target metric, target value, deadline, department (optional)
- **ESG Policy**: title, document/file, effective date, department scope
- **Badge**: name, description, unlock rule (e.g. `xp >= 500` or `completed_challenges >= 3`), icon
- **Reward**: name, description, points required, stock, status

### Transactional Data
- **Carbon Transaction**: source (Purchase/Manufacturing/Expense/Fleet), quantity, emission factor used, calculated CO2, department, date
- **CSR Activity**: title, category, description, date, department, status
- **Employee Participation**: employee, activity, proof file, approval status, points earned, completion date
- **Challenge**: title, category, description, XP value, difficulty, evidence required (bool), deadline, status (`Draft → Active → Under Review → Completed`, or `Archived` at any point)
- **Challenge Participation**: challenge, employee, progress, proof file, approval status, XP awarded
- **Policy Acknowledgement**: employee, policy, acknowledged date
- **Audit**: scope, date, auditor, status
- **Compliance Issue**: audit (FK), severity, description, owner, due date, status (flag if overdue & still open)
- **Department Score**: department, environmental score, social score, governance score, total score (computed/aggregated)

---

## Core Modules & Features

### 1. Environmental
- Configure Emission Factors (admin)
- Log/auto-calculate Carbon Transactions (auto-calc from Purchase/Manufacturing/Expense/Fleet records when a "Settings" toggle is enabled — no manual entry needed)
- Department-level carbon tracking view
- Sustainability Goals with progress tracking
- Environmental dashboard (CO2 over time, by department, vs. goals)

### 2. Social
- CSR Activity creation (admin) and browsing (employee)
- Employee joins an activity → uploads proof → admin approves → points awarded
- Diversity metrics view (basic demographic breakdown, admin-only)
- Training completion tracking

### 3. Governance
- ESG Policy publishing (admin uploads policy)
- Employee policy acknowledgement flow (employee must click "I Acknowledge")
- Audit creation and tracking (admin/auditor)
- Compliance Issue tracker: must have owner + due date; auto-flag if overdue and still open (like a lightweight Jira)

### 4. Gamification
- Challenges: full lifecycle Draft → Active → Under Review → Completed (or Archived anytime)
- Employees join challenges, log progress, upload proof if required, get approved, earn XP
- Badges: auto-award when an employee's XP or completed-challenge count satisfies the Badge's unlock rule (toggle in settings)
- Rewards: redeem earned points for a reward from a catalog, subject to stock; redemption deducts points
- Leaderboard: ranks employees (and/or departments) by XP/points

### 5. Scoring & Dashboard
- Each department gets an Environmental Score, Social Score, Governance Score (define simple formulas — e.g., % of goals met, % participation rate, % compliance issues resolved on time)
- Department Total Score = combination of the three
- Overall Org ESG Score = weighted average of department scores (default weighting: Environmental 40% / Social 30% / Governance 30%, configurable)
- Org-wide dashboard: KPI cards + charts (CO2 trend, participation rate, compliance status, XP leaderboard preview)

### 6. Reports
Generate: Environmental Report, Social Report, Governance Report, ESG Summary Report, and a Custom Report Builder (combine filters, export PDF/Excel/CSV).
Filters to support: Department, Date Range, Module, Employee, Challenge, ESG Category.

### 7. Settings & Administration
- Departments management
- Category management
- ESG configuration: score weighting, feature toggles (Auto Emission Calculation, Evidence Requirement, Badge Auto-Award)
- Notification Settings

### 8. Notifications (in-app minimum, email optional)
Trigger on: new compliance issue raised, CSR/Challenge approval decisions, policy acknowledgement reminders, badge unlocks, overdue compliance issues.

---

## Key Business Rules (must enforce)
- CSR Activity participation cannot be marked Approved without an attached proof file, if "Evidence Requirement" is enabled.
- Badge auto-assignment must fire automatically the moment an employee's tracked metric satisfies the unlock rule (if toggle is on) — no manual admin step.
- Every Compliance Issue must have an Owner and a Due Date; flag it if overdue and still Open.
- Reward redemption must check stock availability and deduct points from the employee's balance atomically.
- Auto Emission Calculation (if enabled) computes Carbon Transactions from linked operational records using the correct Emission Factor — no manual entry.

---

## User Flows to Implement

**Employee flow:**
1. Log in → land on personal dashboard (my XP, my badges, my pending approvals)
2. Browse & join CSR Activities → upload proof → wait for approval
3. Browse & join Challenges → log progress → upload proof if required → wait for approval
4. Acknowledge new policies when prompted
5. Check leaderboard rank
6. Redeem points for a reward from the catalog

**Admin/Manager flow:**
1. Set up Departments, Categories, Emission Factors, Policies, Sustainability Goals
2. Log or verify Carbon Transactions (or configure auto-calculation)
3. Create CSR Activities and Challenges
4. Approve/reject employee CSR and Challenge submissions
5. Create Audits, track Compliance Issues, assign owners
6. View org-wide ESG dashboard and generate reports
7. Configure scoring weights and system settings

---

## Build Priority (if time-constrained, e.g. hackathon)
1. Auth + roles (Admin/Employee) + Departments/Categories setup
2. Social module: CSR Activity creation → join → proof upload → approval → XP award
3. Gamification: XP tracking, Badge auto-unlock, Leaderboard
4. Environmental module: manual Carbon Transaction logging + simple emission calc + chart
5. Dashboard: pull KPIs from the above into cards + 1-2 charts
6. Governance module: Policy + Acknowledgement + basic Compliance Issue tracker
7. Reports (can be a simplified filtered table + CSV export if time is short)
8. Rewards redemption + Notifications (polish, if time allows)

---

## Deliverable
A responsive web app with:
- Working authentication and role-based views
- All 4 core modules functioning end-to-end (not just UI mockups — actual data flow: create → participate → approve → score update)
- A dashboard tying the modules together with real computed numbers
- At least one working report export (CSV or PDF)

Keep the UI clean and dashboard-first — ESG tools live and die by how easy it is to see the big picture at a glance.
