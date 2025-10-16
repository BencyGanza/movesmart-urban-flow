# MoveSmart - Smart Public Transport Solution

A modern, full-stack ride-hailing application built with React, TypeScript, and Supabase.

## 🚀 Main Source Code

The entire application is orchestrated through **`src/MainCode.tsx`** - the central hub that integrates all backend services, frontend components, and application logic.

## 📋 Features

### User Features
- **Ride Booking**: Book rides with pickup and dropoff locations
- **Real-time Tracking**: Live updates on ride status and driver location
- **Driver Matching**: Automatic driver assignment based on proximity
- **Payment Processing**: Integrated mobile money payments (MTN MoMo, Airtel Money)
- **Ride History**: View all past and current rides
- **Ride Cancellation**: Cancel pending rides

### Driver Features
- **Location Updates**: Real-time location tracking
- **Ride Acceptance**: Accept or decline ride requests
- **Earnings Tracking**: Monitor completed rides and earnings

### Admin Features
- **Route Management**: Define and manage service routes
- **Driver Management**: Monitor active drivers and their locations
- **Payment Oversight**: Track all payment transactions

## 🏗️ Architecture

### Backend Services (`src/services/`)
- **RideService**: Ride creation, matching, status updates, cancellations
- **DriverService**: Driver locations, nearby driver search
- **PaymentService**: Payment processing, payment history

### Edge Functions (`supabase/functions/`)
- `match-driver`: Assign available drivers to rides
- `update-ride-status`: Update ride status and create payments
- `process-payment`: Handle mobile money payments
- `update-driver-location`: Track real-time driver locations
- `get-nearby-drivers`: Find drivers within specified radius

### Frontend Pages
- **Landing Page** (`/`): Hero section, features, how-it-works
- **Auth Page** (`/auth`): Sign in and sign up
- **Dashboard** (`/dashboard`): Main interface for booking rides and viewing history

### Database Tables
- `profiles`: User profile information
- `vehicles`: Driver vehicles and locations
- `rides`: Ride bookings and status
- `payments`: Payment records and transactions
- `routes`: Predefined routes with fares
- `ratings`: User ratings for drivers
- `safety_reports`: Safety incident reporting
- `shared_trips`: Trip sharing functionality

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Maps**: React Leaflet
- **State Management**: TanStack Query (React Query)
- **UI Components**: Radix UI, shadcn/ui
- **Build Tool**: Vite

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd movesmart
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
The `.env` file is automatically configured with Supabase credentials.

4. Run the development server:
```bash
npm run dev
```

## 🚀 Compilation & Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📖 Usage Examples

### Import Services
```typescript
import { RideService, DriverService, PaymentService } from '@/services';
```

### Book a Ride
```typescript
const ride = await RideService.createRide({
  pickup_location: "Nairobi CBD",
  dropoff_location: "Westlands",
  pickup_latitude: -1.2921,
  pickup_longitude: 36.8219,
  dropoff_latitude: -1.286389,
  dropoff_longitude: 36.817223,
  estimated_fare: 500
});
```

### Match a Driver
```typescript
const match = await RideService.matchDriver({ 
  ride_id: ride.id 
});
```

### Get Nearby Drivers
```typescript
const drivers = await DriverService.getNearbyDrivers({
  latitude: -1.2921,
  longitude: 36.8219,
  radius_km: 5
});
```

### Process Payment
```typescript
const payment = await PaymentService.processPayment({
  payment_id: "payment-uuid",
  phone_number: "+254712345678",
  payment_method: "mobile_money"
});
```

## 🔐 Authentication

- Email/Password authentication via Supabase Auth
- Auto-confirm email enabled for development
- Protected routes requiring authentication
- Session persistence in localStorage

## 🔄 Real-time Features

- Real-time ride updates
- Live driver location tracking
- Instant status change notifications
- WebSocket-based updates using Supabase Realtime

## 📱 Responsive Design

The application is fully responsive and works seamlessly across:
- Desktop computers
- Tablets
- Mobile devices

## 🎨 Design System

The application uses a comprehensive design system defined in:
- `src/index.css`: Color tokens, gradients, shadows
- `tailwind.config.ts`: Extended Tailwind configuration

All colors use HSL format and semantic tokens for consistent theming.

## 🔧 API Documentation

Detailed API documentation for all services is available in `src/MainCode.tsx`.

## 📄 License

This project is proprietary software. All rights reserved.

## 👥 Support

For support and questions, please contact the development team.

---

**Built with ❤️ using Lovable Cloud**
