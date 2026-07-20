# AI Skin Intelligence — Frontend

Next.js (Pages Router) + Tailwind CSS client for the AI Skin Intelligence platform.

## Stack
- **Next.js 14** (Pages Router) — matches the `pages/` structure in the repo brief
- **Tailwind CSS** — themed with the brand tokens below
- **Chart.js** via `react-chartjs-2` — score trends, adherence bars, metric breakdowns
- **Axios** — API client with JWT injection + silent 401 refresh

## Brand system
| Token | Hex | Use |
|---|---|---|
| `ink` | `#2D3250` | Primary text, dark surfaces, headers |
| `slate` | `#7077A1` | Secondary text, mid-tone accents, borders |
| `amber` | `#F6B17A` | Primary CTA/accent, high scores, highlights |

- **Header font:** Plus Jakarta Sans (`font-display`)
- **Body font:** Inter (`font-body`)
- **Signature element:** `ScoreRing` — a circular gauge swept in the exact
  ink → slate → amber gradient, used consistently from the landing hero
  through every dashboard so a "score" always looks and behaves the same way.

## Getting started
```bash
npm install
cp .env.example .env.local   # point NEXT_PUBLIC_API_URL at the backend
npm run dev
```

The app expects a backend exposing `/api/v1/*` (see `next.config.js` rewrites,
which proxy `/api/backend/*` to it). No backend running yet? The assessment
flow and dashboards still render with local placeholder data.

## Structure
```
src/
├── components/
│   ├── auth/        # LoginForm, SignupForm, RBACWrapper
│   ├── dashboards/   # One component per role: user, consultant, dermatologist, admin
│   ├── routine/      # RoutineCard (drag-and-drop planner)
│   └── shared/       # Navbar, Modal, ScoreRing, ProgressBar
├── pages/            # index, login, signup, dashboard, assessment, routine-planner
├── services/         # api_client, assessment, products
├── styles/           # globals.css (Tailwind + design tokens)
└── utils/            # chart_helpers (Chart.js config, brand-colored datasets)
```

## Notes for wiring up the real backend
- `services/api_client.js` reads/writes `asi_access_token` / `asi_refresh_token`
  in `localStorage` and refreshes automatically on a 401.
- `pages/dashboard.js` includes a **demo-only** role switcher so all four
  dashboard variants are reachable without a live session — replace this with
  the role from your auth/session once the backend is connected.
