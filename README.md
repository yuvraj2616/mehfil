# Mehfil

A high-energy, high-contrast cultural event management platform. Redesigned with a **True Black & Hot Pink** aesthetic, Mehfil allows attendees to discover shows and book tickets, while offering organizers a slick "Terminal" to deploy events, manage ticket configurations, and track telemetry.

![Mehfil Showcase](https://via.placeholder.com/800x400/0A0D15/FF007A?text=Mehfil+Platform)

## Features

- **Dark Mode Terminal Aesthetic**: Full "Music Festival" theme with heavy typography, neon highlights, and custom components perfectly suited for high-impact cultural events.
- **Role-based Dashboards**:
  - **Attendee Panel**: Track acquired bookings, upcoming deployments, and leave event reviews.
  - **Organizer Terminal**: Deploy a multi-step event wizard, track ticket revenue, view metrics, and scan attendees via the manual input Check-in portal.
  - **Master Admin Interface**: Oversee the entire system with super admin privileges.
- **Robust Event Booking Flow**: Simulated Razorpay connection, automated ticket-tier availability checks, and a neon-infused ticket success stub.
- **Profile & Auth System**: Role-switching capabilities built completely on Supabase Auth.

## Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **UI & Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend & Database**: [Supabase](https://supabase.com/) (Auth, PostgreSQL, Storage)
- **Deployment & Hosting**: [Vercel](https://vercel.com) (Recommended)

## Getting Started

### 1. Prerequisites
- Node.js (v18+)
- A Supabase Project (Database, Auth, Storage configured)

### 2. Environment Variables
Create a `.env.local` file in the root directory and add the following:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Payment Gateway (Optional/Simulated)
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 3. Database Setup
Run the SQL migration scripts located in `supabase/` to create the required tables (`profiles`, `events`, `bookings`, `payments`, `reviews`). Once the tables are initialized, you can use the `supabase/seed_expanded.sql` script to load test data.

### 4. Installation
Install the project dependencies and launch the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Development Workflows

- To test the Organizer flow, log into an account and modify its role in the `profiles` table to `organizer`, or simply choose "Organizer" upon initial registration.
- The `src/app/events/create` page utilizes a heavily customized multi-step wizard.
- Simulated Check-ins can be tested at `/dashboard/organizer/check-in` using booking IDs (e.g., `BKG-123456`).

## License

This project is licensed under the MIT License.
