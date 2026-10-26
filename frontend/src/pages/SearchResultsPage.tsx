import React, { useEffect, useState } from 'react';
import { 
  ArrowLeftRight, 
  Search, 
  Sparkles, 
  AlertCircle, 
  Filter, 
  Calendar, 
  Users, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw,
  HelpCircle,
  Clock
} from 'lucide-react';
import { useSearchStore } from '../store/useSearchStore';
import { useAiStore } from '../store/useAiStore';
import { FilterSidebar } from '../components/filters/FilterSidebar';
import { FilterChipBar } from '../components/filters/FilterChipBar';
import { JourneyCard } from '../components/journey-cards/JourneyCard';
import { CompareDrawer } from '../components/journey-cards/CompareDrawer';
import { ModeSelector } from '../components/search/ModeSelector';

export const SearchResultsPage: React.FC = () => {
  const {
    origin,
    destination,
    date,
    passengers,
    results,
    isLoading,
    error,
    executeSearch,
    setOrigin,
    setDestination,
    setDate,
    setPassengers,
    swapLocations,
    resetAllFilters,
  } = useSearchStore();

  const { toggleOpen, sendMessage } = useAiStore();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [isEditingSearch, setIsEditingSearch] = useState(false);

  // Local draft state for modifying search without premature re-fetches
  const [draftOrigin, setDraftOrigin] = useState(origin);
  const [draftDestination, setDraftDestination] = useState(destination);
  const [draftDate, setDraftDate] = useState(date);
  const [draftPassengers, setDraftPassengers] = useState(passengers);

  useEffect(() => {
    setDraftOrigin(origin);
    setDraftDestination(destination);
    setDraftDate(date);
    setDraftPassengers(passengers);
  }, [origin, destination, date, passengers]);

  useEffect(() => {
    if (results.length === 0) {
      executeSearch();
    }
  }, [executeSearch, results.length]);

  const handleApplySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftOrigin.trim() || !draftDestination.trim()) return;
    setOrigin(draftOrigin.trim());
    setDestination(draftDestination.trim());
    setDate(draftDate);
    setPassengers(draftPassengers);
    setIsEditingSearch(false);
    await executeSearch();
  };

  const handlePromptClick = async (prompt: string) => {
    toggleOpen();
    await sendMessage(prompt);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Search Banner */}
      <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Summary Route Pills */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-sm font-bold text-slate-900">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              <span>{origin}</span>
              <button
                type="button"
                onClick={swapLocations}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5 transition-transform active:rotate-180"
                title="Swap departure and destination"
                aria-label="Swap departure and destination hubs"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
              </button>
              <span>{destination}</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{date}</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{passengers} {passengers === 1 ? 'Traveler' : 'Travelers'}</span>
            </div>

            <button
              type="button"
              onClick={() => setIsEditingSearch(!isEditingSearch)}
              className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 border border-indigo-200/80 px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
              aria-expanded={isEditingSearch}
            >
              <span>{isEditingSearch ? 'Close Edit Form' : 'Modify Search'}</span>
              {isEditingSearch ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            <button
              type="button"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="md:hidden px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer ml-auto"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter Options</span>
            </button>
          </div>

          {/* Mode Selector */}
          <div className="flex items-center gap-3">
            <ModeSelector />
          </div>
        </div>

        {/* Collapsible Search Modification Form */}
        {isEditingSearch && (
          <form 
            onSubmit={handleApplySearch} 
            className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
          >
            <div className="md:col-span-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                From: Departure Hub
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={draftOrigin}
                  onChange={(e) => setDraftOrigin(e.target.value)}
                  placeholder="City, station, or airport (e.g. Bengaluru)"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                To: Destination Hub
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={draftDestination}
                  onChange={(e) => setDraftDestination(e.target.value)}
                  placeholder="City, station, or airport (e.g. Chennai)"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Travel Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={draftDate}
                  onChange={(e) => setDraftDate(e.target.value)}
                  className="w-full pl-9 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Travelers
              </label>
              <input
                type="number"
                min="1"
                max="9"
                value={draftPassengers}
                onChange={(e) => setDraftPassengers(parseInt(e.target.value) || 1)}
                className="w-full py-2 px-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 text-center focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
              />
            </div>

            <div className="md:col-span-1 flex gap-1.5">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 bg-indigo-950 hover:bg-indigo-900 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors flex items-center justify-center gap-1"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Update</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Main Results Layout: Sidebar + Feed */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar Filters */}
        <aside aria-label="Filters" className={`md:col-span-3 ${mobileFilterOpen ? 'block' : 'hidden md:block'}`}>
          <div className="sticky top-20 space-y-4">
            <FilterSidebar />

            {/* AI Search Assistant Sidebar Box */}
            <div className="bg-gradient-to-tr from-violet-600 to-indigo-900 rounded-2xl p-4 text-white space-y-3 shadow-xs">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Sparkles className="w-3.5 h-3.5 text-violet-300" />
                <span>Refine Search with AI Concierge</span>
              </div>
              <p className="text-[11px] text-violet-100/90 leading-relaxed">
                Ask questions or apply natural-language travel constraints in plain English. For example:
              </p>

              <div className="space-y-1.5">
                {[
                  `Direct flights arriving before 11:00 AM`,
                  `Cheapest train or bus option under ₹1,200`,
                  `Multimodal route with cab pickup`,
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePromptClick(prompt)}
                    className="w-full text-left p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[11px] text-violet-50 transition-colors cursor-pointer border border-white/10"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={toggleOpen}
                className="w-full py-2 px-3 bg-white text-indigo-950 font-bold text-xs rounded-xl shadow-xs cursor-pointer hover:bg-violet-50 transition-colors"
              >
                Open AI Concierge
              </button>
            </div>
          </div>
        </aside>

        {/* Right Feed of Journeys */}
        <main className="md:col-span-9 space-y-4">
          {/* Results Page Title & Route Summary */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Available Journeys: {origin} to {destination}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Showing {results.length} travel options for {date} • {passengers} {passengers === 1 ? 'Traveler' : 'Travelers'}
                </p>
              </div>
              <div className="text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                Door-to-door transit comparison with real-time transit schedules & fares
              </div>
            </div>
          </div>

          <FilterChipBar />

          {isLoading ? (
            <div className="space-y-4">
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-6 text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto animate-spin">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Searching Coordinated Travel Options...
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Comparing flight schedules, railway timetables, bus operators, metro lines, and cab dispatch estimates between {origin} and {destination}.
                </p>
              </div>

              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-1/4" />
                  <div className="h-8 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <div>
                <h3 className="font-bold text-rose-900 text-sm">Unable to Retrieve Travel Options</h3>
                <p className="text-xs text-rose-600 max-w-md mx-auto mt-1">
                  {error || 'We encountered an issue communicating with the route calculation service. Your search preferences are preserved—please check your connection and retry.'}
                </p>
              </div>
              <div className="flex justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => executeSearch()}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  Try Searching Again
                </button>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="px-4 py-2 bg-white border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold cursor-pointer hover:bg-rose-50 transition-colors"
                >
                  Reset Search Filters
                </button>
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 md:p-12 border border-slate-200 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">No Travel Options Match Your Selected Filters</h3>
                <p className="text-xs text-slate-500 max-w-lg mx-auto mt-1.5 leading-relaxed">
                  We couldn't find any coordinated routes between {origin} and {destination} with your current filters. Try expanding your maximum fare, adjusting duration limits, or enabling additional transport modes.
                </p>
              </div>

              {/* Practical suggestions box */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 max-w-md mx-auto text-left space-y-1.5 text-xs text-slate-600">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Suggestions to find more routes:</span>
                </div>
                <div className="flex items-start gap-1.5 text-[11px]">
                  <span className="text-slate-400">•</span>
                  <span>Increase your maximum fare or clear the duration limit in the sidebar</span>
                </div>
                <div className="flex items-start gap-1.5 text-[11px]">
                  <span className="text-slate-400">•</span>
                  <span>Select "All 6 Modes" in the mode bar to include trains, buses, and flights</span>
                </div>
                <div className="flex items-start gap-1.5 text-[11px]">
                  <span className="text-slate-400">•</span>
                  <span>Expand your departure time window to include all hours</span>
                </div>
                <div className="flex items-start gap-1.5 text-[11px]">
                  <span className="text-slate-400">•</span>
                  <span>Ensure your departure and destination transit hubs are correctly spelled</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="px-4 py-2.5 bg-indigo-950 hover:bg-indigo-900 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
                <button
                  type="button"
                  onClick={() => sendMessage(`Find all available travel options from ${origin} to ${destination}`)}
                  className="px-4 py-2.5 bg-violet-50 hover:bg-violet-100 text-violet-900 border border-violet-200 text-xs font-semibold rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                  <span>Ask AI Concierge for Alternate Routes</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((journey) => (
                <JourneyCard key={journey.id} journey={journey} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Side-by-side Compare Dock */}
      <CompareDrawer />
    </div>
  );
};
