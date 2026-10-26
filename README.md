# CareerEvidence 🎯
> **AI-Era Student Employability Intelligence Platform**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0+-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-8.0+-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📌 Overview

**CareerEvidence** is an evidence-first employability intelligence platform built for modern tech students. Unlike generic career portals or self-reported resume builders, CareerEvidence bridges the gap between curriculum and live industry demands through **verifiable proof of competency** and **real-time job market telemetry**.

### Core Philosophy: Tri-Part Competency Model
CareerEvidence fundamentally decouples student readiness into three strict tiers:
1. **Knowledge** — Conceptual understanding and theoretical familiarity.
2. **Ability** — Practical capability to execute and solve engineering tasks.
3. **Evidence** — Verifiable, inspectable proof (GitHub repos, production deploys, concrete features, code artifacts).

A selected skill does *not* imply ability; a link alone does *not* imply verified evidence.

---

## 🚀 Key Features

- **Live Market Telemetry & Anti-Fabrication Pipeline**:
  - Live ingestion and deduplication from verified job providers (Adzuna, Jooble).
  - Deterministic classification into Junior entry-level software roles.
  - No synthetic data, hardcoded percentages, or fabricated demand signals.

- **5 Dedicated Junior Developer Roles**:
  - `JUNIOR_REACT_DEVELOPER`
  - `JUNIOR_FRONTEND_DEVELOPER`
  - `JUNIOR_FULLSTACK_DEVELOPER`
  - `JUNIOR_NODE_DEVELOPER`
  - `JUNIOR_SOFTWARE_DEVELOPER`

- **Evidence-Driven Project Portfolios**:
  - Project registration with feature breakdowns, architecture notes, and skill mappings.
  - Multi-level evidence auditing (`MISSING`, `PARTIAL`, `GOOD`, `STRONG`).

- **Academic Workload & Constraint Management**:
  - Integrated student academic calendar (Exams, Assignments, Deadlines, Project Reviews).
  - Workload pressure mapping (`LOW`, `MEDIUM`, `HIGH`).
  - Dynamic capacity balancing based on single source of truth: `careerHoursPerWeek`.

- **Prescriptive Action Plans & Prioritized Recommendations**:
  - Algorithmic gap analysis comparing student evidence against target role market demand.
  - Prioritized recommendations with estimated hours, actionable roadmaps, and verifiable proof criteria.

- **Admin Job Telemetry & Collector Dashboard**:
  - Manual and scheduled collection triggers.
  - Ingestion run diagnostics, freshness filtering, and raw payload audit trails.

---

## 🏗️ Architecture & Tech Stack

CareerEvidence is engineered as a clean **modular monolith** with strong separation of concerns:

```
careerevidence/
├── backend/
│   ├── prisma/             # Database schema, migrations, and seeds
│   └── src/
│       ├── academic/       # Academic events & workload scheduling
│       ├── alignment/      # Student-to-role gap & alignment engine
│       ├── auth/           # JWT & bcrypt authentication
│       ├── evidence/       # Skill evidence assessment
│       ├── integrations/   # External job API clients (Adzuna, Jooble)
│       ├── modules/        # Background collection jobs & market analytics
│       ├── projects/       # Student project evidence management
│       ├── recommendations/# Algorithmic roadmap & action plan generator
│       ├── roles/          # Supported role schemas & core skill requirements
│       ├── users/          # Profile & weekly hours preferences
│       └── server.ts       # Express server initialization
├── frontend/
│   └── src/
│       ├── api/            # Axios API clients
│       ├── auth/           # Auth provider & route guards
│       ├── components/     # Reusable UI component library
│       ├── pages/          # Application views (Dashboard, Market, Projects, etc.)
│       └── types/          # TypeScript domain interfaces
├── .env.example            # Environment configuration template
└── AGENTS.md               # Architectural principles & development rules
```

### Technology Highlights

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, React Router 7, Tailwind CSS v4, Lucide React |
| **Backend** | Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, Zod validation |
| **Security** | Stateless JWT authentication, bcrypt password hashing, CORS protection |
| **Testing** | Vitest, Supertest |
| **External Providers** | Adzuna API, Jooble API, Google Gemini AI (assistive classification) |

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js** >= 20.x
- **PostgreSQL** >= 15.x
- **npm** or **pnpm** / **yarn**

### 1. Clone the Repository

```bash
git clone https://github.com/gayathirivenkatesh/careerevidence.git
cd careerevidence
```

### 2. Configure Environment Variables

Copy the example environment configuration into both root/backend:

```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials and API tokens:

```env
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/careerevidence?schema=public"
JWT_SECRET="your_secure_random_jwt_secret_min_32_characters"
FRONTEND_URL="http://localhost:5173"

# Job Provider settings
JOB_PROVIDER="adzuna"
JOB_PROVIDER_COUNTRY="india"
JOB_DATA_MODE="test" # Switch to 'live' with API credentials
ADZUNA_APP_ID="your_adzuna_app_id"
ADZUNA_APP_KEY="your_adzuna_app_key"

# AI Provider (Assistive classification)
AI_PROVIDER="gemini"
AI_API_KEY="your_gemini_api_key"
```

### 3. Setup Backend & Database

```bash
cd backend
npm install

# Generate Prisma client and sync database
npx prisma generate
npx prisma db push

# (Optional) Seed roles and default market taxonomy
npm run seed

# Start backend in development mode
npm run dev
```

The backend server will run at `http://localhost:5000`. Health check is available at `http://localhost:5000/health`.

### 4. Setup Frontend

Open a new terminal window:

```bash
cd frontend
npm install

# Start Vite dev server
npm run dev
```

The frontend application will be live at `http://localhost:5173`.

---

## 🧪 Running Tests & Quality Checks

Run test suites and type-checking across services:

```bash
# Backend unit & integration tests
cd backend
npm run test

# TypeScript type checks
npm run build

# Frontend build & lint
cd ../frontend
npm run build
npm run lint
```

---

## 🧭 Core Workflow

```mermaid
flowchart LR
    A[Market Ingestion Engine] -->|Real Job Telemetry| B[(Prisma / Postgres)]
    C[Student Profile & Projects] -->|Verifiable Evidence| B
    D[Academic Calendar] -->|Workload & Available Hours| B
    B --> E[Alignment & Gap Engine]
    E --> F[Personalized Action Plan]
    F --> G[Measurable Employability]
```

1. **Market Signals**: The scheduler pulls live postings from genuine job boards (filtering specifically for junior entry-level roles in India).
2. **Student Profiling**: The student sets target roles, logs weekly career hours, and documents evidence-backed projects.
3. **Academic Load Balancing**: Students track exams and deadlines; the algorithm recalculates remaining hours.
4. **Actionable Roadmap**: The platform recommends prioritized skill sprints matched to real market demand and available weekly capacity.

---

## 🛡️ Principles & Rules

- **Deterministic Rule Priority**: Assistive AI never fabricates jobs, market statistics, or student evidence.
- **Single Source of Truth for Effort**: `careerHoursPerWeek` is the governing metric for all action plans.
- **Strict Geographic MVP**: India tech ecosystem (`JOB_PROVIDER_COUNTRY=india`).
- **Verifiable Proof**: Every skill progression requires linked project evidence and transparent verification status.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
