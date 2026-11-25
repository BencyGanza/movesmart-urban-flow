# MoveSmart

Moto, taxi and bus rides across Kigali. Riders see the fare in RWF before they book, get the nearest
available driver, pay with MTN MoMo, Airtel Money or cash, share their trip and report safety problems.

This is a standalone React + TypeScript project (Vite, Tailwind CSS, shadcn/ui) with a Supabase backend.
It does not depend on Lovable.

## Run it on your computer

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install
npm run dev
```

The app opens at http://localhost:8080.

Demo login: `demo@movesmart.rw` / `MoveSmart@2026` (or click **Use demo account** on the sign-in page).

Other commands:

| Command           | What it does                                  |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Start the app locally with live reload        |
| `npm run build`   | Build the production site into `dist/`        |
| `npm run preview` | Serve the built site locally to check it      |
| `npm run lint`    | Check the code for common problems            |

## Backend (Supabase)

The `.env` file points to the existing MoveSmart Supabase database, so the app works straight away.

To use your own Supabase project instead:

1. Create a project at https://supabase.com.
2. In the SQL editor, run the files in `supabase/migrations/` in date order, then `supabase/seed.sql`
   (this adds the Kigali routes, vehicles and sample Community Eyes reports).
3. Create the demo user (see the note at the end of `supabase/seed.sql`).
4. Copy `.env.example` to `.env` and fill in your project's URL and anon key.
5. Optional, for the map: add a Mapbox public token as the `MAPBOX_PUBLIC_TOKEN` secret and deploy the
   `get-mapbox-token` function (`supabase functions deploy get-mapbox-token`). Without it, place search
   still works from the built-in list of Kigali places.

## Features

- **Homepage** with a live fare check: pick a destination and compare moto, taxi and bus prices.
- **Journey planner** (`/planner`, no account needed): fastest, safest and balanced routes with traffic, rain
  and hazards; trip briefing with the best time to leave and a preparation checklist; animated journey preview;
  2D map with layers and an illustrative 3D view; conditions; essential services and emergency numbers;
  What-If simulator; **Community Eyes** road reports shared through the database; "Book this trip" hands the
  route to booking. Traffic, weather and hazards are sample data on a schematic map.
- **Sign up / sign in**, including a one-click demo account.
- **Book a ride**: Kigali place search (built-in places plus Mapbox limited to Rwanda), "use my location",
  distance, time and RWF fare per vehicle type, nearest-vehicle matching.
- **Current trip**: vehicle and plate, "I've arrived", share trip via WhatsApp, safety report, cancel with confirmation.
- **After the trip**: pay with MTN MoMo / Airtel Money (simulated) or cash, rate 1–5 stars, report an issue.
- **Trip history** with payment and rating status.
- **Live location map** (Mapbox).
- **Help centre** with FAQ and a built-in assistant.
- **Smart traffic proposal** (`/smart-traffic`) and **operator control centre** (`/traffic-control`), both
  using clearly labelled simulated data.

## Project structure

```
src/
  pages/          Index (home), Auth, Dashboard, Planner, Help, About, SmartTraffic, TrafficControl
  features/planner/  Journey planner engine, styles and Community Eyes API
  components/     Header, Footer, PlaceSearch, RideDialogs, maps, home/FareTicket, ui/ (shadcn)
  services/       rideService (booking, payments, ratings, sharing, reports)
  lib/kigali.ts   Kigali places, distance and fare rules
  integrations/   Supabase client and database types
supabase/
  migrations/     Database schema
  seed.sql        Kigali demo routes and vehicles
  functions/      Optional edge functions
```

## Fare rules

Defined in `src/lib/kigali.ts`: base fare + price per km (road distance ≈ 1.3 × straight line), rounded to
RWF 50, with a minimum fare.

| Vehicle | Base   | Per km | Minimum |
| ------- | ------ | ------ | ------- |
| Moto    | 300    | 250    | 500     |
| Taxi    | 1,000  | 600    | 1,500   |
| Bus     | 200    | 25     | 250     |

## Notes for a real launch

- Mobile money is simulated. Connect the MTN MoMo and Airtel Money APIs before taking real payments.
- The demo account's credentials are public; remove it or change its password after presenting.
