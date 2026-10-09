# BUILDREC — Construction Site Management System

**BUILDREC** is an integrated construction site management platform designed to streamline multi-site operations. It unifies project planning, material procurement, site inventory, field progress tracking, contractor billing, and payments into a single cohesive workflow backed by real-time analytics and strict data integrity.

---

## 📑 Project Presentations & Documentation

The official project review slide decks are available directly in the root repository:

| Presentation | Topic | Link |
| :--- | :--- | :--- |
| **Review 2 Final** | 3NF Schema Design, ER Modeling, Relational Algebra & SQL Views | [**DBMS_Review2_Final.pdf**](./DBMS_Review2_Final.pdf) |
| **Review 3 Final** | Full-Stack Architecture, Business Logic Triggers & Final System Demo | [**BUILDREC_Review3.pdf**](./BUILDREC_Review3.pdf) |

---

## Architecture & Directory Structure

The repository is structured into distinct, decoupled top-level directories:

```
DBMS/
├── frontend/                    # Frontend Application (React 19 + TypeScript + Vite)
│   ├── src/
│   │   ├── components/          # Reusable UI components (Navbar, Sidebar, Modal, StatCard)
│   │   ├── pages/               # Feature pages (Dashboard, Projects, Procurement, etc.)
│   │   ├── api.ts               # Type-safe API client connecting to backend
│   │   ├── types.ts             # Frontend TypeScript domain interfaces
│   │   ├── App.tsx              # Main application shell with navigation
│   │   ├── main.tsx             # Application bootstrap
│   │   └── index.css            # Tailored styling & design system
│   ├── public/                  # Official BUILDREC brand logo, icons, and favicons
│   ├── package.json             # Frontend dependencies and scripts (buildrec-frontend)
│   ├── tailwind.config.js       # Tailwind CSS configuration
│   ├── vite.config.ts           # Vite development and bundle configuration
│   └── README.md                # Frontend documentation
│
├── backend/                     # Backend API (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── config/              # DB connection pool (mysql2) & in-memory store
│   │   ├── routes/              # Modular REST route controllers
│   │   ├── types/               # Backend domain entity TypeScript interfaces
│   │   └── index.ts             # Express server entry point
│   ├── .env.example             # Environment configuration template
│   ├── .gitignore               # Backend-specific ignore rules
│   ├── package.json             # Backend dependencies and scripts (buildrec-backend)
│   ├── tsconfig.json            # TypeScript configuration
│   └── README.md                # Backend documentation
│
├── database/                    # Database Layer (DDL, DML, Triggers, Views)
│   ├── database_setup.sql       # 15 normalized MySQL tables, triggers, & seed data
│   ├── review2_queries.sql      # Analytical, aggregation, and join reporting queries
│   ├── view_all_tables.sql      # Table inspection verification script
│   └── README.md                # Database documentation & trigger logic guide
│
├── BUILDREC_Review3.pdf         # Review 3 Final Presentation (Full-Stack System Delivery)
├── DBMS_Review2_Final.pdf       # Review 2 Presentation (Schema, ERD, Relational Algebra)
├── .gitignore                   # Repository-level ignore rules
├── package.json                 # Monorepo orchestration scripts
└── README.md                    # Master project documentation
```

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts
- **Backend**: Node.js, Express, TypeScript, mysql2, tsx
- **Database**: MySQL (15 normalized relational tables, automated triggers, analytical views)

---

## Quickstart

### 1. Database Setup
Import the database schema and sample data into your local MySQL server:
```bash
mysql -u root -p < database/database_setup.sql
```

### 2. Backend Setup & Startup
```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL credentials (DB_USER, DB_PASSWORD, etc.)
npm install
npm run dev
```
The backend API server runs at `http://localhost:5000`.

### 3. Frontend Setup & Startup
```bash
cd frontend
npm install
npm run dev
```
The frontend web application runs at `http://localhost:5173`.

### 4. Monorepo Scripts (Root)
From the root directory:
```bash
npm run dev:backend   # Starts backend API
npm run dev:frontend  # Starts frontend app
npm run build         # Builds both backend and frontend
```

---

## Core Capabilities Across Modules

1. **Dashboard**: High-level KPI summary, project counts, pending contractor bills, recent milestone progress, and financial charts.
2. **Projects & Sites**: Multi-site management per project with inline site creation and filtering.
3. **Procurement & Deliveries**: Purchase order creation, supplier catalog, site delivery logging, and inline item reception.
4. **Materials & Site Inventory**: Live site stock tracking, item catalog, and material issue logging to active work packages.
5. **Work Packages & Progress**: Field progress milestone recording (0–100%), labour force assignments, and contractor management.
6. **Billing & Payments**: Contractor invoice management with progress checks (>= 10%) and payment authorization with balance tracking.
7. **Reports & Analytics**: Comprehensive analytical views, site inventory health, and financial summaries.
