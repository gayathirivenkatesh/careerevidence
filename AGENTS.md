# CAREEREVIDENCE DEVELOPMENT RULES

## Project

CAREEREVIDENCE — AI-Era Student Employability Intelligence Platform

## Stack

Frontend:
- React
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Lucide React

Backend:
- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- JWT
- bcrypt
- Zod

Testing:
- Vitest
- Supertest

## Architecture

Use a modular monolith.

Do not introduce:
- microservices
- GraphQL
- Angular
- unnecessary AI
- unrelated frameworks
- fake job data
- fake market statistics

## Five Supported Roles

JUNIOR_REACT_DEVELOPER
JUNIOR_FRONTEND_DEVELOPER
JUNIOR_FULLSTACK_DEVELOPER
JUNIOR_NODE_DEVELOPER
JUNIOR_SOFTWARE_DEVELOPER

Every accepted job has exactly ONE primary role.

## Market Data

Production market data must come from legitimate external job providers.

Never:
- fabricate jobs
- fabricate statistics
- hardcode demand percentages
- present test fixtures as live data

## AI

AI is assistive only.

Deterministic rules have priority.

AI must not invent:
- jobs
- market statistics
- student evidence
- verification

## Student Competency

Keep separate:

Knowledge
Ability
Evidence

A selected skill does not automatically mean ability.

A GitHub URL does not automatically mean verified evidence.

## Geography

MVP geography is India only.

## Career Hours

careerHoursPerWeek is the single source of truth.

Do not create careerHoursPerDay.

## TypeScript

Avoid any.

Use unknown when external data cannot be safely typed.

## Verification

After every implementation phase:

1. Run tests.
2. Run TypeScript/build checks.
3. Fix introduced errors.
4. Do not proceed to the next phase until the current phase is stable.

## Phase Discipline

Only implement the requested phase.

Do not silently implement future phases.