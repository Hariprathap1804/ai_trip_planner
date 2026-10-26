import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Train, Bus, Car, Navigation, Route, Sparkles, ShieldCheck, ArrowRight, Zap } from 'lucide-react';
import { UnifiedSearchWidget } from '../components/search/UnifiedSearchWidget';
import { QuickPromptChips } from '../components/search/QuickPromptChips';
import { useSearchStore } from '../store/useSearchStore';

const POPULAR_ROUTES = [
  {
    from: 'Bengaluru',
    to: 'Chennai',
    tag: 'Frequent Service',
    time: 'From 60m',
    fare: 'From ₹250',
    modes: ['Flight', 'Train', 'Bus', 'Cab'],
  },
  {
    from: 'Bengaluru',
    to: 'Hyderabad',
    tag: 'Express Corridor',
    time: 'From 1h 05m',
    fare: 'From ₹890',
    modes: ['Flight', 'Train', 'Bus'],
  },
  {
    from: 'Delhi',
    to: 'Mumbai',
    tag: 'Air & Rail Express',
    time: 'From 1h 45m',
    fare: 'From ₹2,450',
    modes: ['Flight', 'Train'],
  },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { setOrigin, setDestination, executeSearch } = useSearchStore();

  useEffect(() => {
    // Initial fetch
    executeSearch();
  }, [executeSearch]);

  const handleRouteClick = async (from: string, to: string) => {
    setOrigin(from);
    setDestination(to);
    await executeSearch();
    navigate('/explore');
  };

  return (
    <div className="space-y-16 py-8">
      {/* Hero Header */}
      <section className="text-center max-w-4xl mx-auto space-y-4 px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-950 text-xs font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Door-to-Door Multimodal Travel Platform</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Compare ways to get there and plan <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-950 via-blue-600 to-violet-600">
            seamless journeys across India.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Search flights, trains, buses, metro, cabs, and autos side-by-side. Connect legs with safe transfer buffers, or let our conversational AI assistant tailor your route.
        </p>
      </section>

      {/* Main Search Widget */}
      <section className="max-w-5xl mx-auto px-4">
        <UnifiedSearchWidget />
        <div className="mt-4 px-2">
          <QuickPromptChips />
        </div>
      </section>

      {/* Key Features Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Route className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Connected Door-to-Door Itineraries</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Combine airport cabs, express rail, intercity buses, and local autos into one seamless itinerary with smart transfer buffer protection.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Conversational AI Travel Assistant</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tell the assistant your timing, budget, or preferred transit modes. It instantly refines search filters and suggests optimized routes.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">End-to-End Travel Booking</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Complete reservations with instant confirmation, inspect official e-tickets with PNR references, and pay securely via Razorpay.
            </p>
          </div>
        </div>
      </section>

      {/* Popular Corridor Routes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Popular Travel Corridors</h2>
            <p className="text-xs text-slate-500">Frequently searched multimodal routes connecting major Indian hubs</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/explore')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Compare all journeys</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {POPULAR_ROUTES.map((route, idx) => (
            <div
              key={idx}
              onClick={() => handleRouteClick(route.from, route.to)}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                  {route.tag}
                </span>
                <span className="text-xs font-mono font-semibold text-slate-700">{route.time}</span>
              </div>

              <div className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1">
                {route.from} → {route.to}
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs">
                <span className="text-slate-500">{route.modes.join(' • ')}</span>
                <span className="font-extrabold text-slate-900 font-mono">{route.fare}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
