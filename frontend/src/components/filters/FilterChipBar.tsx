import React from 'react';
import { X, SlidersHorizontal, Trash2 } from 'lucide-react';
import { useSearchStore } from '../../store/useSearchStore';

const TIME_SLOT_LABELS: Record<string, string> = {
  early_morning: 'Early Morning (4–8 AM)',
  morning: 'Morning (8–12 PM)',
  afternoon: 'Afternoon (12–5 PM)',
  evening: 'Evening & Night (5 PM+)',
  night: 'Night',
};

export const FilterChipBar: React.FC = () => {
  const { filters, setFilters, clearFilter, resetAllFilters, results, sortBy, setSortBy } = useSearchStore();

  const activeChips: { key: string; label: string; onRemove: () => void }[] = [];

  if (filters.max_budget) {
    activeChips.push({
      key: 'max_budget',
      label: `Max fare: ₹${filters.max_budget.toLocaleString()}`,
      onRemove: () => clearFilter('max_budget'),
    });
  }

  if (filters.max_duration_minutes) {
    const hours = Math.floor(filters.max_duration_minutes / 60);
    const mins = filters.max_duration_minutes % 60;
    activeChips.push({
      key: 'max_duration',
      label: `Max duration: ${hours > 0 ? `${hours}h ` : ''}${mins > 0 ? `${mins}m` : ''}`.trim(),
      onRemove: () => clearFilter('max_duration_minutes'),
    });
  }

  if (filters.flight_direct_only) {
    activeChips.push({
      key: 'flight_direct',
      label: 'Direct flights only',
      onRemove: () => clearFilter('flight_direct_only'),
    });
  }

  if (filters.bus_ac_only) {
    activeChips.push({
      key: 'bus_ac',
      label: 'AC buses only',
      onRemove: () => clearFilter('bus_ac_only'),
    });
  }

  if (filters.time_of_day && filters.time_of_day.length > 0) {
    filters.time_of_day.forEach((slot) => {
      const slotName = TIME_SLOT_LABELS[slot] || slot.replace('_', ' ');
      activeChips.push({
        key: `time_${slot}`,
        label: `Departure: ${slotName}`,
        onRemove: () => {
          const next = filters.time_of_day?.filter((s) => s !== slot);
          if (!next || next.length === 0) {
            clearFilter('time_of_day');
          } else {
            setFilters({ time_of_day: next });
          }
        },
      });
    });
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-slate-200/80 mb-6">
      {/* Active chips and count */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-bold text-slate-900">
          Showing {results.length} {results.length === 1 ? 'available journey' : 'available journeys'}
        </span>

        {activeChips.length > 0 && (
          <>
            <span className="text-slate-300">|</span>
            {activeChips.map((chip) => (
              <span
                key={chip.key}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-900 border border-indigo-200/80 shadow-2xs"
              >
                <span>{chip.label}</span>
                <button
                  type="button"
                  onClick={chip.onRemove}
                  className="hover:text-rose-600 rounded-full p-0.5 cursor-pointer transition-colors"
                  aria-label={`Remove filter ${chip.label}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={resetAllFilters}
              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1 cursor-pointer ml-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear all filters</span>
            </button>
          </>
        )}
      </div>

      {/* Sorting Tabs */}
      <div 
        role="group" 
        aria-label="Sort journey results"
        className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto"
      >
        <span className="text-slate-500 px-2 flex items-center gap-1 text-[11px]">
          <SlidersHorizontal className="w-3 h-3" />
          Sort by:
        </span>
        <button
          type="button"
          onClick={() => setSortBy('recommended')}
          title="Best overall balance of travel time, fare, and transfer convenience"
          className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
            sortBy === 'recommended' ? 'bg-white text-indigo-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Recommended
        </button>
        <button
          type="button"
          onClick={() => setSortBy('cheapest')}
          title="Lowest total fare first"
          className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
            sortBy === 'cheapest' ? 'bg-white text-indigo-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Cheapest
        </button>
        <button
          type="button"
          onClick={() => setSortBy('fastest')}
          title="Shortest total travel duration first"
          className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
            sortBy === 'fastest' ? 'bg-white text-indigo-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Fastest
        </button>
        <button
          type="button"
          onClick={() => setSortBy('earliest_arrival')}
          title="Arrive at destination earliest in the day"
          className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
            sortBy === 'earliest_arrival' ? 'bg-white text-indigo-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Earliest Arrival
        </button>
      </div>
    </div>
  );
};
