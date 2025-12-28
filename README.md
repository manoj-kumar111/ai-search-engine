# NexusAI — AI-Powered Search

NexusAI is a two-part app:
- Frontend: React + TypeScript + Vite with modern UI (Radix UI, Tailwind)
- Backend: Next.js API using Gemini and Google Custom Search, with optional MongoDB + JWT authentication

## Demo
- Live Demo: [Check out live demo here](https://nexusai-one-ivory.vercel.app/)

## Features
- AI answers with structured HTML (headings, lists, emphasis)
- Source-aware responses and follow-up question suggestions
- Copy-to-clipboard as clean plain text
- Authentication (signup/login) via MongoDB + JWT
- Polished UI components using Radix UI and Tailwind

## Project Structure
- Frontend: `frontend/`
- Backend: `BackEnd/`

## Prerequisites
- Node.js 18+
- A Google Custom Search Engine and API key
- Gemini API key
- Optional: MongoDB connection string

## Environment Variables
Create a `.env.local` file in `BackEnd/` with:
- GOOGLE_API_KEY=
- GOOGLE_CSE_ID=
- GEMINI_API_KEY=
- MONGODB_URI= (or MONGO_URI/DATABASE_URL)
- JWT_SECRET= (or SECRET_KEY)

## Scripts
Frontend (`frontend/`):
- `npm run dev` — start Vite dev server
- `npm run build` — build production bundle
- `npm run preview` — preview build
- `npm run typecheck` — TypeScript check
- `npm run lint` — ESLint

Backend (`BackEnd/`):
- `npm run dev` — start Next.js dev server
- `npm run build` — build
- `npm run start` — run production build
- `npm run lint` — ESLint

## Local Development
1) Backend
- cd BackEnd
- npm install
- set environment variables in `BackEnd/.env.local`
- npm run dev

2) Frontend
- cd frontend
- npm install
- npm run dev
- Frontend proxies API requests to `http://localhost:3000/api`

## Authentication
- Endpoints:
  - `POST /api/auth/signup` — email, password, name
  - `POST /api/auth/login` — email, password
  - `GET /api/auth/me` — Authorization: Bearer <token>
- Frontend stores token in `localStorage` and reads user via `/api/auth/me`

## Deployment Notes
- Keep `.env` files out of version control (already ignored)
- Deploy Backend (e.g., Vercel/Render) and set environment variables
- Point Frontend proxy or environment to deployed Backend API

## License
- For personal or educational use
