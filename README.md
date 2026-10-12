# TripPilot AI — AI-Powered Multimodal Travel Booking Platform

> **Product Status:** Prototype / MVP  
> **Source of Truth:** [`TripPilot_AI_PRD_Antigravity.md`](file:///e:/Vibe_Code_Projects/AI%20Powered%20Travel%20Site/TripPilot_AI_PRD_Antigravity.md)  
> **Master Implementation Plan:** [`docs/IMPLEMENTATION_PLAN.md`](file:///e:/Vibe_Code_Projects/AI%20Powered%20Travel%20Site/docs/IMPLEMENTATION_PLAN.md)  
> **Primary Development Environment:** Google Antigravity  

TripPilot AI is an intelligent, multimodal travel discovery and simulation platform where users can compare, plan, and simulate bookings across **six transportation modes** (Flights, Trains, Metro, Buses, Autos, and Cabs) from a single unified interface powered by conversational AI.

---

## 🌟 Key Features

### 1. Unified Multimodal Search across 6 Modes
- **Flights**: Direct & connecting flights, baggage allowances, cabin class filtering (IndiGo, Air India, Vistara, Akasa, SpiceJet).
- **Trains**: Express, Vande Bharat, Shatabdi, Rajdhani, and Mail services with class quotas (1A, 2A, 3A, SL, CC, EC).
- **Metro Transit**: Namma Metro, Chennai Metro, Delhi Metro lines and interchange transfers.
- **Buses**: Multi-axle AC sleepers and state carriers (KSRTC Airavat, SETC, IntrCity, Zingbus, VRL).
- **Cabs**: Point-to-point on-demand sedans, SUVs, and electric vehicles (EV).
- **Autos**: Quick last-mile 3-wheeler auto rickshaws.

### 2. Signature Multimodal Trip Planner (`/planner`)
- Construct door-to-door multimodal itineraries chaining multiple transportation legs (e.g. *Cab $\rightarrow$ Train $\rightarrow$ Cab*).
- Real-time connection buffer calculation and automated transfer advisories for tight (< 15–30 min) or invalid transfers.
- Cumulative fare, duration, and connection breakdown with instant demo booking.

### 3. State-Synchronized AI Assistant (`Ctrl+K`)
- Natural-language query parsing for origin, destination, arrival deadlines, budgets, and mode preferences.
- Directly manipulates application view state (applies live filters, changes sorting, updates searches) rather than just chatting.
- Grounded in seeded prototype data with zero hallucinations.

### 4. Complete Simulated Booking Lifecycle (`/booking/*` & `/bookings`)
- Demo passenger details with one-click **"Auto-fill Demo Traveller"** shortcut.
- Simulated PNR generation in human-readable `TP-XXXXXX` format.
- Interactive boarding pass / ticket voucher with simulated fare breakdown.
- Persistent booking dashboard with cancellation confirmation modal.

---

## 🛠️ Architecture Stack

```
TripPilot AI
├── Frontend (React 18 + TypeScript + Vite + Tailwind CSS + Zustand + Lucide)
├── Backend (FastAPI + Python 3.12 + Pydantic + Uvicorn)
├── Database (Supabase PostgreSQL Client with Seeded In-Memory Fallback)
└── Testing (Vitest Unit & Integration Suites)
```

- **Frontend:**
  - `src/components/layout/`: Navigation header, demo disclaimer watermark banner, footer.
  - `src/components/search/`: UnifiedSearchWidget, ModeSelector, QuickPromptChips.
  - `src/components/filters/`: FilterSidebar, FilterChipBar with instant removable chips.
  - `src/components/journey-cards/`: JourneyCard, JourneyTimeline, CompareDrawer (3-way comparison).
  - `src/components/trip-planner/`: MultimodalLegList, LegCard, connection buffer warnings.
  - `src/components/ai-assistant/`: AIAssistantDrawer slide-over panel, AIMessageBubble, action cards.
  - `src/store/`: Zustand stores (`useSearchStore`, `useComparisonStore`, `usePlannerStore`, `useBookingStore`, `useAiStore`).
- **Backend:**
  - `app/main.py`: FastAPI entrypoint with CORS and healthcheck.
  - `app/routers/`: Routers for `/api/journeys`, `/api/multimodal`, `/api/bookings`, `/api/ai`, `/api/metadata`.
  - `app/services/`: Journey search/filter engine, multimodal composer, booking lifecycle, and NLP parser.
  - `app/supabase_client.py`: Dual-mode client querying Supabase tables with transparent local prototype fallback.
  - `schema.sql`: Full SQL migration script for Supabase tables (`hubs`, `journeys`, `bookings`, `user_preferences`).

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js `v18+` or `v23+`
- Python `3.10+` or `3.12+`

### 2. Backend Setup (FastAPI)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --port 8001 --reload
```
*Health check available at:* `http://127.0.0.1:8001/api/health`

### 3. Supabase Configuration (Optional)
To connect to your live Supabase project:
1. Open the [Supabase Dashboard](https://app.supabase.com) and create a project.
2. In SQL Editor, run [`backend/schema.sql`](file:///e:/Vibe_Code_Projects/AI%20Powered%20Travel%20Site/backend/schema.sql).
3. Copy your Project URL and Anon/Service Key into [`backend/.env`](file:///e:/Vibe_Code_Projects/AI%20Powered%20Travel%20Site/backend/.env):
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-supabase-key
   ```
*(If left blank, TripPilot automatically runs seamlessly with its rich in-memory seeded dataset).*

### 4. Frontend Setup (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Open **`http://127.0.0.1:5173`** in your browser.

### 5. Running Automated Unit Tests
```bash
cd frontend
npm run test
```

---

## ⚠️ Prototype Disclaimer
TripPilot AI is an interactive prototype. All schedules, flight/train numbers, fares, seat availability, and booking references are simulated. The platform does not issue real airline or railway tickets, dispatch vehicles, or collect payment credentials.
