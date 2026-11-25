# Backend Services Architecture

This directory contains the centralized backend service layer for the ride-sharing application.

## 🏗️ Architecture Overview

All backend operations are organized into three main service classes:

1. **RideService** - Handles ride creation, matching, and status updates
2. **DriverService** - Manages driver locations and nearby driver searches
3. **PaymentService** - Processes payments and payment history

## 📦 How to Use

### Import the Services

All services are exported from a single entry point:

```typescript
import { RideService, DriverService, PaymentService } from '@/services';
```

### Example Usage

#### 1. Create and Manage Rides

```typescript
// Create a new ride
const ride = await RideService.createRide({
  pickup_location: "123 Main St",
  dropoff_location: "456 Oak Ave",
  pickup_latitude: 0.3476,
  pickup_longitude: 32.5825,
  dropoff_latitude: 0.3500,
  dropoff_longitude: 32.6000,
  estimated_fare: 15000
});

// Match a driver to the ride
const matchResult = await RideService.matchDriver({
  ride_id: ride.id
});

// Update ride status
const statusUpdate = await RideService.updateRideStatus({
  ride_id: ride.id,
  status: 'active'
});

// Get user's rides
const userRides = await RideService.getUserRides(userId);

// Cancel a ride
await RideService.cancelRide(ride.id);
```

#### 2. Work with Drivers

```typescript
// Get nearby drivers
const nearbyDrivers = await DriverService.getNearbyDrivers({
  latitude: 0.3476,
  longitude: 32.5825,
  radius_km: 5
});

// Update driver location
await DriverService.updateDriverLocation({
  vehicle_id: vehicleId,
  latitude: 0.3476,
  longitude: 32.5825
});

// Get all active drivers
const activeDrivers = await DriverService.getActiveDrivers();
```

#### 3. Process Payments

```typescript
// Process a payment
const paymentResult = await PaymentService.processPayment({
  payment_id: paymentId,
  phone_number: "+256700000000",
  payment_method: "mobile_money"
});

// Get payment for a ride
const payment = await PaymentService.getPaymentByRideId(rideId);

// Get user's payment history
const paymentHistory = await PaymentService.getUserPayments(userId);
```

## 🔧 Backend Functions

The following Edge Functions power the backend:

### 1. `match-driver`
- **Purpose**: Matches available drivers to ride requests
- **Location**: `supabase/functions/match-driver/index.ts`
- **Used by**: `RideService.matchDriver()`

### 2. `update-ride-status`
- **Purpose**: Updates ride status and creates payment records
- **Location**: `supabase/functions/update-ride-status/index.ts`
- **Used by**: `RideService.updateRideStatus()`, `RideService.cancelRide()`

### 3. `process-payment`
- **Purpose**: Processes mobile money and other payments
- **Location**: `supabase/functions/process-payment/index.ts`
- **Used by**: `PaymentService.processPayment()`

### 4. `update-driver-location`
- **Purpose**: Updates driver/vehicle GPS coordinates
- **Location**: `supabase/functions/update-driver-location/index.ts`
- **Used by**: `DriverService.updateDriverLocation()`

### 5. `get-nearby-drivers`
- **Purpose**: Finds drivers within specified radius
- **Location**: `supabase/functions/get-nearby-drivers/index.ts`
- **Used by**: `DriverService.getNearbyDrivers()`

## 📁 File Structure

```
src/services/
├── index.ts              # Main entry point - exports all services
├── types.ts              # TypeScript type definitions
├── rideService.ts        # Ride management operations
├── driverService.ts      # Driver management operations
├── paymentService.ts     # Payment processing operations
└── README.md             # This file
```

## 🚀 Compilation

When compiling the application, all services are automatically bundled through the main entry point (`src/services/index.ts`). Simply import from `@/services` anywhere in your application.

## 🔐 Authentication

All Edge Functions require authentication (JWT verification enabled). The Supabase client automatically handles authentication headers for all requests.

## ⚡ Real-time Updates

For real-time functionality, use the `useRides` hook which combines the service layer with Supabase real-time subscriptions:

```typescript
import { useRides } from '@/hooks/useRides';

const { rides, loading, refetch } = useRides();
```

## 🛠️ Error Handling

All service methods throw errors that should be caught and handled:

```typescript
try {
  const ride = await RideService.createRide(rideData);
} catch (error) {
  console.error('Failed to create ride:', error);
  // Handle error appropriately
}
```
