# PRD: TripPilot AI — AI-Powered Multimodal Travel Booking Platform

**Document type:** Product Requirements Document (PRD)  
**Product status:** Prototype / MVP  
**Working name:** TripPilot AI  
**Primary development environment:** Google Antigravity  
**Date:** October 2026

---

## 1. Product Overview

### Product vision

Build a modern, intelligent, multimodal travel platform where users can discover, compare, plan, and simulate bookings across multiple transportation options from one unified interface.

The platform combines a conventional travel-search experience with a conversational AI assistant. Users can operate either interface independently or combine them seamlessly.

**Core differentiator:** This is not just a travel booking website with a chatbot attached. The AI should act as a travel companion that understands natural-language requests, compares transportation modes, applies filters, recommends journeys, and helps users manage demo bookings.

### Supported transportation modes

1. **Flights** — domestic and international journeys.
2. **Trains** — routes, schedules, classes, and fares.
3. **Metro** — stations, lines, interchanges, and fares.
4. **Buses** — city and intercity services.
5. **Autos** — short-distance connections.
6. **Cabs** — point-to-point rides.

The product should support:

- **Single-mode journeys:** For example, a direct flight from Chennai to Delhi.
- **Multimodal journeys:** For example, a cab to a railway station, a train to another city, and a final cab to the destination.

All schedules, fares, availability, and booking confirmations are simulated prototype data.

## 2. Objectives and Scope

### Primary objectives

- Search all six transportation modes from one platform.
- Provide rich filters and side-by-side journey comparisons.
- Let users search and plan trips using natural language.
- Enable AI to operate the interface by applying filters, selecting routes, changing preferences, and guiding demo bookings.
- Support a complete simulated booking lifecycle.
- Create a visually distinctive, responsive interface with smooth transitions and polished interactions.

### Out of scope

- Real ticket purchases, payments, refunds, or operator cancellations.
- Live flight, train, bus, metro, cab, or auto APIs.
- Real seat reservations or vehicle dispatch.
- Production-grade identity verification.
- Guaranteed real-world schedules, prices, or availability.
- Enterprise-scale infrastructure or production operations.

**Important:** Every screen should behave convincingly, but the application must never imply that a real ticket or ride has been booked.

## 3. Target Users and Use Cases

| User type | Goal |
|---|---|
| Budget traveller | Find the cheapest suitable journey |
| Time-sensitive traveller | Find the fastest route |
| Comfort-focused traveller | Prioritize fewer transfers and better comfort |
| Daily commuter | Compare metro, bus, auto, and cab options |
| Multi-city traveller | Combine transportation modes into one itinerary |
| AI-first user | Explain requirements conversationally instead of filling forms |
| Booking-management user | Review, modify, or cancel simulated bookings |

### Example user requests

- “Find the cheapest way to travel from Bengaluru to Chennai tomorrow.”
- “Show flights under ₹6,000, with no more than one stop.”
- “I need to reach my office by 9 AM. Compare metro, bus, and cab.”
- “Plan a journey with a train for the long distance and a cab for the last mile.”
- “I prefer fewer transfers even if the trip costs ₹200 more.”
- “Apply a maximum budget of ₹1,500 to my current search.”
- “Book the second option for two adults.”
- “Show my upcoming bookings and cancel the demo booking I created yesterday.”
- “Why are you recommending this route instead of the cheapest one?”

The AI must understand follow-up requests without requiring users to repeat all their details.

## 4. Information Architecture

### Main navigation

- **Home:** Search, suggestions, and recent trips.
- **Explore:** Search results, filters, and comparisons.
- **Trip Planner:** Multimodal itineraries and journey legs.
- **My Bookings:** Upcoming, completed, and cancelled demo bookings.
- **AI Travel Assistant:** Conversational planning and actions.
- **Profile and Preferences:** Demo traveller details and preferences.

### Required screens

1. Landing page and search dashboard.
2. Unified search results.
3. Transportation-specific results and filters.
4. Journey details and route comparison.
5. Multimodal trip planner.
6. Demo passenger details.
7. Booking review and confirmation.
8. My Bookings and booking details.
9. AI assistant panel or full conversational workspace.
10. Profile and preferences.
11. Empty states, loading states, errors, and no-results screens.

## 5. Functional Requirements

### 5.1 Home and Unified Search

The home screen must include:

- Origin and destination inputs.
- Swap-origin-and-destination control.
- Outbound date and optional return date.
- Passenger count.
- Transportation mode selection with all six options.
- A primary **Find Journeys** action.
- Suggested destinations, popular routes, and recent searches using mock data.
- Quick prompts for the AI assistant.
- An option to ask AI to plan the complete journey.

Users can search in two ways:

**Form-based search:** Select locations, dates, passengers, and transportation modes.

**Natural-language search:** For example, “Get me to Chennai from Bengaluru tomorrow morning under ₹1,000.”

Both methods must update the same shared search state.

### 5.2 Transportation-Specific Filters

Filters must change based on the selected mode. Users must be able to combine multiple filters simultaneously.

#### Flights

- Minimum and maximum price.
- Departure and arrival time windows.
- Airline.
- Direct or connecting flights.
- Number of stops.
- Total duration.
- Baggage allowance.
- Cabin class.
- Refundable or non-refundable fare.

#### Trains

- Departure and arrival time windows.
- Train type.
- Travel class.
- Fare.
- Duration.
- Number of transfers.
- Amenities.
- Simulated seat availability.

#### Metro

- Route line.
- Stations.
- Interchange count.
- Travel time.
- Fare.
- Walking distance.
- Accessibility.
- Departure frequency where sample data supports it.

#### Buses

- Operator.
- AC or non-AC.
- Sleeper or seater.
- Departure time.
- Boarding and drop-off points.
- Price and duration.
- Amenities.
- Simulated seat availability.

#### Autos

- Estimated fare.
- Pickup and drop-off distance.
- Travel duration.
- Passenger capacity.
- Simulated availability.

#### Cabs

- Cab category.
- Fare.
- Estimated pickup time.
- Trip duration.
- Luggage and passenger capacity.
- Pickup distance.
- Simulated availability.

#### Shared filters

- Minimum and maximum budget.
- Earliest departure and latest arrival.
- Maximum journey duration.
- Preferred departure time: early morning, morning, afternoon, evening, or night.
- Maximum number of transfers.
- Comfort preference.
- Accessibility requirements where mock data supports them.
- Sort by cheapest, fastest, earliest arrival, and recommended.
- Reset all filters.
- Clear individual filters.
- Display active filters as removable chips.
- Update result count when filters change.

Do not show filters that are irrelevant to a transportation mode.

### 5.3 Unified Results and Comparison

Every journey card should display relevant information from this list:

- Provider or operator.
- Transportation mode and icon.
- Departure and arrival locations.
- Departure and arrival times.
- Total journey duration.
- Stops or transfers.
- Total simulated price.
- Simulated availability status.
- Comfort or class information.
- Key amenities.
- **View Details**, **Compare**, and **Continue / Book Demo** actions.

Support these views:

- **Recommended:** Ranked using user preferences.
- **Cheapest:** Lowest total price.
- **Fastest:** Shortest total duration.
- **Earliest Arrival:** Earliest arrival time.
- **Multimodal:** Combinations of transport modes.

Allow users to select up to three itineraries and compare cost, duration, transfers, comfort, and other relevant attributes.

### 5.4 Multimodal Trip Planner

The planner is a signature feature. It must let users construct and compare journeys containing multiple transportation legs.

Illustrative example:

| Leg | Journey | Duration | Mock fare |
|---|---|---:|---:|
| 1 — Cab | Home → Bengaluru railway station | 25 min | ₹250 |
| 2 — Train | Bengaluru → Chennai | 5 hr 30 min | ₹650 |
| 3 — Cab | Chennai railway station → destination | 20 min | ₹180 |
| **Total** | Excludes transfer buffers | **6 hr 15 min** | **₹1,080** |

These values are illustrative mock data, not live quotes or confirmed schedules.

Required capabilities:

- Add or remove journey legs.
- Change the transportation mode for a leg.
- Select an alternative connection.
- Display transfer locations and estimated connection times.
- Show total cost and total duration.
- Flag impossible or insufficient transfer intervals where sample data supports validation.
- Save a proposed itinerary.
- Send the complete itinerary to AI for refinement.

Do not require sophisticated geospatial route optimization. Use predefined mock connections and deterministic compatibility rules.

## 6. AI Travel Assistant — Core Differentiator

The AI must be an active part of the application, not a standalone chatbot that only answers general questions.

### 6.1 AI capabilities

1. **Natural-language travel search:** Understand origin, destination, dates, budget, passenger count, transport preferences, and arrival deadlines.
2. **Conversational filtering:** Interpret requests such as “Exclude overnight buses,” “Only direct flights,” and “Keep the price below ₹2,000,” then update actual search results and filter controls.
3. **Intelligent comparisons:** Explain trade-offs among price, duration, transfers, convenience, and preferences, grounded in journey data.
4. **Journey planning:** Suggest multimodal combinations and help optimize for cost, speed, comfort, or fewer transfers.
5. **Booking copilot:** Help users select a journey, review passenger details, validate input, and proceed through demo confirmation.
6. **Booking management:** Retrieve demo bookings, summarize upcoming trips, show status, guide supported modifications, and cancel simulated bookings after confirmation.
7. **Context and memory:** Retain conversation context, current search criteria, selected itinerary, applied filters, and relevant booking information during the session.

### 6.2 Desired AI interaction

**User:** “Find the cheapest way to get from Bengaluru to Chennai tomorrow. I need to arrive before 10 AM.”

**Assistant:** “I’ll compare eligible flights, trains, buses, and suitable multimodal connections. I’ll prioritize journeys arriving before 10 AM, then rank them by total price.”

The assistant should display the extracted criteria and an **Apply Criteria** action where appropriate. In the actual implementation, the assistant must update shared application state and render real mock search results rather than merely explain what it would do.

### 6.3 AI architecture requirements

Use a provider-independent interface so the language model can be changed without redesigning the application.

AI workflow:

1. Receive a natural-language request.
2. Extract intent and context.
3. Produce a structured action proposal.
4. Validate the proposal against the current application state and allowed parameters.
5. Execute the permitted application action.
6. Show updated UI state and explain the result.

Suggested permitted tools/actions:

- `search_journeys`
- `apply_filters`
- `sort_results`
- `compare_journeys`
- `plan_multimodal_trip`
- `get_bookings`
- `get_booking_details`
- `update_demo_booking`
- `cancel_demo_booking`

#### AI implementation rules

- Use structured outputs or tool calling for application actions.
- Validate all proposed actions against allowed parameters and current application state.
- Never execute model-generated code inside the application.
- Do not invent routes, prices, schedules, or booking statuses. Ground journey responses in the mock dataset.
- Ask a clarifying question when essential information is missing or ambiguous.
- Require explicit confirmation before committing a demo booking or cancellation.
- Explain when filters return no results.
- Handle API errors, timeouts, and malformed model responses gracefully.
- Include deterministic demo responses if the AI API is not configured.
- Distinguish between proposing an action and successfully executing it. Claim success only after the application confirms the state update.

## 7. Demo Booking Lifecycle

Implement a complete simulated booking flow for all supported modes.

1. **Search:** User enters journey details or asks AI to find options.
2. **Select Journey:** User views details, compares options, and selects an itinerary.
3. **Passenger and Trip Details:** Collect only the information needed for the prototype, such as passenger name and contact details. Use sample data where possible.
4. **Review:** Show selected legs, passenger count, fare breakdown, travel dates, and a mock-data disclaimer.
5. **Confirm Demo Booking:** Ask for confirmation and generate a unique simulated booking reference.
6. **Confirmation Page:** Show itinerary, simulated status, reference, total fare, and optionally a printable or downloadable demo itinerary.
7. **Manage Booking:** View, edit supported demo details, or cancel a booking with explicit confirmation.

### Booking data model

Every demo booking should include:

- Unique booking ID and human-readable reference.
- Creation timestamp.
- Journey origin and destination.
- Travel date and selected itinerary.
- Transportation legs and operators.
- Passenger count and required demo details.
- Fare breakdown and total price.
- Booking status: `CONFIRMED`, `CANCELLED`, or `COMPLETED`.
- Mock booking metadata and a clear demo indicator.

Modifications and cancellations must update persisted demo state. The AI must retrieve the updated status on subsequent queries.

Do not simulate real payment processing. A clearly labelled **Complete Demo Booking** action is sufficient.

## 8. Prototype Data and Search Logic

Create a coherent, seeded dataset with enough variation to demonstrate filtering and comparison.

| Dataset | Suggested starting volume |
|---|---:|
| Cities and locations | 15–25 |
| Flights | 40–60 |
| Train services | 40–60 |
| Bus services | 40–60 |
| Metro routes and connections | 20–30 |
| Cab options | 20–30 |
| Auto options | 20–30 |
| Sample demo bookings | 5–10 |

These are development targets, not real-world inventory counts.

Mock data should include:

- Both eligible and ineligible options for common filters.
- Varied price points and journey durations.
- Multiple departure windows.
- Different transfer counts and operators.
- Availability states.
- Sufficient connections to demonstrate multimodal planning.

### Search engine behaviour

1. Normalize city names, dates, prices, and transportation modes.
2. Retrieve candidate journeys from the seeded dataset.
3. Apply hard constraints such as date, budget, and arrival deadline.
4. Apply transportation-specific filters.
5. Calculate journey-level cost and duration.
6. Rank remaining options using the selected sorting strategy.
7. Return consistent result objects to the UI and AI assistant.

Multimodal combinations must use connections present in the dataset and obey basic time and location compatibility rules. Deterministic ranking is preferred over elaborate AI-generated calculations.

## 9. Recommended Technical Stack

| Layer | Recommendation |
|---|---|
| Development agent | Google Antigravity |
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Animation | Framer Motion |
| Icons | Lucide |
| Application state | Zustand or React Context |
| Mock data | Seeded JSON/TypeScript fixtures |
| Persistence | LocalStorage for the first prototype |
| AI integration | OpenAI API through a secure server-side adapter |
| Optional backend | FastAPI |
| Optional database | Supabase PostgreSQL |

**Recommended starting point:** React, TypeScript, mock data, LocalStorage, and a provider-independent AI adapter.

Do not introduce FastAPI, Supabase, or a full database unless the prototype needs them. Define service interfaces early so mock services can later be replaced by a backend without rewriting the UI.

### Suggested project structure

```text
src/
├── app/
│   ├── router.tsx
│   └── providers.tsx
├── components/
│   ├── layout/
│   ├── search/
│   ├── filters/
│   ├── journey-cards/
│   ├── trip-planner/
│   ├── bookings/
│   └── ai-assistant/
├── pages/
│   ├── HomePage.tsx
│   ├── SearchResultsPage.tsx
│   ├── JourneyDetailsPage.tsx
│   ├── TripPlannerPage.tsx
│   ├── BookingReviewPage.tsx
│   ├── BookingConfirmationPage.tsx
│   ├── MyBookingsPage.tsx
│   └── ProfilePage.tsx
├── features/
│   ├── search/
│   ├── ai/
│   ├── trip-planning/
│   └── booking/
├── services/
│   ├── journeyService.ts
│   ├── bookingService.ts
│   ├── aiService.ts
│   └── storageService.ts
├── data/
│   ├── cities.ts
│   ├── flights.ts
│   ├── trains.ts
│   ├── buses.ts
│   ├── metro.ts
│   ├── cabs.ts
│   └── autos.ts
├── store/
├── types/
└── utils/
```

Keep transportation-specific rules in reusable services rather than duplicating search logic in page components.

## 10. UI/UX and Visual Design Direction

The visual experience should feel premium, distinctive, and approachable, with subtle depth and polished motion rather than looking like a generic travel template.

### Design principles

- Elegant light theme with an ivory or near-white background.
- Deep indigo and cobalt blue as primary accents.
- Selective violet gradients for AI-related features.
- Premium typography with clear hierarchy.
- Rounded cards, soft shadows, and restrained glassmorphism.
- Subtle 3D travel illustrations or floating transportation icons.
- Smooth page transitions and interactive hover states.
- Animated search progress and skeleton loading.
- Clear distinction between AI assistant and standard search controls.
- Responsive layouts for desktop, tablet, and mobile.
- Accessible contrast, keyboard navigation, and reduced-motion support.

### Signature UI features

1. **AI Travel Command Bar:** A prominent conversational input embedded in the homepage.
2. **Transport Mode Switcher:** Distinct controls for all six modes.
3. **Journey Timeline:** Visual sequence of legs, stops, transfer buffers, and costs.
4. **AI Recommendation Cards:** Explain why a journey matches user constraints.
5. **Interactive Filter Chips:** Update results immediately when added or removed.
6. **Compare Drawer:** Compare selected journeys without losing the current search.
7. **Persistent AI Assistant:** Available across search, planning, and booking management.
8. **Demo Booking Status Indicator:** Visible throughout the booking flow.

Avoid excessive animation, distracting 3D scenes, or effects that interfere with filtering and booking.

## 11. Non-Functional Requirements

- Use TypeScript types for all major domain objects.
- Keep search and booking state consistent across pages.
- Use reusable components and a centralized design system.
- Validate all user inputs.
- Handle empty states, invalid dates, no results, and failed AI requests.
- Persist demo bookings across page refreshes.
- Keep the layout responsive and accessible.
- Never store API keys in frontend source code or browser storage.
- Use server-side AI requests when a real API key is configured.
- Avoid real personal data in fixtures.
- Add basic unit tests for filtering, sorting, booking state changes, and AI action validation.
- Ensure the app starts with seeded data and works without external travel APIs.
- Clearly label schedules, fares, availability, and bookings as simulated.

## 12. Acceptance Criteria

### Search and discovery

- Search by origin, destination, and date.
- Search across all six transportation modes.
- Apply multiple filters together and clear them.
- Sort results and compare up to three journeys.

### AI capabilities

- Understand natural-language journey requests.
- Apply AI-requested filters to visible results.
- Explain recommendations using actual mock data.
- Retain context across follow-up questions.
- Handle ambiguous requests and AI errors gracefully.

### Trip planning

- Create an itinerary with multiple transportation legs.
- Add, remove, and replace journey legs.
- Calculate total mock fare and duration.
- Validate connection times using available data.

### Demo booking

- Complete a simulated booking from search to confirmation.
- Generate and persist a unique booking reference.
- View, update supported details, and cancel demo bookings.
- Reflect booking changes in the AI assistant.

### Quality

- Work on desktop and mobile layouts.
- Persist data across refreshes.
- Display demo-data disclaimers consistently.
- Pass core unit tests and have no critical console errors.

## 13. Implementation Roadmap for Antigravity

Do not ask Antigravity to implement every feature in one pass. Use this PRD as the source of truth and implement one phase at a time.

### Phase 1 — Planning and Repository Setup

- Inspect the environment and existing code.
- Establish architecture, routes, data models, component boundaries, milestones, and test strategy.
- Produce an implementation plan.
- Do not implement product features yet.

### Phase 2 — Design System and Frontend

- Implement the responsive homepage and navigation.
- Build the design system, search interface, reusable components, and signature animations.

### Phase 3 — Mock Travel Data and Search Engine

- Implement all six transportation modes.
- Create seeded fixtures.
- Build multi-filter search, sorting, comparisons, and journey details.

### Phase 4 — Multimodal Planner

- Implement editable itineraries and connection validation.
- Calculate journey totals and support alternative route selection.

### Phase 5 — AI Assistant

- Implement natural-language parsing, structured actions, shared-state updates, conversational context, and grounded recommendations.

### Phase 6 — Booking and Management

- Implement demo confirmation, reference generation, persistence, booking details, supported modifications, and cancellations.

### Phase 7 — Testing and Polish

- Verify end-to-end user journeys, AI actions, responsive layouts, accessibility, and error handling.
- Refine visual quality without adding unnecessary production infrastructure.

For each phase, define the objective, expected files or modules, prerequisites, tasks, tests, acceptance criteria, and rollback considerations.

## 14. First Prompt to Give Antigravity

Use the following prompt to plan the project before implementation.

---

### TripPilot AI — Master Planning Prompt

You are a senior product architect, UI/UX engineer, frontend architect, AI application engineer, and test automation engineer.

I want to build **TripPilot AI**, an AI-powered multimodal travel booking website prototype. This PRD is the source of truth.

#### Your current task

**Planning only. Do not start implementing the application yet.**

First, inspect the existing workspace, repository, installed dependencies, project configuration, and existing UI. If the workspace is empty, plan the project from scratch. If a project already exists, preserve useful working code and existing design decisions unless they conflict with this PRD.

#### Product scope

The prototype must support:

- Flights, trains, metro, buses, autos, and cabs.
- Unified search, mode-specific filters, sorting, and journey comparisons.
- Multimodal trip planning.
- An AI assistant that can search, filter, compare, recommend, and manage demo bookings.
- A complete simulated booking lifecycle.
- Booking persistence across page refreshes.
- Responsive desktop and mobile experiences.

There must be no real transport integrations, payment processing, or live booking functionality.

#### Technical direction

Prefer React, TypeScript, Vite, Tailwind CSS, reusable UI components, Framer Motion, and Lucide icons. Use seeded mock data and LocalStorage for the prototype. Keep the AI provider behind a clean service interface, and never expose API keys in client-side code.

Avoid unnecessary dependencies, premature backend infrastructure, duplicated business logic, and overengineering.

#### Visual direction

Create a premium, futuristic but approachable light-theme travel experience. Use elegant typography, deep indigo and cobalt accents, subtle 3D visuals, selective glassmorphism, smooth transitions, responsive layouts, and carefully designed interaction states.

The application must be visually distinctive, not a generic template. Prioritize usability and clarity over decorative effects.

#### Planning deliverables

Produce a detailed implementation plan covering:

1. Repository and environment assessment.
2. Architecture and technology decisions.
3. Page and navigation map.
4. Component hierarchy and design system.
5. Domain models and TypeScript interfaces.
6. Mock data schemas and dataset generation strategy.
7. Search, filtering, sorting, and multimodal compatibility algorithms.
8. Global state management and persistence.
9. AI orchestration, structured actions, context handling, and validation.
10. Demo booking state machine and confirmation flow.
11. Error handling, accessibility, and security boundaries.
12. Testing strategy and acceptance criteria.
13. Phased implementation plan with dependencies and explicit completion gates.
14. Performance and maintainability considerations.
15. Risks, assumptions, and unresolved product questions.

For every implementation phase, specify its objective, files or modules expected to change, prerequisites, tasks, tests, acceptance criteria, and rollback considerations.

Define clear interfaces between the UI, mock travel services, booking service, and AI service so each can be developed and tested independently.

#### Mandatory constraints

- Do not implement features during this planning stage.
- Do not overwrite or delete existing working code.
- Do not introduce real travel APIs or real payment systems.
- Do not invent live schedules, prices, or availability.
- Do not let AI responses bypass application validation.
- Require confirmation for consequential demo booking actions.
- Keep the project simple enough to complete as a functional prototype.
- Identify ambiguities explicitly instead of silently expanding the scope.

#### Final output

Create a detailed implementation plan in the repository, preferably as `docs/IMPLEMENTATION_PLAN.md`, if doing so does not overwrite an existing file.

Also provide a concise summary of the architecture, proposed folder structure, phase dependencies, major risks, and the first implementation milestone.

Stop after planning. Wait for my approval before making implementation changes.

---

## 15. Final Product Recommendation

The most important architectural decision is to make the AI and conventional UI operate on the **same application state and the same travel services**. This allows a user to say “show me cheaper trains” and immediately see updated results rather than receiving a chatbot answer that has no effect on the website.

After Antigravity produces the plan, review it before implementation. Start with the design system and core search experience, then implement reliable mock search and booking operations, and integrate the AI after those underlying operations work consistently.

**Definition of success:** A user can describe a trip in natural language, discover and compare options across six transport modes, build a multimodal itinerary, complete a simulated booking, and manage that booking through either the conventional interface or the AI assistant.
