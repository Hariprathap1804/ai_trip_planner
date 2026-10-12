import React, { useEffect, useState } from 'react';
import { ArrowLeftRight, Search, Sparkles, AlertCircle, Filter } from 'lucide-react';
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
    results,
    isLoading,
    error,
    executeSearch,
    setOrigin,
    setDestination,
    swapLocations,
  } = useSearchStore();

  const { toggleOpen, sendMessage } = useAiStore();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    if (results.length === 0) {
      executeSearch();
    }
  }, [executeSearch, results.length]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Search Banner */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-sm font-bold text-slate-900">
            <span>{origin}</span>
            <button
              type="button"
              onClick={swapLocations}
              className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </button>
            <span>{destination}</span>
          </div>

          <div className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            {date}
          </div>

          <button
            type="button"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5"
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
          </button>
        </div>

        <div className="flex items-center gap-3">
          <ModeSelector />
        </div>
      </div>

      {/* Main Results Layout: Sidebar + Feed */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar Filters */}
        <aside aria-label="Filters" className={`md:col-span-3 ${mobileFilterOpen ? 'block' : 'hidden md:block'}`}>
          <div className="sticky top-20 space-y-4">
            <FilterSidebar />
            <div className="bg-gradient-to-tr from-violet-600 to-indigo-900 rounded-2xl p-4 text-white space-y-2 shadow-xs">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Sparkles className="w-3.5 h-3.5 text-violet-300" />
                <span>Need custom filters?</span>
              </div>
              <p className="text-[11px] text-violet-100/80 leading-relaxed">
                Tell TripPilot AI: <em>"Keep only direct flights arriving before 10 AM"</em> and it will update results immediately.
              </p>
              <button
                type="button"
                onClick={toggleOpen}
                className="w-full py-1.5 px-3 bg-white text-indigo-950 font-bold text-xs rounded-xl shadow-xs cursor-pointer hover:bg-violet-50 transition-colors"
              >
                Chat with Assistant
              </button>
            </div>
          </div>
        </aside>

        {/* Right Feed of Journeys */}
        <main className="md:col-span-9 space-y-4">
          <FilterChipBar />

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-1/4" />
                  <div className="h-8 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <h3 className="font-bold text-rose-900 text-sm">Failed to Load Journeys</h3>
              <p className="text-xs text-rose-600">{error}</p>
              <button
                type="button"
                onClick={() => executeSearch()}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold"
              >
                Retry Search
              </button>
            </div>
          ) : results.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">No Matching Journeys Found</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  We couldn't find any journeys matching your active filters. Try expanding your budget, selecting more modes, or asking the AI Assistant to optimize.
                </p>
              </div>
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => sendMessage(`Find any travel options from ${origin} to ${destination}`)}
                  className="px-4 py-2 bg-indigo-950 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Ask AI to Find Options
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
