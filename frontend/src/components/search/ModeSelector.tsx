import React from 'react';
import { Plane, Train, Bus, Car, Navigation, Route } from 'lucide-react';
import { TransportMode } from '../../types/journey';
import { useSearchStore } from '../../store/useSearchStore';

interface ModeOption {
  id: TransportMode;
  label: string;
  icon: React.ElementType;
  description: string;
}

const MODES: ModeOption[] = [
  { id: 'flight', label: 'Flights', icon: Plane, description: 'Domestic and regional airline routes' },
  { id: 'train', label: 'Trains', icon: Train, description: 'Indian Railways express and Vande Bharat services' },
  { id: 'bus', label: 'Buses', icon: Bus, description: 'Intercity and AC sleeper bus routes' },
  { id: 'metro', label: 'Metro', icon: Train, description: 'Urban rapid transit metro networks' },
  { id: 'cab', label: 'Cabs', icon: Car, description: 'Pre-booked and on-demand city cabs' },
  { id: 'auto', label: 'Autos', icon: Navigation, description: 'Local first and last mile auto-rickshaws' },
];

export const ModeSelector: React.FC = () => {
  const { selectedModes, toggleMode, setAllModes } = useSearchStore();

  const isAllSelected = selectedModes.length === 6;

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter transportation modes">
      <button
        type="button"
        onClick={() => setAllModes(MODES.map((m) => m.id))}
        title="Search across all six transportation modes"
        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
          isAllSelected
            ? 'bg-indigo-950 text-white border-indigo-950 shadow-xs'
            : 'bg-white/80 text-slate-700 border-slate-200 hover:border-slate-300'
        }`}
      >
        <Route className="w-3.5 h-3.5" />
        All 6 Modes
      </button>

      {MODES.map((mode) => {
        const Icon = mode.icon;
        const active = selectedModes.includes(mode.id);
        return (
          <button
            key={mode.id}
            type="button"
            onClick={() => toggleMode(mode.id)}
            title={mode.description}
            aria-label={`${mode.label}: ${mode.description}`}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 border ${
              active
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white/80 text-slate-600 border-slate-200/80 hover:border-slate-300 hover:text-slate-900'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {mode.label}
          </button>
        );
      })}
    </div>
  );
};
