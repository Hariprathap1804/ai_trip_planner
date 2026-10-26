import React from 'react';
import { AlertTriangle, Sparkles } from 'lucide-react';

export const DemoDisclaimerBanner: React.FC = () => {
  return (
    <aside aria-label="Demo notice" className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-violet-500/10 border-b border-indigo-100/60 text-slate-700 text-xs py-1.5 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-900 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            TripPilot AI Preview
          </span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-slate-600 hidden sm:inline">
            Multimodal Travel & Route Planning Platform
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-800 font-medium">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span>Interactive Demonstration — Fares and tickets are simulated for evaluation</span>
        </div>
      </div>
    </aside>
  );
};
