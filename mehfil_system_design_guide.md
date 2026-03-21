# 🎭 Mehfil — Complete System Design Guide

> A beginner-friendly, structured system design document for the Mehfil cultural event management platform.

---

## Table of Contents

1. [Project Roadmap](#1-project-roadmap)
2. [System Architecture & Data Flow](#2-system-architecture--data-flow)
3. [Frontend Structure](#3-frontend-structure)
4. [User Roles & Profiles](#4-user-roles--profiles)
5. [Backend Design](#5-backend-design)
6. [Database Design](#6-database-design)
7. [Tech Stack Suggestion](#7-tech-stack-suggestion)
8. [Scalability & Future Improvements](#8-scalability--future-improvements)
9. [Quick Reference Summary](#9-quick-reference-summary)

---

## 1. Project Roadmap

Think of building Mehfil like constructing a building — you don't start painting walls before laying the foundation. Here are the 5 phases:

### Phase 1 — Planning (Week 1–2)
- Define all features you want to build
- Choose your tech stack (see Section 7)
- Sketch wireframes on paper or Figma
- Set up a GitHub repository
- Create a project board (GitHub Projects or Trello)

### Phase 2 — Design (Week 3–4)
- Design UI mockups for all screens (Figma is free)
- Define the database schema (see Section 6)
- Plan all API routes (see Section 5)
- Review designs with teammates or mentor

### Phase 3 — Development (Week 5–12)

| Sprint | Duration | Focus |
|---|---|---|
| Sprint 1 | Week 5–6 | Auth system + User profiles |
| Sprint 2 | Week 7–8 | Events listing + Event details + Create event |
| Sprint 3 | Week 9–10 | Booking flow + Payment integration |
| Sprint 4 | Week 11–12 | Dashboards (all 4 roles) + QR check-in + Reviews |

### Phase 4 — Testing (Week 13–14)
- Unit test all API routes
- Have a real person try to use the app (they'll find bugs you never thought of)
- Check all role permissions are enforced correctly
- Test payment flow end-to-end (Razorpay test mode)
- Fix all critical bugs

### Phase 5 — Deployment (Week 15–16)
- Deploy frontend + backend to Vercel
- Configure Supabase production database
- Set all environment variables on Vercel
- Do a final smoke test on the live URL
- Go live!

> **Tip:** Build v1 first. Get all 4 dashboards working with real data. The biggest mistake students make is trying to build everything at once and ending up with nothing working.

---

## 2. System Architecture & Data Flow

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│           USERS (Browser / Mobile)                  │
│     Admin · Organizer · Artist · Attendee           │
└──────────┬──────────────────────────┬───────────────┘
           │ HTTP Request             │ HTML / JSON Response
           ▼                          ▲
┌─────────────────────────────────────────────────────┐
│           FRONTEND (Next.js + React)                │
│   Pages · Components · Forms · Routing              │
│         State management (TanStack Query)           │
└──────────┬──────────────────────────┬───────────────┘
           │ API Call (fetch)         │ JSON Response
           ▼                          ▲
┌─────────────────────────────────────────────────────┐
│          BACKEND (Next.js API Routes)               │
│   Auth middleware · Route handlers · Business logic │
│         Zod validation · Role checks                │
└──────┬────────────────┬──────────────┬──────────────┘
       │                │              │
       ▼                ▼              ▼
┌────────────┐  ┌───────────────┐  ┌─────────────────┐
│ Supabase   │  │  Supabase     │  │ External        │
│ Auth       │  │  PostgreSQL   │  │ Services        │
│            │  │  (6 tables)   │  │ Razorpay·Resend │
│ Login      │  │  RLS policies │  │                 │
│ Signup     │  │               │  │                 │
│ JWT tokens │  │               │  │                 │
└────────────┘  └───────┬───────┘  └─────────────────┘
                        │
                        ▼
          ┌─────────────────────────────┐
          │  Supabase Realtime + Storage│
          │  Live notifications         │
          │  File uploads (banners,     │
          │  avatars)                   │
          └─────────────────────────────┘
```

### Data Flow — Booking a Ticket (Step by Step)

```
User              Frontend           Backend API         Database
 │                   │                    │                  │
 │─ Clicks           │                    │                  │
 │  "Book ticket" ──▶│                    │                  │
 │                   │─ Shows ticket form │                  │
 │◀──────────────────│                    │                  │
 │                   │                    │                  │
 │─ Fills form,      │                    │                  │
 │  submits ────────▶│                    │                  │
 │                   │─ Validates form ──▶│                  │
 │                   │                    │─ Check auth ────▶│
 │                   │                    │◀─ User exists ───│
 │                   │                    │─ Check seat  ───▶│
 │                   │                    │◀─ Capacity OK ───│
 │                   │                    │─ Call Razorpay   │
 │                   │◀─ Payment modal ───│                  │
 │◀──────────────────│                    │                  │
 │─ User pays ──────▶│                    │                  │
 │                   │─ Payment confirmed▶│                  │
 │                   │                    │─ Create booking ▶│
 │                   │                    │─ Send email      │
 │                   │◀─ Confirmation ────│                  │
 │◀──────────────────│                    │                  │
 │  Sees booking ID  │                    │                  │
 │  + QR code        │                    │                  │
```

---

## 3. Frontend Structure

### All Pages / Screens

#### Public Pages (anyone can access)

| Page | Route | What it contains |
|---|---|---|
| Home | `/` | Hero banner, featured events, category filters, "How it works" section, footer |
| Events list | `/events` | Search bar, category filter, city filter, event cards (image + title + date + price) |
| Event details | `/events/:id` | Banner image, description, artist lineup, ticket types + prices, venue map, review section, "Book Now" button |
| Login / Signup | `/auth` | Email + password form, role selection on register, social login buttons |
| About | `/about` | What is Mehfil, team info |
| Contact | `/contact` | Contact form |
| Search | `/search` | Search results filtered by keyword, category, city, date |

#### Role-Specific Dashboards (after login)

| Dashboard | Route | What it shows |
|---|---|---|
| Admin dashboard | `/dashboard/admin` | All events, all users, revenue stats, pending moderation items |
| Organizer dashboard | `/dashboard/organizer` | My events, ticket sales, attendee count, revenue charts |
| Artist dashboard | `/dashboard/artist` | My portfolio, upcoming gigs, event invitations, past shows |
| Attendee dashboard | `/dashboard/attendee` | My bookings, upcoming events, past events, tickets |

#### Shared Logged-In Pages

| Page | Route | What it contains |
|---|---|---|
| Profile | `/profile` | Avatar, bio, location, edit form |
| Booking details | `/bookings/:id` | QR code, ticket breakdown, event info, cancel button |
| Notifications | `/notifications` | List of alerts (booking confirmed, event reminder, review reply) |
| Settings | `/settings` | Change password, notification preferences |
| Write review | `/events/:id/review` | Star rating form, pros/cons, review text |

#### Organizer + Admin Only

| Page | Route | What it contains |
|---|---|---|
| Create event | `/events/create` | Multi-step form: Basic info → Venue → Tickets → Artists → Media → Publish |
| Edit event | `/events/:id/edit` | Same as create, pre-filled |
| Analytics | `/dashboard/analytics` | Charts: ticket sales over time, revenue by category, attendee demographics |
| QR check-in | `/events/:id/checkin` | Camera scanner, live booking lookup, mark attendance button |

#### Admin Only

| Page | Route | What it contains |
|---|---|---|
| User management | `/admin/users` | List all users, change roles, deactivate accounts |
| Review moderation | `/admin/reviews` | Approve, reject, or flag reviews |
| Sponsor management | `/admin/sponsors` | Add/edit sponsor records |
| System settings | `/admin/settings` | Platform-wide config |

### Navigation Flow

```
Home
 ├── Events list
 │    └── Event details
 │         ├── Book Now → Booking flow → Confirmation
 │         └── Write Review (logged in + attended)
 ├── Login / Signup
 │    └── Dashboard (role-aware)
 │         ├── Admin: Users · All Events · Analytics · Sponsors
 │         ├── Organizer: My Events · Create Event · Analytics · Check-in
 │         ├── Artist: Portfolio · Gigs · Invitations
 │         └── Attendee: My Bookings · Upcoming Events
 └── Profile → Settings
```

---

## 4. User Roles & Profiles

Mehfil has 4 user types. Think of it like a cinema — the projectionist, ticket seller, actor, and audience member all have different jobs.

### Role Permissions Matrix

| Permission | Admin | Organizer | Artist | Attendee |
|---|:---:|:---:|:---:|:---:|
| View events | ✅ | ✅ | ✅ | ✅ |
| Create events | ✅ | ✅ | ❌ | ❌ |
| Edit own events | ✅ | ✅ | ❌ | ❌ |
| Delete events | ✅ | ✅ (own) | ❌ | ❌ |
| Book tickets | ✅ | ✅ | ✅ | ✅ |
| Cancel bookings | ✅ | ✅ | ✅ | ✅ |
| Write reviews | ✅ | ❌ | ✅ | ✅ |
| Moderate reviews | ✅ | ✅ (own events) | ❌ | ❌ |
| View analytics | ✅ (all) | ✅ (own) | ❌ | ❌ |
| Manage users | ✅ | ❌ | ❌ | ❌ |
| Manage sponsors | ✅ | ✅ | ❌ | ❌ |
| Artist portfolio | ❌ | ❌ | ✅ | ❌ |

### Role Descriptions

**Admin**
- Has full access to everything in the system
- Can manage all users (change roles, deactivate accounts)
- Can moderate all reviews across all events
- Can see all revenue and analytics data
- Assigned manually (not self-registered)

**Organizer**
- Can create, edit, and delete their own events
- Can manage ticket types and pricing
- Can moderate reviews on their own events
- Can see analytics for their own events only
- Can add sponsors to their events
- Registers with the Organizer role

**Artist**
- Has a public portfolio page
- Can be invited to events by organizers
- Can accept/decline gig invitations
- Can write reviews for events they attended
- Cannot create events on their own
- Registers with the Artist role

**Attendee**
- The most common user type (general public)
- Can browse and search all events
- Can book tickets and make payments
- Can cancel bookings and request refunds
- Can write reviews for events they attended
- Registers with the Attendee role (default)

### How Roles are Enforced

1. When a user registers, they pick their role (Organizer / Artist / Attendee). Admin is assigned manually by an existing Admin.
2. The role is stored in the `profiles` table in Supabase.
3. Every API route checks the user's role before allowing any action. For example:
   - Only Organizer/Admin can `POST /api/events`
   - Only the event's own Organizer (or Admin) can `DELETE /api/events/:id`
   - Only logged-in users who attended an event can `POST /api/reviews`

---

## 5. Backend Design

The backend is like a restaurant kitchen — the frontend (waiter) takes orders and the backend (kitchen) prepares and serves them.

### Module Structure

```
backend/
├── middleware/
│   ├── requireAuth.ts       ← Verify JWT token on every request
│   ├── requireRole.ts       ← Check if user's role is allowed
│   └── validateBody.ts      ← Zod schema validation
├── modules/
│   ├── auth/
│   │   └── route.ts         ← POST /register, POST /login, POST /reset-password
│   ├── events/
│   │   └── route.ts         ← GET, POST, PUT, DELETE /events
│   ├── bookings/
│   │   └── route.ts         ← POST /bookings, GET /bookings/user, POST /cancel
│   ├── payments/
│   │   └── route.ts         ← POST /payments/create, POST /payments/webhook
│   ├── reviews/
│   │   └── route.ts         ← GET, POST /reviews
│   └── profiles/
│       └── route.ts         ← GET, PUT /profile
└── lib/
    ├── supabase.ts          ← Supabase client (server-side)
    ├── email.ts             ← Resend email sender
    └── errors.ts            ← Shared error handler
```

### How a Request Flows Through the Backend

```
Incoming request
       │
       ▼
┌─────────────────────────────────────────────┐
│          MIDDLEWARE (runs on every request) │
│  1. Parse Authorization header              │
│  2. Verify JWT with Supabase                │
│  3. Attach user object to request           │
│  4. Check role permission for this route    │
└──────────────────────┬──────────────────────┘
                       │
       ┌───────────────┼────────────────────┐
       ▼               ▼                    ▼
  Auth module    Events module       Bookings module
  Profiles       Reviews             Payments
       │               │                    │
       └───────────────┼────────────────────┘
                       ▼
          ┌────────────────────────┐
          │     Shared services    │
          │  Zod · Error handler   │
          │  Supabase · Email      │
          └────────────┬───────────┘
                       ▼
               Supabase PostgreSQL
```

### Complete API Endpoint Reference

#### Public (No Auth Required)

| Method | Endpoint | What it does |
|---|---|---|
| GET | `/health` | Check if server is running |
| GET | `/api/events` | List all events (filterable by category, city, status) |
| GET | `/api/events/:id` | Get one event's full details |
| GET | `/api/reviews/event/:eventId` | Get all reviews for an event |

#### Authenticated (Bearer Token Required)

| Method | Endpoint | Who can use | What it does |
|---|---|---|---|
| GET | `/api/profile` | Self | Get my profile |
| PUT | `/api/profile` | Self | Update my profile |
| GET | `/api/profile/:id` | Anyone | View any public profile |
| POST | `/api/events` | Organizer, Admin | Create a new event |
| PUT | `/api/events/:id` | Organizer (own), Admin | Edit an event |
| DELETE | `/api/events/:id` | Organizer (own), Admin | Delete an event |
| GET | `/api/bookings/user` | Self | Get my bookings |
| POST | `/api/bookings` | Any logged-in user | Book tickets |
| POST | `/api/bookings/:id/cancel` | Self | Cancel a booking |
| POST | `/api/payments/create` | Any logged-in user | Start a payment |
| POST | `/api/payments/webhook` | Razorpay only | Confirm payment (called by gateway) |
| POST | `/api/reviews` | Attendee, Artist | Write a review |
| PUT | `/api/reviews/:id/moderate` | Admin, Organizer (own events) | Approve/reject a review |
| GET | `/api/admin/users` | Admin only | List all users |
| PUT | `/api/admin/users/:id/role` | Admin only | Change a user's role |

---

## 6. Database Design

### Entity Relationship Overview

```
profiles ──< events      (one organizer creates many events)
profiles ──< bookings    (one attendee makes many bookings)
profiles ──< reviews     (one user writes many reviews)
profiles ──< payments    (one user makes many payments)
events   ──< bookings    (one event has many bookings)
events   ──< reviews     (one event receives many reviews)
bookings ──< payments    (one booking has one payment)
```

### Table Definitions

#### `profiles` — every registered user

| Column | Type | Description |
|---|---|---|
| `user_id` | uuid (PK) | Unique ID, linked to Supabase Auth |
| `email` | text | Login email address |
| `name` | text | Full display name |
| `phone` | text | Phone number |
| `role` | text | `admin / organizer / artist / attendee` |
| `avatar` | text | URL to profile picture |
| `bio` | text | Short description about the user |
| `city` | text | City name |
| `state` | text | State |
| `country` | text | Country |
| `lat` | double | GPS latitude (for map display) |
| `lng` | double | GPS longitude (for map display) |
| `created_at` | timestamp | When the account was created |

#### `events` — cultural events

| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Unique event ID |
| `organizer_id` | uuid (FK) | Who created this event |
| `title` | text | Event name |
| `description` | text | Full description |
| `category` | text | `poetry / music / dance / theater / cultural / literary / comedy` |
| `tags` | text[] | Array of tags for filtering |
| `date_time` | jsonb | `{ start: "...", end: "..." }` |
| `venue` | jsonb | `{ name, address, city, capacity, amenities }` |
| `artists` | jsonb | Array of invited artists |
| `ticketing` | jsonb | Array of ticket types with price and quantity |
| `finances` | jsonb | Revenue tracking data |
| `media` | jsonb | Banner image, gallery images |
| `status` | text | `draft / published / cancelled / completed` |
| `is_featured` | boolean | Show on homepage featured section |
| `created_at` | timestamp | Creation date |

#### `bookings` — ticket purchases

| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Internal ID |
| `booking_id` | text | Human-readable ID like `BK1234567890` |
| `event_id` | uuid (FK) | Which event was booked |
| `attendee_id` | uuid (FK) | Who made the booking |
| `tickets` | jsonb | `[{ type, quantity, price }]` |
| `total_amount` | numeric | Before discounts |
| `final_amount` | numeric | After discounts |
| `status` | text | `pending / confirmed / cancelled / refunded` |
| `payment_details` | jsonb | Payment reference info |
| `check_in` | jsonb | QR code data, check-in timestamp |
| `expires_at` | timestamp | When the pending hold expires |
| `created_at` | timestamp | Booking date |

#### `payments` — financial transactions

| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Internal ID |
| `payment_id` | text | Human-readable like `PAY1234567890` |
| `booking_id` | uuid (FK) | Which booking this pays for |
| `payer_id` | uuid (FK) | Who paid |
| `amount` | numeric | Gross amount |
| `net_amount` | numeric | After platform + processing fees |
| `payment_method` | text | `card / upi / netbanking / wallet` |
| `gateway` | jsonb | Razorpay response data |
| `processing_fee` | numeric | Gateway fee |
| `platform_fee` | numeric | Mehfil commission |
| `status` | text | `pending / processing / completed / failed / refunded` |
| `created_at` | timestamp | Payment date |

#### `reviews` — event feedback

| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Unique review ID |
| `event_id` | uuid (FK) | Which event was reviewed |
| `reviewer_id` | uuid (FK) | Who wrote it |
| `ratings` | jsonb | `{ overall, venue, performance, value }` — all out of 5 |
| `title` | text | Short review headline |
| `content` | text | Full review text |
| `pros` | text[] | Array of positive points |
| `cons` | text[] | Array of negative points |
| `status` | text | `pending / approved / rejected` |
| `helpful_votes` | integer | Upvotes from other users |
| `total_votes` | integer | Total votes on this review |
| `organizer_response` | jsonb | Organizer's reply to the review |
| `created_at` | timestamp | Review date |

#### `sponsors` — event sponsors

| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Unique sponsor ID |
| `company_name` | text | Sponsor company name |
| `logo` | text | URL to sponsor logo |
| `website` | text | Sponsor website URL |
| `sponsorship_tier` | text | `title / presenting / supporting / community` |
| `sponsored_event_ids` | uuid[] | Array of events they sponsor |
| `total_amount` | numeric | Total sponsorship value |
| `created_at` | timestamp | Record creation date |

### Row Level Security (RLS) — Plain English

Supabase's RLS means rules are enforced at the database level, not just in the API. This is an extra safety net.

```
Rule: "Users can only read their own bookings"
→ Even if an API bug exposes the wrong route, the DB will reject the query.

Rule: "Organizers can only update events they own"
→ organizer_id must match the logged-in user's ID.

Rule: "Anyone can read published events"
→ status = 'published' is publicly readable.

Rule: "Only admins can change a user's role"
→ Only rows where the requesting user's role = 'admin' can UPDATE profiles.role.
```

---

## 7. Tech Stack Suggestion

### Recommended Stack (Option A — Modern Full-Stack)

| Layer | Technology | Why use it |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | React-based, handles both frontend and backend in one project. File-based routing. SSR for fast page loads. |
| **Styling** | Tailwind CSS v4 | Write styles as short class names directly in HTML. No separate CSS files. Very beginner-friendly. |
| **UI components** | shadcn/ui | Pre-built beautiful components (buttons, modals, forms, tables). Copy-paste into your project. |
| **State / data fetching** | TanStack Query | Automatically handles loading states, caching, and re-fetching. You write less code for API calls. |
| **Backend / API** | Next.js API Routes | Write backend route handlers inside your Next.js project. No separate Express server needed. |
| **Validation** | Zod | Define the shape of data coming into your API. Automatically rejects invalid inputs and prevents bad data from hitting the database. |
| **Database** | Supabase (PostgreSQL) | Hosted PostgreSQL database, free tier, includes Auth, Realtime, Storage, and Edge Functions. No server setup needed. |
| **ORM** | Drizzle ORM | Type-safe SQL queries. Catches database errors at compile time, not at runtime. |
| **Auth** | Supabase Auth | Email/password signup, password reset, JWT tokens. All handled for you. |
| **Payments** | Razorpay | INR-friendly payment gateway. Easy to set up for Indian developers. Test mode available. |
| **Email** | Resend | Send transactional emails (booking confirmations, reminders). Free for 3,000 emails/month. |
| **Hosting** | Vercel | Free hosting for Next.js. Deploys automatically when you push code to GitHub. Zero configuration. |

### Total Cost to Run (College Project Scale)
- Supabase: **₹0/month** (free tier covers 50,000 monthly active users)
- Vercel: **₹0/month** (free tier covers most personal/college projects)
- Razorpay: **0%** commission in test mode, ~2% in production
- Resend: **₹0/month** (free for 3,000 emails/month)

### Simpler Alternative (Option B — If Next.js feels overwhelming)

| Layer | Technology |
|---|---|
| **Frontend** | Vite + React |
| **Styling** | Tailwind CSS |
| **Backend** | Express.js (structured into separate route files) |
| **Database** | Supabase (same as above) |

---

## 8. Scalability & Future Improvements

### Version Roadmap

#### v1 — College Project (Build this first)
- Basic email/password authentication
- Create and list events with all 7 categories
- Book tickets with Razorpay
- 4 role-specific dashboards
- Write and display reviews + star ratings
- QR code generation and check-in scanning

#### v2 — Polish + More Features (After v1 works)
- Google / social login (via Supabase Auth providers)
- Real-time notifications (via Supabase Realtime)
- Artist invite system (Organizer sends invite → Artist accepts)
- Event analytics charts (ticket sales over time, revenue breakdown)
- Full mobile PWA support
- Multi-language support (Hindi, Urdu, English)

#### v3 — Scale Up (Production-ready)
- AI-powered event recommendations ("based on your interests...")
- Live streaming integration for virtual events
- Mobile app using React Native
- Automated refund processing
- Waitlist system for sold-out events
- Dynamic pricing (prices increase as seats fill up)

### Technical Scaling Guide

| Problem you'll hit | Simple solution |
|---|---|
| Too many API requests slowing the server | Add Redis caching — save popular events in memory so the DB isn't queried every time |
| Images loading slowly | Use Supabase Storage with a CDN — images are served from servers near the user |
| Complex database queries getting slow | Add indexes on `events.status`, `bookings.attendee_id`, `events.organizer_id` |
| One file of backend code getting unmanageable | Split into modules (one file per feature: events, bookings, payments, etc.) |
| Team grows and code becomes confusing | Add TypeScript everywhere + write unit tests with Vitest |
| Payments module getting complex | Separate it into its own microservice |

### Database Improvements for v2

```sql
-- Add these tables in v2 (currently missing from the schema)

CREATE TABLE event_artists (
  event_id    uuid REFERENCES events(id),
  artist_id   uuid REFERENCES profiles(user_id),
  status      text DEFAULT 'invited',  -- invited / accepted / declined
  role        text,                    -- performer, host, MC
  fee         numeric
);

CREATE TABLE notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES profiles(user_id),
  type        text,    -- booking_confirmed, event_reminder, review_reply
  title       text,
  body        text,
  is_read     boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE user_favorites (
  user_id   uuid REFERENCES profiles(user_id),
  event_id  uuid REFERENCES events(id),
  PRIMARY KEY (user_id, event_id)
);
```

---

## 9. Quick Reference Summary

| Topic | Key Decision |
|---|---|
| **Architecture** | Next.js (frontend + backend in one project) + Supabase (DB + Auth) |
| **Auth** | Supabase Auth, JWT tokens, role stored in `profiles` table |
| **Roles** | 4 types: Admin > Organizer > Artist > Attendee |
| **Database** | 6 tables: profiles, events, bookings, payments, reviews, sponsors |
| **API style** | REST — each module (events, bookings, etc.) is a separate route file |
| **Validation** | Zod schemas on every API route |
| **Payments** | Razorpay (INR-friendly, easy test mode) |
| **Emails** | Resend (free for 3,000 emails/month) |
| **Hosting** | Vercel (free, auto-deploys from GitHub push) |
| **Timeline** | 16 weeks — Planning, Design, 4 Dev Sprints, Testing, Deployment |
| **Total cost** | ₹0/month for college-scale usage |

### Final Advice

> Build v1 first. Get all 4 dashboards working with real data, then add polish in v2.
>
> The most important thing is to **ship a working product**, even if it's simple. A working basic Mehfil in week 12 is infinitely better than a half-built ambitious one in week 16.
>
> Every feature you add after the core works is a bonus — not a requirement.

---

*Document generated: March 2026*
*Based on the Mehfil Event System codebase and blueprint*
