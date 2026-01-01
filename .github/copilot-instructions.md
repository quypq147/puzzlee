# 🤖 Copilot Instructions for Puzzlee

## Project Overview
- **Puzzlee** is a real-time Q&A platform for classrooms, forums, and live events, supporting interactive questions, voting, and moderation with strict role-based permissions.
- The system is a monorepo with two main apps:
  - **backend/**: Node.js + Express + TypeScript API, PostgreSQL via Prisma ORM, real-time via Socket.io.
  - **frontend/**: Next.js 16 (React 19), TypeScript, Tailwind CSS, Shadcn/UI, real-time via socket.io-client.

## Architecture & Data Flow
- **Backend**
  - `src/controllers/`: Business logic for domains (auth, event, question, etc.)
  - `src/middleware/`: Auth, validation, and request pre-processing
  - `src/routes/`: API endpoints, grouped by resource
  - `prisma/schema.prisma`: DB models (normalized, 3NF)
  - Real-time events (questions, answers, votes) are pushed to clients via Socket.io
- **Frontend**
  - `app/`: Next.js App Router (pages, layouts, (auth), (event), dashboard)
  - `components/`: UI and domain components (e.g., `question-card.tsx`, `event-sidebar.tsx`)
  - `hooks/`: Custom hooks for auth, real-time, etc.
  - `lib/`: API client, socket config, utilities
  - Uses React Context for organization/user state

## Developer Workflows
- **Backend**
  - Install: `cd backend && npm install`
  - Run dev: `npm run dev`
  - DB migration: `npx prisma migrate dev`
  - Env: Copy `.env.example` → `.env` and configure
- **Frontend**
  - Install: `cd frontend && npm install`
  - Run dev: `npm run dev`
  - Env: Copy `.env.example` if present

## Key Conventions & Patterns
- **Role-based access**: Roles (Admin, Owner, Moderator, Member, Participant) enforced in backend and reflected in frontend UI/logic
- **Real-time**: All question/answer/vote updates use Socket.io (see `src/sockets/` and `lib/socket.ts`)
- **Validation**: Zod (frontend) and middleware (backend)
- **API**: RESTful, versionless, endpoints grouped by resource
- **Component structure**: UI split into atomic (ui/), domain (question-card, event-card), and layout components
- **Custom hooks**: For real-time updates, auth, and context
- **Prisma**: All DB access via Prisma Client, schema in `prisma/schema.prisma`

## Integration Points
- **Socket.io**: Real-time bridge between backend and frontend
- **Prisma**: DB migrations and type-safe queries
- **Auth**: JWT-based, with context propagation in frontend

## Examples
- To add a new event type: update `prisma/schema.prisma`, run migration, update relevant controller, and expose via API route
- To add a new UI feature: create a component in `components/`, use hooks/context for state, and connect to backend via `lib/api-client.ts` or sockets

## References
- See `README.md` in root, backend, and frontend for more details
- Key files: `backend/src/controllers/`, `frontend/components/`, `frontend/hooks/`, `backend/prisma/schema.prisma`, `frontend/lib/socket.ts`

---
For any unclear conventions or missing patterns, consult the respective `README.md` or ask for clarification.
