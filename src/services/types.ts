// Centralized type definitions for all backend operations

export interface RideRequest {
  pickup_location: string;
  dropoff_location: string;
  pickup_latitude: number;
  pickup_longitude: number;
  dropoff_latitude: number;
  dropoff_longitude: number;
  estimated_fare: number;
}

export interface MatchDriverRequest {
  ride_id: string;
}

export interface MatchDriverResponse {
  success: boolean;
  vehicle: any;
  message: string;
}

export interface UpdateRideStatusRequest {
  ride_id: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  actual_fare?: number;
}

export interface UpdateRideStatusResponse {
  success: boolean;
  ride: any;
  message: string;
}

export interface ProcessPaymentRequest {
  payment_id: string;
  phone_number: string;
  payment_method: 'mobile_money' | 'cash' | 'card';
}

export interface ProcessPaymentResponse {
  success: boolean;
  transaction_id: string;
  message: string;
}

export interface UpdateDriverLocationRequest {
  vehicle_id: string;
  latitude: number;
  longitude: number;
}

export interface UpdateDriverLocationResponse {
  success: boolean;
  vehicle: any;
  message: string;
}

export interface GetNearbyDriversRequest {
  latitude: number;
  longitude: number;
  radius_km?: number;
}

export interface GetNearbyDriversResponse {
  success: boolean;
  drivers: any[];
  count: number;
}
