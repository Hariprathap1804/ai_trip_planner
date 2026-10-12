import { TransportMode } from './journey';

export type SortOption = 'recommended' | 'cheapest' | 'fastest' | 'earliest_arrival';

export interface SearchFilters {
  min_budget?: number;
  max_budget?: number;
  max_duration_minutes?: number;
  time_of_day?: ('early_morning' | 'morning' | 'afternoon' | 'evening' | 'night')[];
  max_transfers?: number;
  flight_airlines?: string[];
  flight_direct_only?: boolean;
  train_classes?: string[];
  bus_operators?: string[];
  bus_ac_only?: boolean;
}

export interface SearchQuery {
  origin: string;
  destination: string;
  date: string;
  return_date?: string;
  passengers: number;
  modes: TransportMode[];
  filters: SearchFilters;
  sort_by: SortOption;
}
