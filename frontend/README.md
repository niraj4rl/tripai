# Tripperz Frontend

Mobile-first travel Progressive Web App built with React, Vite, TypeScript, Tailwind CSS, React Router, TanStack Query, Framer Motion, and Zustand.

## Features

- Onboarding landing screen
- Home dashboard with search, AI planner card, chips, and travel rails
- AI planner with form, chat-style UI, itinerary preview, and warnings
- Hotels list + hotel detail
- Places list with map/list toggle
- Flights search with external booking links
- Saved screen sections
- Profile with preferences and logout
- Trip detail with budget and day-wise summary
- PWA manifest and service worker registration
- Install prompt support and offline fallback shell

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- React Router
- TanStack Query
- Framer Motion
- Lucide React
- Zustand

## Environment

Create `.env` in project root:

```bash
VITE_API_BASE_URL=http://localhost:8000/api
```

## Run

```bash
npm install
npm run dev
```

Open http://127.0.0.1:5173

## Build

```bash
npm run build
npm run preview
```

## Preview Data

`src/data/demoPreviewData.ts` is temporary visual preview data only.

Temporary UI preview data. Replace with API data before production.
