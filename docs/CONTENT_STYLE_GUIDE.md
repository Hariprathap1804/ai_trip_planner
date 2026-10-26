# TripPilot AI — Content Style Guide

> **Document Type:** Product Content Style Guide & Writing Standards  
> **Target File:** `docs/CONTENT_STYLE_GUIDE.md`  
> **Source Reference:** [`docs/CONTENT_AUDIT.md`](file:///e:/Vibe_Code_Projects/AI%20Powered%20Travel%20Site/docs/CONTENT_AUDIT.md)  
> **Audience:** UX Writers, Product Designers, Product Managers, Frontend Engineers  
> **Status:** Active Standard (No application code modified during documentation phase)  

---

## 1. Executive Summary & Purpose

TripPilot AI is an intelligent multimodal travel platform built to connect India's fragmented travel networks—integrating commercial airlines, Indian Railways trains, intercity buses, city metro lines, cabs, and auto-rickshaws into coordinated, door-to-door itineraries.

The purpose of this Style Guide is to transition TripPilot AI from an internal technical prototype into a polished, professional, friendly, and trustworthy consumer travel experience. This guide establishes the definitive standards for voice, tone, terminology, headline conventions, button copy, form guidance, error messages, and simulation transparency.

All writers, designers, and developers working on TripPilot AI must follow these standards.

---

## 2. Brand Voice & Personality

Our brand voice represents an experienced, thoughtful, and modern travel concierge. It reflects how TripPilot AI speaks across every heading, button, tooltip, notification, and assistant response.

```
       [ Friendly & Approachable ]           [ Calm & Reassuring ]
                    ▲                                  ▲
                    │                                  │
    ────────────────┼──────────────────────────────────┼────────────────
                    │                                  │
                    ▼                                  ▼
         [ Clear & Conversational ]         [ Concise & Scannable ]
```

### Core Voice Pillars

| Voice Pillar | What It Means in Practice | What We Sound Like ✅ | What We Avoid ❌ |
| :--- | :--- | :--- | :--- |
| **Professional but Friendly** | Warm, respectful, and polished without being stiff, corporate, or overly casual. | *"Your boarding pass has been issued and saved to your account."* | *"Congrats bro, your ticket is locked in!"* or *"Transaction status: 200 OK."* |
| **Clear & Conversational** | Written in plain, everyday English. Short sentences, active verbs, and natural syntax. | *"Compare travel options side-by-side to find the right balance of time and cost."* | *"Leverage multimodal transit synergies for optimized egress velocity."* |
| **Helpful without Being Robotic or Promotional** | Informative, objective, and solution-focused. We guide travelers without sounding like an aggressive ad or a sterile command prompt. | *"We found 3 multimodal routes connecting Bengaluru to Ooty via train and cab."* | *"UNBELIEVABLE DEALS! Book now for the best trip of your life!"* or *"Query executed in 14ms."* |
| **Concise & Scannable** | Short paragraphs (1–3 sentences max), descriptive headings, and bulleted takeaways. Respect the traveler's time. | Key metrics highlighted: `Duration: 4h 20m • Fare: ₹1,850 • Transfers: 1`. | Unbroken walls of text or dense paragraphs describing route details. |
| **Reassuring & Transparent** | Calm, clear guidance when explaining multi-leg connections, booking steps, errors, and test simulations. | *"Transfer buffer is 15 minutes. We recommend at least 30 minutes to change platforms comfortably."* | *"Impossible Connection: Departure occurs before previous arrival!"* |
| **Consistent Across All Touchpoints** | Uniform terms for travelers, journeys, fares, and modes across every route, modal, and drawer. | Consistently using *"Travelers"*, *"Select Journey"*, and *"Transfer Buffer"*. | Mixing *"Pax"*, *"Users"*, *"Book Demo"*, and *"Slack Time"* across different screens. |

---

## 3. Ten Foundational Writing Rules

Every piece of copy across TripPilot AI must comply with these ten non-negotiable rules:

### Rule 1: Use natural, everyday English
Write as a knowledgeable travel specialist speaking directly to a traveler. Use contractions naturally (*we'll*, *you'll*, *it's*) to maintain warmth, but avoid slang, internet abbreviations, or archaic phrasing.
- **Do:** *"Let's plan your door-to-door trip across flights, trains, and cabs."*
- **Don't:** *"Initialize journey sequence parameter inputs."*

### Rule 2: Prefer descriptive headings over generic headings
Headlines must inform travelers where they are and what they can achieve on that screen. Never use generic, uninformative placeholders such as *"Welcome"* or *"Explore More"*.
- **Do:** *"Search & Compare Door-to-Door Journeys"* or *"Popular Multimodal Routes Across India"*
- **Don't:** *"Welcome to TripPilot"* or *"Explore More"* or *"Things to See"*

### Rule 3: Write button labels that clearly describe the action
Every button label must follow the formula: `[Verb] + [Specific Noun or Outcome]`. The user should know exactly what will happen before they click.
- **Do:** `Search Journeys`, `Select Journey`, `Review & Book Itinerary →`, `Cancel Booking`
- **Don't:** `Submit`, `Go`, `Book Demo`, `Cancel Demo`, `Click Here`, `Execute`

### Rule 4: Explain unfamiliar travel or technical terms in plain language
Explain acronyms and transit terminology in simple, everyday language upon first appearance.
- **PNR:** Explain as *"Booking Reference (PNR)"*.
- **Transfer Buffer:** Explain as *"Connection Window (time between legs)"*.
- **Multimodal:** Explain as *"Connected journeys across flight, train, bus, and cab"*.
- **Never display code errors:** Do not expose `422 Unprocessable Entity`, `PGRST205`, `Supabase schema`, or `HMAC-SHA256` in UI copy.

### Rule 5: Avoid lorem ipsum, placeholder text, repeated marketing slogans, and excessive exclamation marks
All placeholder text must be realistic sample data. Never repeat slogans or use more than one exclamation mark per view (reserved exclusively for genuine milestones such as a completed booking).
- **Do:** Placeholders like `e.g. Rahul Nair`, `e.g. rahul@example.com`, `e.g. Bengaluru (BLR)`
- **Don't:** `Lorem ipsum`, `test test`, `Book Now!!! Best Prices Guaranteed!!!`

### Rule 6: Avoid unnecessary jargon, exaggerated claims, and long paragraphs
Keep explanations tight and honest. Break up text into short paragraphs (under 50 words) with clear labels. Never make ungrounded marketing claims.
- **Do:** *"Compare travel durations and estimated fares across 3 multimodal routes."*
- **Don't:** *"The world's most revolutionary patented AI algorithms that effortlessly guarantee the cheapest transit on earth."*

### Rule 7: Use consistent terms for journeys, transport modes, demo bookings, passengers, fares, and the AI assistant
Refer to the standardized product lexicon in [Section 5](#5-standardized-product-terminology--lexicon). Never mix interchangeable slang for the same product entity.

### Rule 8: Clearly distinguish simulated schedules, prices, availability, and bookings from real travel information
TripPilot AI is an interactive demonstration platform. Clearly state that schedules, fares, and reservations are simulated for demonstration purposes, while maintaining a realistic, production-quality user experience.
- **Do:** *"Interactive Demonstration — Fares and tickets are simulated for evaluation."*
- **Don't:** Claiming real IRCTC seat confirmations, or displaying harsh developer warnings like *"⚠️ FAKE DATA DO NOT USE"*.

### Rule 9: Do not invent features, integrations, customer testimonials, statistics, or business claims
Do not add claims for features not implemented in the application (e.g. live GPS tracking of intercity buses, airline baggage check-in, real hotel bookings, or fake testimonials from *"Satisfied Customer Priya from Mumbai"*). Only describe implemented features.

### Rule 10: Keep existing functionality and page layouts unchanged
Content updates must fit into existing UI containers, grids, button sizes, modals, and route flows without altering layouts, breaking CSS responsive breakpoints, or changing component logic.

---

## 4. Situational Tone Matrix

Our voice remains constant, but our tone adjusts depending on the traveler's context:

```
┌─────────────────────────┬──────────────────────────┬─────────────────────────┬─────────────────────────┐
│ Discovery & Search      │ Route Customization      │ Review & Test Checkout  │ Errors & System States  │
├─────────────────────────┼──────────────────────────┼─────────────────────────┼─────────────────────────┤
│ • Inspiring & direct    │ • Methodical & helpful   │ • Reassuring & explicit │ • Calm & solution-led   │
│ • Focus on time & fare  │ • Safety buffer advisory │ • 100% transparent on   │ • Clear explanation     │
│ • Clear journey options │ • Clear leg editing      │   simulated payments    │ • Immediate next step   │
└─────────────────────────┴──────────────────────────┴─────────────────────────┴─────────────────────────┘
```

### A. Discovery & Search (Home Page, Search Results, Filter Sidebar)
- **Primary Goal:** Guide the traveler to input their origin and destination and explore viable route combinations.
- **Tone:** Inspiring, clear, and action-oriented.
- **Guidelines:** Emphasize time savings and balanced multimodal options. Highlight transfer counts and durations prominently.

### B. Route Customization (Trip Planner, Leg Edit Modal, Transfer Buffers)
- **Primary Goal:** Enable travelers to inspect, modify, and fine-tune each segment of their journey.
- **Tone:** Methodical, precise, and advisory.
- **Guidelines:** When a transfer window is short, provide constructive advice (e.g., *"Transfer window is 20 minutes. Consider allowing 35 minutes for terminal transfer"*). Never use alarming or scolding language.

### C. Review & Test Checkout (Booking Review, Razorpay Test Modal, Confirmation)
- **Primary Goal:** Guide the traveler through passenger details and realistic payment testing with total peace of mind.
- **Tone:** Reassuring, explicit, and transparent.
- **Guidelines:** Reassure the traveler that no real credit card or bank account will ever be charged. Clearly label test payment buttons with the simulated amount.

### D. Errors, Validation, & Empty States (Form Validation, Network Errors, Empty Search)
- **Primary Goal:** Help travelers recover quickly when something goes wrong or when no direct routes are found.
- **Tone:** Calm, empathetic, and constructive.
- **Guidelines:** Never blame the user. Clearly describe what happened and provide a single, obvious next action (e.g., *"Try adjusting your departure date or removing filters to see more journeys"*).

---

## 5. Standardized Product Terminology & Lexicon

To maintain consistency across the entire web application, use these approved terms:

### People & Travelers
| Approved Term | Prohibited Terms | Usage Context |
| :--- | :--- | :--- |
| **Traveler(s)** | `Pax`, `Users`, `Clients`, `Entities` | Use across general UI, search counters, and summary cards. |
| **Passenger(s)** | `Pax`, `Riders`, `Seats` | Use in formal ticketing, boarding pass, and traveler detail forms. |
| **Primary Traveler** | `Lead Pax`, `Admin`, `User 1` | The main contact person receiving booking updates and vouchers. |

### Journeys & Routes
| Approved Term | Prohibited Terms | Usage Context |
| :--- | :--- | :--- |
| **Journey** or **Trip** | `Itin`, `Commute Sequence`, `Modal Chain` | A complete itinerary from initial origin to final destination. |
| **Segment** or **Leg** | `Transit Unit`, `Node`, `Step Index` | An individual component of a trip (e.g., Cab leg, Flight leg). |
| **Door-to-Door** | `End-to-End Multimodal Aggregation` | Complete journey including first-mile and last-mile transfers. |
| **Popular Corridors** | `Preset Seed Routes`, `Mock Hubs` | Curated travel routes displayed on the Home screen. |

### Connection Buffers & Transfers
| Approved Term | Prohibited Terms | Usage Context |
| :--- | :--- | :--- |
| **Transfer Buffer** or **Connection Window** | `Slack Time`, `Gap`, `Latency`, `Wait Window` | The scheduled duration between arriving on one leg and departing on the next. |
| **Tight Transfer Window** | `Dangerous Connection!`, `Warning Slack` | A valid connection that is below recommended safety thresholds (e.g., < 30m). |
| **Invalid Connection Window** | `Impossible Connection!`, `Fatal Timing Error` | A connection where departure occurs prior to previous leg arrival. |
| **Transit Hub** | `Node Junction`, `Transfer Point Code` | Stations, airports, or terminals where legs connect (e.g., Chennai Central). |

### Transport Modes & Carriers
| Mode | Standard Display Name | Carrier / Category Examples |
| :--- | :--- | :--- |
| **Flight** | `Flight` | Commercial airlines (e.g., IndiGo, Air India) |
| **Train** | `Train` or `Express Rail` | Indian Railways services (e.g., Vande Bharat Express, Shatabdi Express, Rajdhani) |
| **Bus** | `Intercity Bus` or `Bus` | State & private operators (e.g., KSRTC, Zingbus, Intrcity SmartBus) |
| **Metro** | `Metro` | Urban rapid transit (e.g., Namma Metro, Delhi Metro, Chennai Metro) |
| **Cab** | `Cab` or `Taxi` | Pre-booked or on-demand cabs (e.g., Airport Taxi, City Cab) |
| **Auto** | `Auto` or `Auto-Rickshaw` | Local first/last mile three-wheelers |

### Pricing & Fares
| Approved Term | Prohibited Terms | Usage Context |
| :--- | :--- | :--- |
| **Fare** or **Total Fare** | `Cost Basis`, `Price Point`, `Fee Payload` | The total monetary cost of a leg or complete journey. |
| **Simulated Fare** | `Fake Price`, `Dummy Cost` | Transparent notice that fares are representative for demo evaluation. |
| **Per Traveler** | `Per Pax`, `Per Head`, `Per Unit` | Fare rate breakdown per individual passenger. |

### Booking & Checkout
| Approved Term | Prohibited Terms | Usage Context |
| :--- | :--- | :--- |
| **Select Journey** | `Book Demo`, `Test Run`, `Execute Itinerary` | Primary action button on Journey Cards in search results. |
| **Review & Book Itinerary →** | `Book Entire Multimodal Trip Demo` | Bottom action button on the Trip Planner view. |
| **Simulated Booking** | `Demo Record`, `Dummy Row`, `Mock Checkout` | A completed test reservation saved in the demo database. |
| **Cancel Booking** | `Cancel Demo`, `Kill Reservation`, `Drop Row` | Action to cancel an existing reservation in My Bookings. |

### Vouchers & References
| Approved Term | Prohibited Terms | Usage Context |
| :--- | :--- | :--- |
| **Simulated Boarding Pass** | `Fake Ticket`, `Demo Stub`, `HTML Receipt` | The final printable journey pass issued after checkout. |
| **Booking Reference (PNR)** | `Ref ID`, `Database Key`, `Token` | The 8-character unique alphanumeric booking identifier (e.g., `TP-849201`). |
| **Travel Voucher** | `Purchase Order`, `Invoice Stub` | Summary travel confirmation document. |

### AI Travel Assistant
| Approved Term | Prohibited Terms | Usage Context |
| :--- | :--- | :--- |
| **TripPilot AI Assistant** | `Bot`, `NLP Engine`, `Copilot Agent` | The conversational assistant drawer. |
| **Route Search Proposed** | `ACTION: SEARCH_JOURNEYS` | The structured card shown when the assistant proposes search filters. |
| **Itinerary Recommendation** | `ACTION: SUGGEST_ITINERARY` | The structured card shown when the assistant suggests a trip. |
| **Finding options for you...** | `Generating LLM response...` | Thinking indicator when the assistant is processing a request. |

---

## 6. Headline & Hierarchy Conventions

Headlines must immediately communicate value, orientation, and context.

### Heading Level Guidelines

- **H1 — Page Titles (Only one per page):** State what the page enables the traveler to do.
  - *Good:* `Search & Compare Door-to-Door Journeys`
  - *Good:* `Multimodal Trip Planner`
  - *Good:* `Review & Confirm Your Reservation`
  - *Bad:* `Welcome`
  - *Bad:* `Explore More`
  - *Bad:* `Planner`

- **H2 — Major Section Headings:** Group related cards or form controls with meaningful context.
  - *Good:* `Popular Travel Corridors Across India`
  - *Good:* `Journey Itinerary & Connection Timeline`
  - *Good:* `Primary Traveler Contact Details`
  - *Bad:* `Information`
  - *Bad:* `Things to See`
  - *Bad:* `Section 2`

- **H3 — Card, Sub-Section, & Modal Titles:** Describe the specific action or component.
  - *Good:* `Transfer Buffer Notice`
  - *Good:* `Edit Journey Segment Details`
  - *Good:* `Payment Verification (Simulated)`
  - *Bad:* `Notice`
  - *Bad:* `Edit`
  - *Bad:* `Step 1`

### Capitalization & Typography Rules
- **Sentence Case or Title Case:** Standardize on clean, consistent Title Case for major Page Titles and Section Headers (`Search & Compare Journeys`), and Sentence Case for helper text, alerts, and table headers (`Departure city or hub`).
- **Never use ALL CAPS:** Avoid all-caps text blocks (e.g., `IMPOSSIBLE CONNECTION!`, `WARNING: DEMO ONLY!`). Use bolding or accent badges for emphasis.

---

## 7. Call-to-Action (CTA) & Button Guidelines

Buttons are promises to the user. Every button label must be explicit, active, and reassuring.

### Button Copy Formula: `[Active Verb] + [Specific Target / Action]`

| Component / Location | Recommended CTA Label ✅ | Prohibited Label ❌ | Why It Works |
| :--- | :--- | :--- | :--- |
| **Search Widget** | `Search Journeys` | `Submit`, `Go`, `Find` | Explicitly states what is being searched. |
| **Journey Card** | `Select Journey` | `Book Demo`, `Click Here` | Clear first step toward reviewing itinerary details. |
| **Compare Drawer** | `Book This Option →` | `Select & Book Demo` | Clean, direct forward action. |
| **Trip Planner Page** | `Review & Book Itinerary →` | `Book Entire Multimodal Trip Demo` | Concise, professional progression to checkout. |
| **Leg Card Toolbar** | `Edit Details` | `Modify`, `Config` | Natural everyday English. |
| **Leg Card Toolbar** | `Remove Segment` | `Delete`, `Drop Leg` | Clear, safe description of the segment action. |
| **Leg Edit Modal** | `Save Changes` | `OK`, `Done`, `Execute` | Explicitly confirms edits are applied. |
| **Booking Review Page** | `Pay ₹3,640 via Razorpay (Test)` | `Pay Now`, `Test Gateway` | Shows the exact simulated currency amount and provider. |
| **Instant Booking Mode** | `Confirm Simulated Booking (₹3,640)` | `Simulate Success`, `Bypass` | Reassuring consumer confirmation label. |
| **My Bookings Page** | `Cancel Booking` | `Cancel Demo`, `Delete Record` | Matches standard travel consumer terminology. |
| **Cancellation Dialog** | `Keep My Booking` / `Confirm Cancellation` | `Yes` / `No` | Prevents destructive errors by explicitly stating consequences. |
| **AI Assistant Action** | `Apply Changes to Results →` | `Apply to Website View`, `Action: Run` | Professional, assistant-driven recommendation. |

---

## 8. Form Fields, Realistic Placeholders, & Validation Rules

Forms must feel welcoming, clear, and effortless to complete.

### Field Labels
- Place field labels directly above the input box.
- Never use database schema notation in customer-facing labels (e.g. use `Departure City`, not `From (Origin)`).
- Indicate optional fields clearly with `(Optional)`. Do not use asterisks alone without an explanation.

### Input Placeholders
Placeholders should demonstrate realistic formatting examples rather than repeating the label text:
- **Full Name:** `e.g. Rahul Nair`
- **Email Address:** `e.g. rahul.nair@example.com`
- **Phone Number:** `e.g. +91 98450 12345`
- **City / Station:** `e.g. Bengaluru (KSR Station or Airport)`
- **Age:** `e.g. 28`

### Inline Validation & Error Feedback Formula

```
┌─────────────────────────┐  +  ┌─────────────────────────┐
│     What went wrong     │     │    How to fix it        │
└─────────────────────────┘     └─────────────────────────┘
```

- **Bad (Vague):** `Invalid input.`
- **Bad (Technical):** `HTTP 422: passengers.0.email fails regex pattern validation.`
- **Good (Email):** `Please enter a valid email address so we can deliver your booking voucher.`
- **Good (Full Name):** `Please enter the traveler's full name as shown on government ID (at least 2 letters).`
- **Good (Phone):** `Please enter a valid contact phone number with 7 to 15 digits.`
- **Good (Departure):** `Please choose a departure city different from your arrival city.`

---

## 9. Formatting, Numerical, & Punctuation Standards

Consistency in formatting builds trust and improves readability.

### A. Currency Formatting
- Always use the Indian Rupee symbol: **`₹`**.
- Never use `Rs.`, `INR`, or `Rupees` in customer-facing UI text.
- Use standard comma grouping for thousands: **`₹3,250`**, **`₹14,800`**.
- Do not display fractional paise (`.00`) unless calculating fractional tax breakdowns.

### B. Time & Duration Formatting
- Format scheduled times in 12-hour format with AM/PM: **`06:15 AM`**, **`08:30 PM`**.
- Display durations concisely with `h` and `m`: **`1h 45m`**, **`45m`**, **`6h 10m`**.
- Avoid writing out long verbal durations like *"135 minutes"* when *"2h 15m"* is immediately scannable.

### C. Dates
- Format dates with day, abbreviated month, and full year: **`26 Oct 2026`** or **`Monday, 26 October 2026`**.
- Never use ambiguous numerical date formats like `05/06/2026` (which could be May 6 or June 5).

### D. Punctuation & Exclamation Marks
- **Strictly limit exclamation marks (!):** Maximum of one per page, and only on true celebratory milestones (e.g., *"🎉 Your booking is confirmed!"*).
- **Never use multiple exclamation marks:** Prohibit `Book Now!!!` or `Hurry!!!`.
- **Never use exclamation marks on warnings or errors:**
  - *Bad:* `Impossible Connection!`
  - *Good:* `Invalid Connection Window`

---

## 10. Prototype & Demonstration Transparency Standards

TripPilot AI provides a realistic demonstration of multimodal travel planning and payment flows. Transparency ensures users understand what the platform is doing without feeling alienated by software jargon.

### Transparency Principles

1. **Be upfront about demonstration data:** Fares, schedules, and reservations are simulated to demonstrate connected travel in India.
2. **Never claim real government or airline PNR issuance:** Do not suggest that an official IRCTC or airline ticket has been purchased with actual transportation providers.
3. **Reassure on test payments:** Explicitly communicate that the Razorpay gateway operates in **Test Mode** and that no real money will ever be charged.
4. **Replace developer jargon with consumer demonstration copy:**

| Technical / Internal Copy ❌ | Transparent & Professional Product Copy ✅ |
| :--- | :--- |
| `FastAPI + Supabase Integrated Multimodal Travel Engine` | `TripPilot AI Preview | Multimodal Journey Planner` |
| `⚠️ Interactive Demo Data Only — No Real Fares or Tickets Issued` | `Interactive Demonstration — Fares and tickets are simulated for evaluation.` |
| `Cryptographic HMAC-SHA256 signature verification with FastAPI` | `Razorpay Test Gateway: Experience checkout using simulated test cards or UPI. No real money charged.` |
| `Zero-step bypass for rapid walkthroughs` | `Instant One-Click Confirmation: Instantly confirm your reservation without opening the checkout popup.` |
| `Drop record in Supabase database table` | `Cancel this simulated booking and update reservation status.` |
| `Single source of truth: TripPilot_AI_PRD_Antigravity.md` | `Designed for seamless, connected journeys across India.` |

---

## 11. Good vs. Bad Copy Reference Directory

This comprehensive directory provides side-by-side copy transformations across every screen and component in TripPilot AI:

### Global Header & Navigation
| Element | Current / Bad Copy ❌ | Recommended Good Copy ✅ | Rationale |
| :--- | :--- | :--- | :--- |
| **Brand Subtitle** | `Multimodal Travel Engine` | `Connected Journeys Across India` | Warmer and more descriptive. |
| **Nav Item 1** | `Explore` | `Search Journeys` | Clear action describing what the page offers. |
| **Nav Item 2** | `Planner` | `Trip Planner` | Full, professional product feature title. |
| **Nav Item 3** | `My Bookings` | `My Bookings` | Standard consumer label (keep consistent). |
| **AI Assistant Button**| `AI Assistant` (generic tooltip) | `Plan with AI Concierge` | Highlights intelligent travel assistance. |
| **User Dropdown** | `Signed in as [email]` | `Account: [email]` • `View Saved Bookings` | Friendly account management. |

### Global Top Banner & Footer
| Element | Current / Bad Copy ❌ | Recommended Good Copy ✅ | Rationale |
| :--- | :--- | :--- | :--- |
| **Top Banner** | `⚡ FASTAPI + SUPABASE: Interactive demo mode active...` | `Interactive Demonstration — Fares and tickets are simulated for evaluation.` | Replaces software stack leak with calm consumer notice. |
| **Footer Heading 1** | `Architecture Stack` | `Platform Capabilities` | Travelers care about what the platform does, not libraries. |
| **Footer Stack Text**| `React 18, FastAPI Python, Supabase DB, Razorpay Mock, Groq AI` | `Door-to-Door Routing, Transfer Buffer Safety, Conversational AI, Instant Test Bookings` | Highlights travel capabilities. |
| **Footer Notice** | `Single source of truth: TripPilot_AI_PRD_Antigravity.md` | `Designed for seamless, connected journeys across India.` | Removes internal documentation reference. |

### Home Page
| Element | Current / Bad Copy ❌ | Recommended Good Copy ✅ | Rationale |
| :--- | :--- | :--- | :--- |
| **Hero Badge** | `MULTIMODAL JOURNEY ENGINE` | `✨ Seamless Door-to-Door Travel` | Inviting and consumer-friendly. |
| **Hero Title (H1)** | `The Next-Generation Multimodal Travel Platform` | `Connect Flights, Trains, and Cabs in One Seamless Journey` | Concrete and outcome-focused. |
| **Hero Subtitle** | `Seamlessly plan, optimize, and book door-to-door multi-leg journeys across flights, high-speed rail, intercity buses, and local transit in India.` | `Plan complete door-to-door itineraries with smart connection buffers, real-time comparison, and simulated instant booking.` | Scannable, active, and benefits-driven. |
| **Search Widget Title**| `Plan Your Journey` | `Where would you like to travel?` | Warm, conversational prompt. |
| **Traveler Counter** | `Pax: [ 1 ]` | `Travelers: [ 1 ]` | Replaces airline industry jargon. |
| **Origin / Destination**| `From (Origin)` / `To (Destination)` | `From: Departure city or hub` / `To: Destination city` | Natural labels without database parentheses. |
| **Popular Routes Tag**| `Popular Corridors (Seed Data)` | `Popular Travel Corridors` | Removes database "Seed Data" developer tag. |
| **Feature Card 1** | `Door-to-Door Multimodal Routing` | `Door-to-Door Routing: Connect air, rail, bus, and cab segments in a single coordinated itinerary.` | Clear benefit explanation. |
| **Feature Card 2** | `Intelligent Connection Buffers` | `Smart Connection Buffers: Automatic transfer windows protect you against missed connections.` | Reassuring travel safety message. |
| **Feature Card 3** | `FastAPI & Supabase Architecture: Clean backend separation...` | `Simulated End-to-End Booking: Test realistic reservations and Razorpay payment flows safely.` | Replaces backend tech stack with user benefit. |

### Search Results & Filters
| Element | Current / Bad Copy ❌ | Recommended Good Copy ✅ | Rationale |
| :--- | :--- | :--- | :--- |
| **Results Header (H1)**| `Explore Journeys` | `Available Journeys: {origin} to {destination}` | Specific and contextual. |
| **Results Count** | `Found 3 routes` | `3 journeys found • Sorted by recommended` | Clear and polished. |
| **Filter Sidebar Title**| `Filters` | `Filter Travel Options` | Descriptive heading. |
| **Time Filter Slots** | `06:00 - 12:00` | `Morning (6:00 AM – 12:00 PM)` | Friendly 12-hour format with named periods. |
| **Empty Results State** | `No routes found. Adjust your filters.` | `No journeys found matching your selected filters. Try clearing some filters or searching nearby travel dates.` | Empathetic and actionable. |
| **Error Retry Banner** | `Failed to fetch routes. Error 500.` | `We were unable to load journeys right now. Please check your connection and tap Try Again.` | Helpful and constructive. |

### Journey Cards & Comparison
| Element | Current / Bad Copy ❌ | Recommended Good Copy ✅ | Rationale |
| :--- | :--- | :--- | :--- |
| **Card Action Button** | `Book Demo` | `Select Journey` | Avoids confusing B2B sales phrasing. |
| **Fare Label** | `Price: ₹3,640` | `Simulated Fare: ₹3,640 per traveler` | Transparent and descriptive. |
| **Leg Accordion Toggle**| `Show Legs (3)` | `View Journey Details (3 segments)` | Clearer travel terminology. |
| **Compare Checkbox** | `Compare` | `Add to Compare` | Active verb. |
| **Compare Drawer CTA** | `Select & Book Demo →` | `Book This Option →` | Direct action verb. |

### Trip Planner & Leg Editing
| Element | Current / Bad Copy ❌ | Recommended Good Copy ✅ | Rationale |
| :--- | :--- | :--- | :--- |
| **Planner Title (H1)** | `Trip Planner` | `Customize Your Journey Itinerary` | Descriptive page outcome. |
| **Planner Subtitle** | `Edit legs, adjust buffer times, and book complete trips.` | `Review connection windows, customize individual segments, and confirm your complete travel itinerary.` | Welcoming and clear. |
| **Tight Buffer Alert** | `Tight Connection Buffer: 15 mins` | `Tight Transfer Window: 15 mins (We recommend at least 30 mins to change platforms)` | Explains *why* and what is recommended. |
| **Invalid Buffer Alert**| `Impossible Connection: Departure occurs before previous arrival!` | `Invalid Connection Window: Departure is scheduled before your previous segment arrives.` | Replaces exclamation mark with calm diagnosis. |
| **Add Leg Button** | `+ Add Leg` | `+ Add Travel Segment` | Professional travel terminology. |
| **Bottom Planner CTA** | `Book Entire Multimodal Trip Demo` | `Review & Book Itinerary →` | Clean, forward-moving action. |
| **Leg Modal Header** | `Edit Leg Details` | `Edit Travel Segment Details` | Consistent segment terminology. |
| **Leg Modal Departure**| `From Hub (Select)` | `Departure Station / Airport` | Explicit travel facility terminology. |

### Booking Review & Payment Modal
| Element | Current / Bad Copy ❌ | Recommended Good Copy ✅ | Rationale |
| :--- | :--- | :--- | :--- |
| **Review Page Title** | `Booking Review` | `Review & Complete Your Reservation` | Warm, clear H1. |
| **Instructions** | `Enter traveller details and checkout with Razorpay Payment Gateway (Test Mode).` | `Confirm traveler details and complete your simulated booking.` | Friendly, natural instructions. |
| **Auth Requirement** | `Sign In Required: TripPilot AI requires you to sign in to verify payment signatures in demo mode.` | `Sign in to confirm your booking: Required to personalize your boarding pass and save your trip.` | Replaces cryptographic signature jargon with traveler benefit. |
| **Payment Option 1** | `Razorpay Test Gateway: Authentic modal with cryptographic HMAC-SHA256 verification.` | `Razorpay Test Gateway: Experience checkout using dummy test cards or UPI. No real money charged.` | Focuses on user safety rather than hashing algorithms. |
| **Payment Option 2** | `Simulated Instant Booking: Zero-step bypass for rapid walkthroughs.` | `Instant One-Click Confirmation: Instantly confirm your reservation without opening the checkout popup.` | Removes software engineering test terminology. |
| **Simulated Modal Text**| `Click Simulate Successful Payment to verify the HMAC signature with FastAPI.` | `Click below to complete your simulated payment and issue your ticket voucher.` | Eliminates internal FastAPI and HMAC references. |

### Booking Confirmation & Boarding Pass
| Element | Current / Bad Copy ❌ | Recommended Good Copy ✅ | Rationale |
| :--- | :--- | :--- | :--- |
| **Hero Title** | `Demo Booking Confirmed!` | `🎉 Your Booking is Confirmed!` | Warm and celebratory. |
| **Hero Subtitle** | `Persisted to demo database. Reference: TP-849201` | `Your simulated itinerary has been confirmed and saved to your account. Booking Reference: TP-849201` | Professional and reassuring. |
| **Voucher Title** | `Multimodal Journey Pass (Demo)` | `Simulated Multimodal Boarding Pass` | Professional document title. |
| **Action 1** | `Print Voucher` | `Print / Save as PDF` | Clear utility. |
| **Action 2** | `View My Bookings` | `View All Saved Bookings →` | Explicit destination. |

### My Bookings Page
| Element | Current / Bad Copy ❌ | Recommended Good Copy ✅ | Rationale |
| :--- | :--- | :--- | :--- |
| **Page Title (H1)** | `My Bookings` | `My Travel Bookings` | Clear, prominent H1. |
| **Empty State** | `No demo bookings found.` | `No bookings found. When you book a journey, your itinerary and boarding passes will appear here.` | Helpful and inviting. |
| **Cancel Button** | `Cancel Demo` | `Cancel Booking` | Standard consumer action. |
| **Cancel Modal Text** | `Are you sure? This will update the demo status in Supabase.` | `Are you sure you want to cancel booking {ref}? Your reservation will be updated immediately.` | Eliminates Supabase database leak. |
| **Cancel Confirmation**| `Keep My Booking` / `Confirm Cancellation` | `Yes` / `No` | Prevents accidental destructive clicks. |

### AI Assistant Drawer
| Element | Current / Bad Copy ❌ | Recommended Good Copy ✅ | Rationale |
| :--- | :--- | :--- | :--- |
| **Drawer Header** | `TripPilot AI Assistant` | `TripPilot Travel Assistant` | Warm, personal product concierge. |
| **Thinking Copy** | `TripPilot AI is formulating recommendations...` | `Finding the best travel options for you...` | Conversational, natural tone. |
| **Action Header 1** | `ACTION: SEARCH_JOURNEYS` | `Route Search Proposed` | Replaces enum constant with friendly human header. |
| **Action Header 2** | `ACTION: SUGGEST_ITINERARY` | `Itinerary Recommendation` | Professional travel assistant phrasing. |
| **Action Card CTA** | `Apply to Website View` | `Apply Changes to Results →` | Clear, active outcome. |

---

## 12. Writer & Developer Compliance Checklist

Before committing any copy changes to the TripPilot AI codebase, verify that your text meets all criteria below:

- [ ] **Voice & Tone:** Does the text sound professional, friendly, and natural?
- [ ] **Descriptive Headings:** Are headings descriptive and contextual (avoiding *"Welcome"*, *"Explore More"*, or single-word titles)?
- [ ] **Actionable CTAs:** Does every button follow the `[Active Verb] + [Specific Target]` formula?
- [ ] **No Tech Leaks:** Are all references to *FastAPI*, *Supabase*, *Zustand*, *HMAC-SHA256*, *schema cache*, *seed data*, and *PRD markdown filenames* completely removed from UI copy?
- [ ] **Standardized Lexicon:** Are travelers called *Travelers* (not *Pax*), connection times called *Transfer Buffers* (not *Slack*), and journeys called *Journeys*?
- [ ] **Currency Formatting:** Is every price formatted with `₹` and comma grouping (e.g. `₹3,250`)?
- [ ] **Transparent Simulation:** Are disclaimers honest and reassuring without using alarming all-caps warnings or exclamation marks?
- [ ] **Constructive Errors:** Do error messages explain what happened and provide an immediate fix in plain language?
- [ ] **Layout Safety:** Does the copy fit within existing UI containers and maintain all current functionality without altering layouts?

---

*Document Author: Senior UX Writer & Product Content Strategist, TripPilot AI*  
*Last Reviewed: October 2026*
