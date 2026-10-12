import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Train, Bus, Car, Navigation, Sparkles, ChevronDown, ChevronUp, Check, ShieldCheck } from 'lucide-react';
import { Journey, TransportMode } from '../../types/journey';
import { useComparisonStore } from '../../store/useComparisonStore';
import { useBookingStore } from '../../store/useBookingStore';
import { JourneyTimeline } from './JourneyTimeline';

const MODE_CONFIG: Record<TransportMode, { label: string; icon: React.ElementType; color: string }> = {
  flight: { label: 'Flight', icon: Plane, color: 'bg-sky-50 text-sky-700 border-sky-200' },
  train: { label: 'Train', icon: Train, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  bus: { label: 'Bus', icon: Bus, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  metro: { label: 'Metro', icon: Train, color: 'bg-purple-50 text-purple-700 border-purple-200' },
  cab: { label: 'Cab', icon: Car, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  auto: { label: 'Auto', icon: Navigation, color: 'bg-orange-50 text-orange-700 border-orange-200' },
  multimodal: { label: 'Multimodal', icon: Sparkles, color: 'bg-violet-50 text-violet-700 border-violet-200' },
};

interface JourneyCardProps {
  journey: Journey;
}

export const JourneyCard: React.FC<JourneyCardProps> = ({ journey }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const { comparedJourneys, addJourney, removeJourney } = useComparisonStore();
  const { setDraftJourney } = useBookingStore();

  const isCompared = comparedJourneys.some((j) => j.id === journey.id);

  const primaryMode = journey.is_multimodal ? 'multimodal' : journey.modes[0] || 'flight';
  const config = MODE_CONFIG[primaryMode] || MODE_CONFIG.flight;
  const Icon = config.icon;

  const depTime = journey.departure_time.includes('T')
    ? journey.departure_time.split('T')[1].substring(0, 5)
    : journey.departure_time;
  const arrTime = journey.arrival_time.includes('T')
    ? journey.arrival_time.split('T')[1].substring(0, 5)
    : journey.arrival_time;

  const hours = Math.floor(journey.total_duration_minutes / 60);
  const minutes = journey.total_duration_minutes % 60;
  const durationStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  const handleBookDemo = () => {
    setDraftJourney(journey);
    navigate('/booking/review');
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCompared) {
      removeJourney(journey.id);
    } else {
      addJourney(journey);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden group">
      {/* AI Recommendation Banner if high score */}
      {journey.ai_recommendation_reason && journey.recommended_score >= 90 && (
        <div className="bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-transparent px-5 py-1.5 border-b border-violet-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-violet-900 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
            <span>AI Match: {journey.ai_recommendation_reason}</span>
          </div>
          <span className="font-bold text-violet-700 font-mono text-[11px]">
            {Math.round(journey.recommended_score)}% Score
          </span>
        </div>
      )}

      <div className="p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Operator and mode header */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${config.color} shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">
                  {journey.legs[0]?.operator || 'Express Travel'}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${config.color}`}>
                  {config.label}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {journey.legs[0]?.class_or_category || 'Standard'} • {journey.transfers_count === 0 ? 'Direct Route' : `${journey.transfers_count} Transfer${journey.transfers_count > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          {/* Times & duration timeline */}
          <div className="flex items-center gap-6 justify-between md:justify-center flex-1 max-w-md">
            <div className="text-left">
              <div className="text-lg font-bold text-slate-900 font-mono">{depTime}</div>
              <div className="text-xs font-semibold text-slate-700">{journey.origin.city}</div>
              <div className="text-[11px] text-slate-400 truncate max-w-[110px]" title={journey.origin.name}>
                {journey.origin.name}
              </div>
            </div>

            <div className="flex flex-col items-center flex-1 px-2">
              <span className="text-[11px] font-semibold text-slate-500 mb-1">{durationStr}</span>
              <div className="w-full flex items-center gap-1">
                <div className="w-2 h-2 rounded-full border border-indigo-600 bg-white" />
                <div className="h-0.5 flex-1 bg-slate-200" />
                <div className="w-2 h-2 rounded-full bg-indigo-600" />
              </div>
              <span className="text-[10px] text-slate-400 mt-1">
                {journey.transfers_count === 0 ? 'Non-stop' : `${journey.transfers_count} stop`}
              </span>
            </div>

            <div className="text-right">
              <div className="text-lg font-bold text-slate-900 font-mono">{arrTime}</div>
              <div className="text-xs font-semibold text-slate-700">{journey.destination.city}</div>
              <div className="text-[11px] text-slate-400 truncate max-w-[110px]" title={journey.destination.name}>
                {journey.destination.name}
              </div>
            </div>
          </div>

          {/* Pricing and Book CTA */}
          <div className="flex items-center md:flex-col justify-between md:items-end gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
            <div>
              <div className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">
                ₹{journey.total_fare.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1 justify-end">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Simulated Fare</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleCompare}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer flex items-center gap-1 ${
                  isCompared
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-900'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {isCompared && <Check className="w-3 h-3 text-indigo-600" />}
                Compare
              </button>

              <button
                type="button"
                onClick={handleBookDemo}
                className="px-4 py-2 bg-indigo-950 hover:bg-indigo-900 text-white text-xs font-bold rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer"
              >
                Book Demo
              </button>
            </div>
          </div>
        </div>

        {/* Expand timeline toggle */}
        {journey.legs.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
            >
              <span>{isExpanded ? 'Hide Journey Leg Details' : `View ${journey.legs.length} Leg Details & Amenities`}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              {journey.legs[0]?.seat_status || 'Available'}
            </span>
          </div>
        )}

        {/* Collapsible Legs Detail */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <JourneyTimeline legs={journey.legs} />
          </div>
        )}
      </div>
    </div>
  );
};
