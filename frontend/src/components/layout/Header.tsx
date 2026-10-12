import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Sparkles, Ticket, Route, Search } from 'lucide-react';
import { useAiStore } from '../../store/useAiStore';
import { useBookingStore } from '../../store/useBookingStore';

export const Header: React.FC = () => {
  const location = useLocation();
  const { toggleOpen, isOpen } = useAiStore();
  const { bookings, fetchBookings } = useBookingStore();

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const activeBookingsCount = bookings.filter((b) => b.status === 'CONFIRMED').length;

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 glass-nav border-b border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-900 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-950/20 group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5 text-indigo-100" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-slate-900 tracking-tight">TripPilot</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-md shadow-xs">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium tracking-tight">Multimodal Travel Platform</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1 rounded-xl border border-slate-200/50">
          <Link
            to="/explore"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isActive('/explore')
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Explore
          </Link>
          <Link
            to="/planner"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isActive('/planner')
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Route className="w-3.5 h-3.5" />
            Trip Planner
          </Link>
          <Link
            to="/bookings"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isActive('/bookings')
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            My Bookings
            {activeBookingsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-indigo-600 text-white text-[10px] font-bold rounded-full">
                {activeBookingsCount}
              </span>
            )}
          </Link>
        </nav>

        {/* AI Assistant CTA */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleOpen}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
              isOpen
                ? 'bg-indigo-950 text-white'
                : 'bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-800 text-white hover:shadow-indigo-900/20 hover:scale-[1.02]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-300 animate-pulse" />
            <span>AI Assistant</span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] bg-white/20 rounded font-mono">
              Ctrl+K
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
