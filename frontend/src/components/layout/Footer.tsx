import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Compass, 
  Sparkles, 
  ShieldCheck, 
  Route, 
  Plane, 
  Train, 
  Bus, 
  Car, 
  Navigation, 
  ArrowRight, 
  Globe, 
  Mail, 
  CheckCircle2, 
  Lock, 
  HelpCircle 
} from 'lucide-react';

const GithubIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const TwitterIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedinIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);
import { useAiStore } from '../../store/useAiStore';
import { useSearchStore } from '../../store/useSearchStore';
import { HelpAndFaqModal } from '../help/HelpAndFaqModal';

export const Footer: React.FC = () => {
  const navigate = useNavigate();
  const { toggleOpen } = useAiStore();
  const { setOrigin, setDestination, executeSearch } = useSearchStore();

  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [helpModalTab, setHelpModalTab] = useState<'faqs' | 'policies'>('faqs');

  const openHelpModal = (tab: 'faqs' | 'policies') => {
    setHelpModalTab(tab);
    setIsHelpModalOpen(true);
  };

  const handleCorridorClick = async (from: string, to: string) => {
    setOrigin(from);
    setDestination(to);
    await executeSearch();
    navigate('/explore');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-24 bg-[#0B0F19] text-slate-400 border-t border-slate-800/80 text-xs selection:bg-indigo-600 selection:text-white">
      {/* Pre-Footer Action Banner */}
      <div className="border-b border-slate-800/60 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-violet-950/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-slate-900/60 rounded-2xl p-6 sm:p-8 border border-slate-800/80 shadow-2xl backdrop-blur-md">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Next-Generation Travel Intelligence</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Ready to plan your connected journey across India?
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Compare flight, train, bus, and cab options side-by-side, or let our conversational AI concierge craft your door-to-door itinerary with smart transfer buffers.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  navigate('/planner');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Route className="w-4 h-4" />
                <span>Launch Trip Planner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={toggleOpen}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                <span>Ask AI Concierge</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main 5-Column Navigation Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Column 1: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link 
              to="/" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-2.5 group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5 text-indigo-100" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-white tracking-tight">TripPilot</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-md shadow-xs">
                  AI
                </span>
              </div>
            </Link>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              TripPilot AI unifies India's multimodal transit network—intelligently linking domestic flights, express rail, intercity buses, urban metro systems, and local cabs into seamless, door-to-door itineraries.
            </p>

            {/* Operational & Security Trust Badges */}
            <div className="pt-2 space-y-2">
              <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>All Transit Systems Operational</span>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Verified Booking Partner & Secure Checkout</span>
              </div>
            </div>

            {/* Social & Community Links */}
            <div className="pt-2 flex items-center gap-3 text-slate-400">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noreferrer"
                aria-label="GitHub Repository"
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noreferrer"
                aria-label="Twitter Profile"
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <TwitterIcon className="w-4 h-4" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noreferrer"
                aria-label="LinkedIn Profile"
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
              <a 
                href="mailto:contact@trippilot.ai" 
                aria-label="Contact Email"
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Popular Corridors */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider">
              Popular Corridors
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => handleCorridorClick('Bengaluru', 'Chennai')}
                  className="hover:text-indigo-400 transition-colors text-left cursor-pointer flex items-center justify-between w-full group"
                >
                  <span>Bengaluru → Chennai</span>
                  <span className="text-[10px] text-slate-600 group-hover:text-indigo-400">From ₹250</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleCorridorClick('Bengaluru', 'Hyderabad')}
                  className="hover:text-indigo-400 transition-colors text-left cursor-pointer flex items-center justify-between w-full group"
                >
                  <span>Bengaluru → Hyderabad</span>
                  <span className="text-[10px] text-slate-600 group-hover:text-indigo-400">From ₹890</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleCorridorClick('Delhi', 'Mumbai')}
                  className="hover:text-indigo-400 transition-colors text-left cursor-pointer flex items-center justify-between w-full group"
                >
                  <span>Delhi → Mumbai</span>
                  <span className="text-[10px] text-slate-600 group-hover:text-indigo-400">From ₹2,450</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleCorridorClick('Mumbai', 'Pune')}
                  className="hover:text-indigo-400 transition-colors text-left cursor-pointer flex items-center justify-between w-full group"
                >
                  <span>Mumbai → Pune</span>
                  <span className="text-[10px] text-slate-600 group-hover:text-indigo-400">From ₹180</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleCorridorClick('Chennai', 'Coimbatore')}
                  className="hover:text-indigo-400 transition-colors text-left cursor-pointer flex items-center justify-between w-full group"
                >
                  <span>Chennai → Coimbatore</span>
                  <span className="text-[10px] text-slate-600 group-hover:text-indigo-400">From ₹450</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Multimodal Transit Network */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider">
              Transit Network
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center gap-2 hover:text-slate-200 transition-colors">
                <Plane className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Domestic & Regional Flights</span>
              </li>
              <li className="flex items-center gap-2 hover:text-slate-200 transition-colors">
                <Train className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Express & Vande Bharat Rail</span>
              </li>
              <li className="flex items-center gap-2 hover:text-slate-200 transition-colors">
                <Bus className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Intercity AC Sleeper Buses</span>
              </li>
              <li className="flex items-center gap-2 hover:text-slate-200 transition-colors">
                <Train className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>Urban Metro Transit Lines</span>
              </li>
              <li className="flex items-center gap-2 hover:text-slate-200 transition-colors">
                <Car className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>Pre-Booked Airport Cabs</span>
              </li>
              <li className="flex items-center gap-2 hover:text-slate-200 transition-colors">
                <Navigation className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                <span>Local First & Last-Mile Autos</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Platform Capabilities */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider">
              Platform Features
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link 
                  to="/explore" 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Door-to-Door Route Optimizer
                </Link>
              </li>
              <li>
                <Link 
                  to="/planner" 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Smart Transfer Buffer Protection
                </Link>
              </li>
              <li>
                <button 
                  type="button" 
                  onClick={toggleOpen}
                  className="hover:text-indigo-400 transition-colors text-left cursor-pointer"
                >
                  Conversational AI Travel Concierge
                </button>
              </li>
              <li>
                <Link 
                  to="/explore" 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Side-by-Side Route Comparison
                </Link>
              </li>
              <li>
                <Link 
                  to="/bookings" 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Confirmed E-Tickets & PNRs
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openHelpModal('faqs')}
                  title="Frequently asked questions about route planning, transfers, and tickets"
                  className="hover:text-indigo-400 transition-colors cursor-pointer text-left"
                >
                  Help Center & FAQs
                </button>
              </li>
              <li>
                <span className="text-slate-500">
                  PCI-DSS Compliant Payment Gateway
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Regional Settings, Disclaimers, and Copyright */}
      <div className="border-t border-slate-800/80 bg-slate-950/70 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-slate-500">
            {/* Locale & Currency Indicator */}
            <div className="flex items-center gap-3 text-slate-400 font-medium">
              <span className="flex items-center gap-1.5" title="Region: India • Language: English">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>India (English)</span>
              </span>
              <span>•</span>
              <span title="Fares displayed in Indian Rupees">Currency: INR (₹)</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-400" title="All transit data and checkout requests secured with 256-bit encryption">
                <CheckCircle2 className="w-3 h-3" />
                <span>SSL Secured</span>
              </span>
            </div>

            {/* Legal & Policy Links */}
            <div className="flex items-center gap-4 text-slate-400">
              <button
                type="button"
                onClick={() => openHelpModal('policies')}
                title="View traveler data protection and privacy safeguards"
                className="hover:text-slate-200 cursor-pointer transition-colors"
              >
                Privacy Policy
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => openHelpModal('policies')}
                title="View terms of service and reservation conditions"
                className="hover:text-slate-200 cursor-pointer transition-colors"
              >
                Terms of Service
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => openHelpModal('policies')}
                title="Review transfer safety guidelines and connection buffer recommendations"
                className="hover:text-slate-200 cursor-pointer transition-colors"
              >
                Safety Guidelines
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => openHelpModal('faqs')}
                title="Open frequently asked questions and user guide"
                className="hover:text-slate-200 cursor-pointer transition-colors"
              >
                Help & FAQs
              </button>
            </div>
          </div>

          {/* Prototype Demonstration Notice */}
          <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/60 text-slate-400 leading-relaxed text-[11px] space-y-1">
            <p className="font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Interactive Demonstration & Evaluation Notice</span>
            </p>
            <p>
              TripPilot AI is an advanced multimodal travel intelligence platform. Transit schedules, fares, availability, and reservations shown across flights, express trains, buses, and cabs are simulated for evaluation and technology demonstration. No real bank accounts or payment cards are charged during simulated bookings.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-500 text-[11px] pt-2">
            <p>© 2026 TripPilot AI Technologies. All rights reserved.</p>
            <p className="text-slate-600">Designed for seamless, connected door-to-door journeys across India.</p>
          </div>
        </div>
      </div>

      {/* Interactive Help & FAQ Modal */}
      <HelpAndFaqModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        initialTab={helpModalTab}
      />
    </footer>
  );
};
