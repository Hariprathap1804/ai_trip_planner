export type TransportMode = 'flight' | 'train' | 'metro' | 'bus' | 'auto' | 'cab' | 'multimodal';

export interface LocationHub {
  id: string;
  name: string;
  city: string;
  code?: string;
  type: 'airport' | 'railway_station' | 'metro_station' | 'bus_terminal' | 'landmark' | 'address';
  coordinates?: { lat: number; lng: number };
}

export interface Amenity {
  id: string;
  label: string;
  icon_name: string;
}

export interface JourneyLeg {
  id: string;
  mode: TransportMode;
  operator: string;
  service_number?: string;
  origin: LocationHub;
  destination: LocationHub;
  departure_time: string;
  arrival_time: string;
  duration_minutes: number;
  fare: number;
  class_or_category: string;
  stops_count: number;
  stop_details?: string[];
  amenities?: Amenity[];
  baggage_allowance?: string;
  seat_status: string;
  seat_count?: number;
}

export interface Journey {
  id: string;
  is_multimodal: boolean;
  modes: TransportMode[];
  origin: LocationHub;
  destination: LocationHub;
  departure_time: string;
  arrival_time: string;
  total_duration_minutes: number;
  total_fare: number;
  legs: JourneyLeg[];
  transfers_count: number;
  transfer_buffer_minutes: number;
  recommended_score: number;
  ai_recommendation_reason?: string;
  warnings?: string[];
}
