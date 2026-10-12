import React from 'react';
import { Plane, Train, Bus, Car, Navigation, Route } from 'lucide-react';
import { TransportMode } from '../../types/journey';
import { useSearchStore } from '../../store/useSearchStore';

interface ModeOption {
  id: TransportMode;
  label: string;
  icon: React.ElementType;
}

const MODES: ModeOption[] = [
  { id: 'flight', label: 'Flights', icon: Plane },
  { id: 'train', label: 'Trains', icon: Train },
  { id: 'bus', label: 'Buses', icon: Bus },
  { id: 'metro', label: 'Metro', icon: Train },
  { id: 'cab', label: 'Cabs', icon: Car },
  { id: 'auto', label: 'Autos', icon: Navigation },
];

export const ModeSelector: React.FC = () => {
  const { selectedModes, toggleMode, setAllModes } = useSearchStore();

  const isAllSelected = selectedModes.length === 6;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => setAllModes(MODES.map((m) => m.id))}
        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
          isAllSelected
            ? 'bg-indigo-950 text-white border-indigo-950 shadow-xs'
            : 'bg-white/80 text-slate-700 border-slate-200 hover:border-slate-300'
        }`}
      >
        <Route className="w-3.5 h-3.5" />
        All Modes
      </button>

      {MODES.map((mode) => {
        const Icon = mode.icon;
        const active = selectedModes.includes(mode.id);
        return (
          <button
            key={mode.id}
            type="button"
            onClick={() => toggleMode(mode.id)}
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
