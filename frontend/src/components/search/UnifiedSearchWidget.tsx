import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, Calendar, Users, MapPin, Search, Sparkles } from 'lucide-react';
import { useSearchStore } from '../../store/useSearchStore';
import { useAiStore } from '../../store/useAiStore';
import { ModeSelector } from './ModeSelector';

const POPULAR_CITIES = ['Bengaluru', 'Chennai', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Goa'];

export const UnifiedSearchWidget: React.FC = () => {
  const navigate = useNavigate();
  const {
    origin,
    destination,
    date,
    passengers,
    setOrigin,
    setDestination,
    setDate,
    setPassengers,
    swapLocations,
    executeSearch,
    isLoading,
  } = useSearchStore();

  const { toggleOpen } = useAiStore();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeSearch();
    navigate('/explore');
  };

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-xl border border-slate-200/80">
      {/* Mode selection row */}
      <div className="mb-5 pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <ModeSelector />
        <button
          type="button"
          onClick={toggleOpen}
          className="text-xs font-semibold text-violet-700 hover:text-violet-800 flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-violet-600" />
          <span>Ask AI to Plan Door-to-Door</span>
        </button>
      </div>

      {/* Primary search inputs */}
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Origin */}
          <div className="md:col-span-4 relative">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              From (Origin)
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="City or Station (e.g. Bengaluru)"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                required
              />
            </div>
          </div>

          {/* Swap button */}
          <div className="md:col-span-1 flex justify-center pt-4 md:pt-4">
            <button
              type="button"
              onClick={swapLocations}
              title="Swap origin and destination"
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-600 transition-transform active:rotate-180 cursor-pointer"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* Destination */}
          <div className="md:col-span-4 relative">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              To (Destination)
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="City or Station (e.g. Chennai)"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                required
              />
            </div>
          </div>

          {/* Date */}
          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Travel Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                required
              />
            </div>
          </div>

          {/* Passengers */}
          <div className="md:col-span-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Pax
            </label>
            <div className="relative">
              <Users className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="number"
                min="1"
                max="9"
                value={passengers}
                onChange={(e) => setPassengers(parseInt(e.target.value) || 1)}
                className="w-full pl-8 pr-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-center transition-all"
              />
            </div>
          </div>
        </div>

        {/* Quick popular city pills & primary action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3">
          <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-500">
            <span className="font-medium text-slate-600">Quick destinations:</span>
            {POPULAR_CITIES.slice(0, 5).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setDestination(c)}
                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
              >
                {c}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-gradient-to-r from-indigo-950 via-indigo-900 to-blue-700 hover:from-indigo-900 hover:to-blue-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-950/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
          >
            <Search className="w-4 h-4" />
            <span>{isLoading ? 'Searching...' : 'Find Journeys'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
