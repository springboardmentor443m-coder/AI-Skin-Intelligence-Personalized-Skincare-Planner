# AI Skin Intelligence - Frontend

A premium, production-ready AI-powered skincare analysis platform built with Next.js 16, React 19, TypeScript, and Tailwind CSS. Features real-time skin prediction, personalized recommendations, analytics tracking, and an intelligent chatbot assistant.

## Features

### Core Features
- **Authentication System**: Secure login/register with JWT tokens
- **Image Upload & Analysis**: Upload skin photos for real-time AI analysis
- **Skin Type Detection**: Identify skin type and conditions
- **Personalized Recommendations**: Get tailored skincare product suggestions
- **History Tracking**: View and compare past analyses
- **Analytics Dashboard**: Visualize skin health trends with charts
- **AI Assistant**: Chat with an AI for skincare advice
- **User Settings**: Manage profile, security, notifications, and privacy

### Technical Highlights
- **Dark Mode First**: Premium glassmorphism design with smooth animations
- **Real-time Data**: SWR for client-side data fetching and caching
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Type Safe**: Full TypeScript implementation with Zod validation
- **State Management**: Zustand for lightweight global state
- **Animations**: Framer Motion for smooth, polished interactions
- **Data Visualization**: Recharts for analytics and trend charts

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4, glassmorphism components
- **HTTP Client**: Axios with JWT interceptors
- **Data Fetching**: SWR with real backend integration
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **Image Handling**: Next.js Image optimization
- **Validation**: Zod

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm/yarn
- FastAPI backend running at `http://127.0.0.1:8000`

### Installation

1. Clone the repository
2. Install dependencies:
```bash
pnpm install
```

3. Create `.env.local` file:
```bash
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

4. Start the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
app/
├── layout.tsx                 # Root layout with fonts & metadata
├── page.tsx                   # Auth redirect logic
├── login/
│   └── page.tsx              # Login page
├── register/
│   └── page.tsx              # Registration page
├── onboarding/
│   └── page.tsx              # Onboarding flow
├── dashboard/
│   └── page.tsx              # Main dashboard with stats
├── upload/
│   └── page.tsx              # Image upload & prediction
├── history/
│   └── page.tsx              # Past analyses viewer
├── analytics/
│   └── page.tsx              # Trends & insights
├── assistant/
│   └── page.tsx              # AI chat interface
└── settings/
    └── page.tsx              # User settings

components/
├── sidebar.tsx               # Navigation sidebar
├── protected-layout.tsx      # Auth wrapper component

hooks/
└── use-skin-analysis.ts      # Data fetching hooks

lib/
├── api.ts                    # Axios instance with interceptors
├── types.ts                  # TypeScript interfaces
└── auth-store.ts            # Zustand auth state

public/
├── icon.svg                  # App icon
└── apple-icon.png           # Apple touch icon
```

## Key Components

### ProtectedLayout
Wraps authenticated pages, handles redirects for unauthenticated users.

### Sidebar
Navigation component with active route indicators, user info, and logout.

### useAnalysisHistory
SWR hook for fetching paginated skin analysis history with caching.

### uploadImageForAnalysis
Async function that sends image to backend for CNN prediction and Gemini analysis.

## API Integration

All API calls are made through `lib/api.ts` which includes:
- Automatic JWT token injection
- 401 error handling with redirect to login
- Base URL configuration from environment variables
- Axios interceptors for request/response handling

### Expected Backend Endpoints

```
POST   /api/auth/login           # User login
POST   /api/auth/register        # User registration
GET    /api/analyses/latest      # Get latest analysis
GET    /api/analyses/history     # Get analysis history
POST   /api/predict              # Upload image for prediction
POST   /api/chat                 # Send message to AI assistant
```

## Styling System

### Color Palette (Dark Mode)
- **Background**: #0a0a0a (near black)
- **Primary**: #10b981 (emerald green)
- **Accent**: #06b6d4 (cyan)
- **Secondary**: #1f2937 (dark gray)
- **Muted**: #374151 (medium gray)

### Glass Morphism
- `.glass-card`: Semi-transparent cards with backdrop blur
- `.glass-dark`: Enhanced dark glass effect
- Subtle border colors for definition

## Authentication Flow

1. User visits `/` → Redirected to `/login` if not authenticated
2. User registers or logs in → JWT token saved to localStorage
3. Token automatically added to all API requests via interceptors
4. Onboarding flow → Direct to dashboard
5. Dashboard shows analysis history and stats
6. Sidebar available on all protected routes

## Development Notes

### Adding New Pages
1. Create page in `app/[section]/page.tsx`
2. Wrap with `<ProtectedLayout>` for auth requirement
3. Use hooks from `hooks/` for data fetching
4. Follow naming conventions and styling patterns

### Data Fetching
- Use SWR hooks for automatic caching and revalidation
- Leverage `mutate()` to refresh data after mutations
- Backend should return real data, not mocks

### Styling
- Prefer Tailwind classes over custom CSS
- Use design tokens for colors (--primary, --accent, etc.)
- Apply `glass-card` class for card components
- Use `motion` components for animations

## Deployment

### To Vercel (Recommended)
```bash
# Connect GitHub repository and push to main branch
# Vercel will auto-deploy with automatic builds
```

### Environment Variables (Production)
- `NEXT_PUBLIC_API_URL`: Production backend URL
- `GEMINI_API_KEY`: For AI assistant (optional, setup later)

## Future Enhancements

- Gemini API integration for advanced AI responses
- WebSocket support for real-time chat
- Image comparison timeline
- Social sharing of progress
- Mobile app with native camera integration
- Email notifications for analysis reminders

## Contributing

Follow these guidelines:
- Use TypeScript for type safety
- Write components as functional with React hooks
- Keep components small and reusable
- Use SWR for data fetching
- Add animations for enhanced UX
- Test responsive design on mobile

## License

MIT

## Support

For backend setup or integration issues, refer to the FastAPI documentation and ensure the backend is running at the configured API URL.
