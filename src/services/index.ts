// Main API service aggregator - Import this file to access all backend services
export * from "./types";
export { RideService } from "./rideService";
export { DriverService } from "./driverService";
export { PaymentService } from "./paymentService";

/**
 * Centralized Backend API Services
 * 
 * This is the main entry point for all backend operations.
 * Import services from here to interact with the backend:
 * 
 * @example
 * import { RideService, DriverService, PaymentService } from '@/services';
 * 
 * // Create a ride
 * const ride = await RideService.createRide({...});
 * 
 * // Match a driver
 * const match = await RideService.matchDriver({ ride_id: ride.id });
 * 
 * // Get nearby drivers
 * const drivers = await DriverService.getNearbyDrivers({...});
 * 
 * // Process payment
 * const payment = await PaymentService.processPayment({...});
 */
