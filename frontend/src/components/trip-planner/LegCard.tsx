import React from 'react';
import { 
  Plane, 
  Train, 
  Bus, 
  Car, 
  Navigation, 
  Layers, 
  ArrowUp, 
  ArrowDown, 
  Edit3, 
  Trash2, 
  Clock, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { JourneyLeg, TransportMode } from '../../types/journey';

interface LegCardProps {
  leg: JourneyLeg;
  index: number;
  totalLegs: number;
  onEdit: (leg: JourneyLeg) => void;
  onRemove: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onQuickModeSwap: (id: string, newMode: TransportMode) => void;
}

const getModeConfig = (mode: TransportMode) => {
  switch (mode) {
    case 'flight':
      return {
        icon: <Plane className="w-4 h-4 text-sky-600" />,
        bg: 'bg-sky-50',
        border: 'border-sky-200',
        text: 'text-sky-800',
        label: 'Flight',
      };
    case 'train':
      return {
        icon: <Train className="w-4 h-4 text-emerald-600" />,
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-800',
        label: 'Train',
      };
    case 'metro':
      return {
        icon: <Layers className="w-4 h-4 text-purple-600" />,
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-800',
        label: 'Metro',
      };
    case 'bus':
      return {
        icon: <Bus className="w-4 h-4 text-amber-600" />,
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-800',
        label: 'Bus',
      };
    case 'cab':
      return {
        icon: <Car className="w-4 h-4 text-blue-600" />,
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-800',
        label: 'Cab',
      };
    case 'auto':
      return {
        icon: <Navigation className="w-4 h-4 text-yellow-600" />,
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-800',
        label: 'Auto',
      };
    default:
      return {
        icon: <Navigation className="w-4 h-4 text-indigo-600" />,
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        text: 'text-indigo-800',
        label: 'Transit',
      };
  }
};

export const LegCard: React.FC<LegCardProps> = ({
  leg,
  index,
  totalLegs,
  onEdit,
  onRemove,
  onMoveUp,
  onMoveDown,
  onQuickModeSwap,
}) => {
  const modeConfig = getModeConfig(leg.mode);

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '--:--';
    return timeStr.includes('T') ? timeStr.split('T')[1].substring(0, 5) : timeStr;
  };

  const depTime = formatTime(leg.departure_time);
  const arrTime = formatTime(leg.arrival_time);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all group">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Sequence & Mode Badge & Operator */}
        <div className="flex items-center gap-3">
          {/* Step Sequence Badge */}
          <div className="w-9 h-9 rounded-xl bg-indigo-950 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
            #{index + 1}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase ${modeConfig.bg} ${modeConfig.border} ${modeConfig.text}`}>
                {modeConfig.icon}
                <span>{modeConfig.label}</span>
              </span>

              <span className="font-bold text-slate-900 text-sm">{leg.operator}</span>
              {leg.service_number && (
                <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                  ({leg.service_number})
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>{leg.class_or_category}</span>
              <span>•</span>
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3 text-slate-400" />
                {leg.duration_minutes} mins
              </span>
              <span>•</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                {leg.seat_status || 'Available'}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Transit Origin -> Destination */}
        <div className="flex items-center gap-4 text-xs flex-1 max-w-md justify-between bg-slate-50/70 p-3 rounded-xl border border-slate-100">
          <div className="min-w-0">
            <div className="font-mono font-extrabold text-sm text-slate-900">{depTime}</div>
            <div className="text-slate-700 font-semibold truncate text-xs">{leg.origin.city}</div>
            <div className="text-[11px] text-slate-500 truncate max-w-[140px]">{leg.origin.name}</div>
          </div>

          <div className="flex flex-col items-center justify-center shrink-0 text-slate-300">
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <span className="text-[10px] text-slate-400 font-mono mt-0.5">{leg.duration_minutes}m</span>
          </div>

          <div className="min-w-0 text-right">
            <div className="font-mono font-extrabold text-sm text-slate-900">{arrTime}</div>
            <div className="text-slate-700 font-semibold truncate text-xs">{leg.destination.city}</div>
            <div className="text-[11px] text-slate-500 truncate max-w-[140px]">{leg.destination.name}</div>
          </div>
        </div>

        {/* Right: Fare & Action Buttons (Edit, Reorder, Delete) */}
        <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Simulated Fare</div>
            <div className="font-mono font-extrabold text-base text-slate-900">
              ₹{leg.fare.toLocaleString()}
            </div>
          </div>

          {/* Action Button Toolbar */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
            {/* Move Up */}
            <button
              type="button"
              disabled={index === 0}
              onClick={() => onMoveUp(index)}
              title="Move Leg Up"
              className={`p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white transition-colors cursor-pointer ${
                index === 0 ? 'opacity-30 cursor-not-allowed' : ''
              }`}
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>

            {/* Move Down */}
            <button
              type="button"
              disabled={index === totalLegs - 1}
              onClick={() => onMoveDown(index)}
              title="Move Leg Down"
              className={`p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white transition-colors cursor-pointer ${
                index === totalLegs - 1 ? 'opacity-30 cursor-not-allowed' : ''
              }`}
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>

            {/* Edit Leg Details */}
            <button
              type="button"
              onClick={() => onEdit(leg)}
              title="Edit Leg Details"
              className="px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            {/* Delete Leg */}
            <button
              type="button"
              disabled={totalLegs <= 1}
              onClick={() => onRemove(leg.id)}
              title={totalLegs <= 1 ? "Cannot delete the only leg" : "Delete Leg"}
              className={`p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer ${
                totalLegs <= 1 ? 'opacity-30 cursor-not-allowed' : ''
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
