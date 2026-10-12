import React from 'react';
import { Compass, ShieldCheck, Database, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-slate-200/80 bg-white/60 py-12 text-slate-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-950 flex items-center justify-center text-white">
              <Compass className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-sm">TripPilot AI</span>
          </div>
          <p className="text-slate-500 leading-relaxed">
            Intelligent multimodal travel platform providing unified search across flights, trains, metro, buses, cabs, and autos.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            Transportation Modes
          </h4>
          <ul className="space-y-1.5 text-slate-500">
            <li>Flights (Domestic & International)</li>
            <li>Trains (Vande Bharat & Express)</li>
            <li>Metro Transit Systems</li>
            <li>Intercity & AC Sleeper Buses</li>
            <li>On-demand Cabs & Local Autos</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-indigo-600" />
            Architecture Stack
          </h4>
          <ul className="space-y-1.5 text-slate-500">
            <li>Frontend: React 18, TypeScript, Tailwind CSS</li>
            <li>Backend: FastAPI Python Service</li>
            <li>Database: Supabase PostgreSQL</li>
            <li>State: Zustand Central Store</li>
            <li>Engine: Deterministic & LLM NLP Gateway</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            Prototype Guarantee
          </h4>
          <p className="text-slate-500 leading-relaxed">
            All schedules, fares, availability, and booking references are simulated. Designed for rapid evaluation, research, and multimodal travel workflow demonstrations.
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-slate-400">
        <p>© 2026 TripPilot AI. Built for Google Antigravity.</p>
        <p>Single source of truth: TripPilot_AI_PRD_Antigravity.md</p>
      </div>
    </footer>
  );
};
