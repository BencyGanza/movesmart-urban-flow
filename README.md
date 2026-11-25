# MoveSmart

Moto, taxi and bus rides across Rwanda. Riders see the fare in RWF before they book, get the nearest
available driver, pay with MTN MoMo, Airtel Money or cash, share their trip and report safety problems.

This is a standalone React + TypeScript project (Vite, Tailwind CSS, shadcn/ui) with a Supabase backend.
It does not depend on Lovable.

## Run it in VS Code

1. Install [Node.js](https://nodejs.org) (the LTS version) and [VS Code](https://code.visualstudio.com).
2. Unzip the project, then in VS Code choose **File → Open Folder…** and pick the `MoveSmart` folder.
   Accept the prompt to install the recommended extensions (ESLint, Tailwind CSS IntelliSense, Prettier).
3. Open the terminal (**Terminal → New Terminal**, or <kbd>Ctrl</kbd>+<kbd>`</kbd>) and run:

   ```bash
   npm install
   npm run dev
   ```

4. Open http://localhost:8080 in your browser (<kbd>Ctrl</kbd>+click the link in the terminal).

Or press <kbd>F5</kbd> and choose **Run MoveSmart in Chrome** (or Edge): VS Code starts the dev server and opens the
app with the debugger attached, so breakpoints in `src/` work.

Demo login: `demo@movesmart.rw` / `MoveSmart@2026` (or click **Use demo account** on the sign-in page).

| Command             | What it does                                  |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Start the app locally with live reload        |
| `npm run build`     | Build the production site into `dist/`        |
| `npm run preview`   | Serve the built site locally to check it      |
| `npm run typecheck` | Check the TypeScript types                    |
| `npm run lint`      | Check the code for common problems            |

The same commands are available in VS Code under **Terminal → Run Task…**.

If port 8080 is busy, close the other program using it or change `port` in `vite.config.ts` (and the URL in
`.vscode/launch.json`).

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

- **3D map of Rwanda** (`/map`): real terrain from AWS Terrain Tiles, OpenStreetMap streets and 3D buildings
  (OpenFreeMap), optional satellite imagery (Esri), towns in every province, bus routes, vehicles and hospitals.
  No API key needed. The journey planner's 3D view uses the same map.
- **Homepage** with a live fare check: pick a destination and compare moto, taxi and bus prices.
- **Journey planner** (`/planner`, no account needed): fastest, safest and balanced routes with traffic, rain
  and hazards; trip briefing with the best time to leave and a preparation checklist; animated journey preview;
  2D map with layers and an illustrative 3D view; conditions; essential services and emergency numbers;
  What-If simulator; **Community Eyes** road reports shared through the database; "Book this trip" hands the
  route to booking. Traffic, weather and hazards are sample data on a schematic map.
- **Sign up / sign in**, including a one-click demo account.
- **Book a ride** anywhere in Rwanda: Kigali landmarks and towns in all five provinces (plus Mapbox search limited
  to Rwanda), "use my location", intercity fares and travel times,
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
