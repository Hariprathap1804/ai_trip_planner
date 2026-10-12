import React from 'react';
import { Filter, RotateCcw, Clock, IndianRupee } from 'lucide-react';
import { useSearchStore } from '../../store/useSearchStore';

export const FilterSidebar: React.FC = () => {
  const { filters, setFilters, resetAllFilters, selectedModes } = useSearchStore();

  const handleBudgetPreset = (maxBudget: number | undefined) => {
    setFilters({ max_budget: maxBudget });
  };

  const hasFlights = selectedModes.includes('flight');
  const hasBuses = selectedModes.includes('bus');

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-600" />
          Filter Journeys
        </h3>
        <button
          type="button"
          onClick={resetAllFilters}
          className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* Maximum Budget */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1">
          <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
          Max Budget
        </label>
        <div className="grid grid-cols-2 gap-1.5 mb-2">
          {[1000, 2500, 5000, 10000].map((amt) => {
            const active = filters.max_budget === amt;
            return (
              <button
                key={amt}
                type="button"
                onClick={() => handleBudgetPreset(active ? undefined : amt)}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  active
                    ? 'bg-indigo-950 text-white border-indigo-950 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                ≤ ₹{amt.toLocaleString()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Departure Window */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          Departure Time
        </label>
        <div className="space-y-1.5 text-xs">
          <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              checked={filters.time_of_day?.includes('early_morning') || false}
              onChange={(e) => {
                const current = filters.time_of_day || [];
                const updated = e.target.checked
                  ? [...current, 'early_morning']
                  : current.filter((t) => t !== 'early_morning');
                setFilters({ time_of_day: updated as any });
              }}
            />
            Early Morning (04:00 - 08:00)
          </label>
          <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              checked={filters.time_of_day?.includes('morning') || false}
              onChange={(e) => {
                const current = filters.time_of_day || [];
                const updated = e.target.checked
                  ? [...current, 'morning']
                  : current.filter((t) => t !== 'morning');
                setFilters({ time_of_day: updated as any });
              }}
            />
            Morning (08:00 - 12:00)
          </label>
          <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              checked={filters.time_of_day?.includes('afternoon') || false}
              onChange={(e) => {
                const current = filters.time_of_day || [];
                const updated = e.target.checked
                  ? [...current, 'afternoon']
                  : current.filter((t) => t !== 'afternoon');
                setFilters({ time_of_day: updated as any });
              }}
            />
            Afternoon (12:00 - 17:00)
          </label>
          <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              checked={filters.time_of_day?.includes('evening') || false}
              onChange={(e) => {
                const current = filters.time_of_day || [];
                const updated = e.target.checked
                  ? [...current, 'evening']
                  : current.filter((t) => t !== 'evening');
                setFilters({ time_of_day: updated as any });
              }}
            />
            Evening & Night (17:00+)
          </label>
        </div>
      </div>

      {/* Mode-specific Filters */}
      {hasFlights && (
        <div className="pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Flight Preferences
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.flight_direct_only || false}
              onChange={(e) => setFilters({ flight_direct_only: e.target.checked })}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Direct Flights Only (No Layovers)
          </label>
        </div>
      )}

      {hasBuses && (
        <div className="pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Bus Preferences
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.bus_ac_only || false}
              onChange={(e) => setFilters({ bus_ac_only: e.target.checked })}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Air Conditioned (AC) Buses Only
          </label>
        </div>
      )}
    </div>
  );
};
