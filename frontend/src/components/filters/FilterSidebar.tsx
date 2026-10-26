import React from 'react';
import { 
  Filter, 
  RotateCcw, 
  Clock, 
  IndianRupee, 
  Hourglass, 
  Plane, 
  Bus, 
  Train, 
  Car, 
  Navigation,
  Info,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { useSearchStore } from '../../store/useSearchStore';

export const FilterSidebar: React.FC = () => {
  const { filters, setFilters, resetAllFilters, selectedModes } = useSearchStore();

  const handleBudgetPreset = (maxBudget: number | undefined) => {
    setFilters({ max_budget: maxBudget });
  };

  const handleDurationPreset = (maxMinutes: number | undefined) => {
    setFilters({ max_duration_minutes: maxMinutes });
  };

  const hasFlights = selectedModes.includes('flight');
  const hasTrains = selectedModes.includes('train');
  const hasMetro = selectedModes.includes('metro');
  const hasBuses = selectedModes.includes('bus');
  const hasCabs = selectedModes.includes('cab');
  const hasAutos = selectedModes.includes('auto');

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-600" />
          Filter Travel Options
        </h3>
        <button
          type="button"
          onClick={resetAllFilters}
          className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1 cursor-pointer transition-colors"
          title="Reset all filters to defaults"
        >
          <RotateCcw className="w-3 h-3" />
          Reset All
        </button>
      </div>

      {/* Maximum Fare Filter */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
            <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
            Maximum Fare
          </label>
          {filters.max_budget && (
            <span className="text-[11px] font-mono font-bold text-indigo-600">
              ≤ ₹{filters.max_budget.toLocaleString()}
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-400 mb-2.5">
          Total estimated fare per traveler across all connected segments (taxes included)
        </p>
        <div className="grid grid-cols-2 gap-1.5">
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
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                }`}
              >
                Up to ₹{amt.toLocaleString()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Maximum Travel Duration Filter */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
            <Hourglass className="w-3.5 h-3.5 text-slate-400" />
            Max Travel Duration
          </label>
          {filters.max_duration_minutes && (
            <span className="text-[11px] font-mono font-bold text-indigo-600">
              ≤ {Math.floor(filters.max_duration_minutes / 60)}h
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-400 mb-2.5">
          Door-to-door transit time including connection transfer buffers between hubs
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { label: 'Under 2h', minutes: 120 },
            { label: 'Under 4h', minutes: 240 },
            { label: 'Under 8h', minutes: 480 },
            { label: 'Under 12h', minutes: 720 },
          ].map((item) => {
            const active = filters.max_duration_minutes === item.minutes;
            return (
              <button
                key={item.minutes}
                type="button"
                onClick={() => handleDurationPreset(active ? undefined : item.minutes)}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  active
                    ? 'bg-indigo-950 text-white border-indigo-950 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Departure Time Window */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          Departure Time Window
        </label>
        <p className="text-[11px] text-slate-400 mb-2.5">
          Filter journeys by the scheduled departure time of your first segment
        </p>
        <div className="space-y-2 text-xs">
          <label className="flex items-center gap-2 text-slate-700 cursor-pointer hover:text-slate-900 transition-colors">
            <input
              type="checkbox"
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              checked={filters.time_of_day?.includes('early_morning') || false}
              onChange={(e) => {
                const current = filters.time_of_day || [];
                const updated = e.target.checked
                  ? [...current, 'early_morning']
                  : current.filter((t) => t !== 'early_morning');
                setFilters({ time_of_day: updated as any });
              }}
            />
            <span>Early Morning (4:00 AM – 8:00 AM)</span>
          </label>
          <label className="flex items-center gap-2 text-slate-700 cursor-pointer hover:text-slate-900 transition-colors">
            <input
              type="checkbox"
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              checked={filters.time_of_day?.includes('morning') || false}
              onChange={(e) => {
                const current = filters.time_of_day || [];
                const updated = e.target.checked
                  ? [...current, 'morning']
                  : current.filter((t) => t !== 'morning');
                setFilters({ time_of_day: updated as any });
              }}
            />
            <span>Morning (8:00 AM – 12:00 PM)</span>
          </label>
          <label className="flex items-center gap-2 text-slate-700 cursor-pointer hover:text-slate-900 transition-colors">
            <input
              type="checkbox"
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              checked={filters.time_of_day?.includes('afternoon') || false}
              onChange={(e) => {
                const current = filters.time_of_day || [];
                const updated = e.target.checked
                  ? [...current, 'afternoon']
                  : current.filter((t) => t !== 'afternoon');
                setFilters({ time_of_day: updated as any });
              }}
            />
            <span>Afternoon (12:00 PM – 5:00 PM)</span>
          </label>
          <label className="flex items-center gap-2 text-slate-700 cursor-pointer hover:text-slate-900 transition-colors">
            <input
              type="checkbox"
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              checked={filters.time_of_day?.includes('evening') || false}
              onChange={(e) => {
                const current = filters.time_of_day || [];
                const updated = e.target.checked
                  ? [...current, 'evening']
                  : current.filter((t) => t !== 'evening');
                setFilters({ time_of_day: updated as any });
              }}
            />
            <span>Evening & Night (5:00 PM onward)</span>
          </label>
        </div>
      </div>

      {/* Mode-Specific Filters & Comfort Preferences */}
      <div className="space-y-4 pt-3 border-t border-slate-100">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Transportation Preferences
        </div>

        {/* Flights */}
        {hasFlights && (
          <div className="bg-slate-50/70 rounded-xl p-3 border border-slate-200/60 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Plane className="w-3.5 h-3.5 text-blue-500" />
              <span>Flight Preferences</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Filter airline layovers and flight connections
            </p>
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:text-slate-900 transition-colors pt-1">
              <input
                type="checkbox"
                checked={filters.flight_direct_only || false}
                onChange={(e) => setFilters({ flight_direct_only: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span className="font-medium">Direct Flights Only (Non-stop)</span>
            </label>
            <div className="text-[10px] text-slate-400 pt-0.5">
              Airport arrival: Plan to arrive 2 hours before scheduled departure.
            </div>
          </div>
        )}

        {/* Trains */}
        {hasTrains && (
          <div className="bg-slate-50/70 rounded-xl p-3 border border-slate-200/60 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Train className="w-3.5 h-3.5 text-emerald-600" />
              <span>Train Classes & Services</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Indian Railways express, Shatabdi, and Vande Bharat routes
            </p>
            <div className="text-[10px] text-slate-500 leading-relaxed pt-0.5">
              Intermediate stops are scheduled halts along the same train line; no coach change required.
            </div>
          </div>
        )}

        {/* Buses */}
        {hasBuses && (
          <div className="bg-slate-50/70 rounded-xl p-3 border border-slate-200/60 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Bus className="w-3.5 h-3.5 text-amber-500" />
              <span>Bus Comfort & Class</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Intercity, state express, and private sleeper coaches
            </p>
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:text-slate-900 transition-colors pt-1">
              <input
                type="checkbox"
                checked={filters.bus_ac_only || false}
                onChange={(e) => setFilters({ bus_ac_only: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span className="font-medium">Air-Conditioned (AC) Buses Only</span>
            </label>
            <div className="text-[10px] text-slate-400 pt-0.5">
              Includes AC sleeper and multi-axle luxury seating coaches.
            </div>
          </div>
        )}

        {/* Metro Rapid Transit */}
        {hasMetro && (
          <div className="bg-slate-50/70 rounded-xl p-3 border border-slate-200/60 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Train className="w-3.5 h-3.5 text-purple-600" />
              <span>Metro Rapid Transit</span>
            </div>
            <p className="text-[11px] text-slate-500">
              High-frequency urban network (departures every 4–8 minutes)
            </p>
            <div className="text-[10px] text-slate-400 pt-0.5">
              Bypasses road traffic between railway stations, airports, and city hubs.
            </div>
          </div>
        )}

        {/* Cabs & Autos */}
        {(hasCabs || hasAutos) && (
          <div className="bg-slate-50/70 rounded-xl p-3 border border-slate-200/60 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Car className="w-3.5 h-3.5 text-sky-600" />
              <span>Cab & Auto Dispatch</span>
            </div>
            <p className="text-[11px] text-slate-500">
              First-mile and last-mile door-to-hub connections
            </p>
            <div className="text-[10px] text-slate-500 leading-relaxed pt-0.5">
              Pickup wait estimates range from 5 to 15 minutes. Fares include estimated tolls and driver allowances.
            </div>
          </div>
        )}
      </div>

      {/* Terminology & Timing Advisory */}
      <div className="pt-3 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
        <div className="flex items-start gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-700 block">Stops vs. Transfers:</span>
            <span>A <em>stop</em> is an intermediate halt where you stay on board. A <em>transfer</em> requires changing vehicles with a connection buffer.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
