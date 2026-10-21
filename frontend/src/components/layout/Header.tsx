import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Sparkles, Ticket, Route, Search, User as UserIcon, LogOut, ChevronDown, ShieldCheck } from 'lucide-react';
import { useAiStore } from '../../store/useAiStore';
import { useBookingStore } from '../../store/useBookingStore';
import { useAuthStore } from '../../store/useAuthStore';

export const Header: React.FC = () => {
  const location = useLocation();
  const { toggleOpen, isOpen } = useAiStore();
  const { bookings, fetchBookings } = useBookingStore();
  const { user, isAuthenticated, logout, openAuthModal } = useAuthStore();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings, isAuthenticated]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeBookingsCount = bookings.filter((b) => b.status === 'CONFIRMED').length;

  const isActive = (path: string) => location.pathname === path;

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 glass-nav border-b border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
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

        {/* Right Section: AI Assistant + User Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* AI Assistant CTA */}
          <button
            onClick={toggleOpen}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
              isOpen
                ? 'bg-indigo-950 text-white'
                : 'bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-800 text-white hover:shadow-indigo-900/20 hover:scale-[1.02]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-300 animate-pulse" />
            <span className="hidden sm:inline">AI Assistant</span>
            <span className="hidden lg:inline-block px-1.5 py-0.5 text-[9px] bg-white/20 rounded font-mono">
              Ctrl+K
            </span>
          </button>

          {/* User Auth Section */}
          {isAuthenticated && user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white shadow-xs cursor-pointer transition-all hover:bg-slate-50"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {getInitials(user.name)}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-800 leading-tight max-w-[100px] truncate">
                    {user.name}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono truncate">{user.email}</p>
                    {user.phone && <p className="text-[10px] text-slate-400 mt-0.5">{user.phone}</p>}
                  </div>

                  <div className="py-1">
                    <Link
                      to="/bookings"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                    >
                      <Ticket className="w-4 h-4 text-slate-400" />
                      <span>My Bookings</span>
                      {activeBookingsCount > 0 && (
                        <span className="ml-auto px-1.5 py-0.2 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full">
                          {activeBookingsCount}
                        </span>
                      )}
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 py-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => openAuthModal('login')}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs hover:shadow-indigo-600/20 transition-all cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
