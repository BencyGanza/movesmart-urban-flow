/**
 * ============================================
 * MOVESMART - MAIN SOURCE CODE ENTRY POINT
 * ============================================
 * 
 * This is the central hub for the MoveSmart ride-hailing application.
 * All backend services, frontend components, and application logic are 
 * orchestrated from this file.
 * 
 * ARCHITECTURE OVERVIEW:
 * ----------------------
 * 
 * 1. BACKEND SERVICES (src/services/)
 *    - RideService: Handle ride creation, matching, status updates, cancellations
 *    - DriverService: Manage driver locations, nearby driver search
 *    - PaymentService: Process payments, retrieve payment history
 * 
 * 2. EDGE FUNCTIONS (supabase/functions/)
 *    - match-driver: Assign available drivers to rides
 *    - update-ride-status: Update ride status and create payments
 *    - process-payment: Handle mobile money payments (MTN MoMo, Airtel Money)
 *    - update-driver-location: Track real-time driver locations
 *    - get-nearby-drivers: Find drivers within specified radius
 * 
 * 3. FRONTEND PAGES
 *    - Index: Landing page with hero, features, how-it-works sections
 *    - Auth: Sign in/Sign up with email and password
 *    - Dashboard: Main user interface for booking rides and viewing history
 * 
 * 4. DATABASE TABLES
 *    - profiles: User profile information
 *    - vehicles: Driver vehicles and locations
 *    - rides: Ride bookings and status
 *    - payments: Payment records and transactions
 *    - routes: Predefined routes with fares
 *    - ratings: User ratings for drivers
 *    - safety_reports: Safety incident reporting
 *    - shared_trips: Trip sharing functionality
 * 
 * USAGE:
 * ------
 * Import services from the main entry point:
 * 
 * import { RideService, DriverService, PaymentService } from '@/services';
 * 
 * // Book a ride
 * const ride = await RideService.createRide({
 *   pickup_address: "Kigali City Centre",
 *   dropoff_address: "Kimironko",
 *   pickup_latitude: -1.9441,
 *   pickup_longitude: 30.0619,
 *   dropoff_latitude: -1.9496,
 *   dropoff_longitude: 30.1260,
 *   estimated_fare: 500
 * });
 * 
 * // Match a driver
 * const match = await RideService.matchDriver({ ride_id: ride.id });
 * 
 * // Get nearby drivers
 * const drivers = await DriverService.getNearbyDrivers({
 *   latitude: -1.9441,
 *   longitude: 30.0619,
 *   radius_km: 5
 * });
 * 
 * // Process payment
 * const payment = await PaymentService.processPayment({
 *   payment_id: "payment-uuid",
 *   phone_number: "+250788123456",
 *   payment_method: "mobile_money"
 * });
 * 
 * COMPILATION:
 * -----------
 * The application is built using Vite and React. To compile:
 * 
 * 1. Development: npm run dev
 * 2. Production Build: npm run build
 * 3. Preview: npm run preview
 * 
 * All services are automatically bundled and optimized during the build process.
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Export all services for easy access
export * from "./services";

// Query client configuration for efficient data fetching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Main Application Component
 * 
 * Provides:
 * - React Query for data fetching and caching
 * - Toast notifications (both regular and sonner)
 * - Tooltip provider for UI tooltips
 * - Routing with protected routes
 */
const MainCode = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Protected Routes - Require Authentication */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* 404 Catch-all Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default MainCode;

/**
 * ============================================
 * BACKEND SERVICE DOCUMENTATION
 * ============================================
 * 
 * RIDE SERVICE METHODS:
 * ---------------------
 * - createRide(request: RideRequest): Promise<Ride>
 *   Creates a new ride booking
 * 
 * - matchDriver(request: MatchDriverRequest): Promise<MatchDriverResponse>
 *   Assigns an available driver to a ride
 * 
 * - updateRideStatus(request: UpdateRideStatusRequest): Promise<UpdateRideStatusResponse>
 *   Updates ride status (pending, active, completed, cancelled)
 * 
 * - getUserRides(userId: string): Promise<Ride[]>
 *   Fetches all rides for a specific user
 * 
 * - getRideById(rideId: string): Promise<Ride>
 *   Retrieves a single ride by ID
 * 
 * - cancelRide(rideId: string): Promise<Ride>
 *   Cancels a pending ride
 * 
 * DRIVER SERVICE METHODS:
 * -----------------------
 * - getNearbyDrivers(request: GetNearbyDriversRequest): Promise<GetNearbyDriversResponse>
 *   Finds active drivers within specified radius
 * 
 * - updateDriverLocation(request: UpdateDriverLocationRequest): Promise<UpdateDriverLocationResponse>
 *   Updates driver's real-time location
 * 
 * - getActiveDrivers(): Promise<Vehicle[]>
 *   Retrieves all currently active drivers
 * 
 * - getDriverProfile(driverId: string): Promise<Profile>
 *   Gets detailed driver profile information
 * 
 * PAYMENT SERVICE METHODS:
 * ------------------------
 * - processPayment(request: ProcessPaymentRequest): Promise<ProcessPaymentResponse>
 *   Processes mobile money payments
 * 
 * - getPaymentByRideId(rideId: string): Promise<Payment>
 *   Retrieves payment information for a specific ride
 * 
 * - getUserPayments(userId: string): Promise<Payment[]>
 *   Gets payment history for a user
 * 
 * - getPaymentById(paymentId: string): Promise<Payment>
 *   Fetches a single payment by ID
 * 
 * ============================================
 * ERROR HANDLING
 * ============================================
 * 
 * All services throw errors that should be caught and handled:
 * 
 * try {
 *   const ride = await RideService.createRide(data);
 * } catch (error) {
 *   console.error('Error creating ride:', error);
 *   // Handle error appropriately
 * }
 * 
 * ============================================
 * AUTHENTICATION
 * ============================================
 * 
 * The application uses Supabase Auth with:
 * - Email/Password authentication
 * - Auto-confirm email (enabled for development)
 * - Protected routes requiring authentication
 * - Session persistence in localStorage
 * 
 * ============================================
 * REAL-TIME FEATURES
 * ============================================
 * 
 * - Real-time ride updates via useRides hook
 * - Live driver location tracking
 * - Instant status change notifications
 * - WebSocket-based updates using Supabase Realtime
 */
