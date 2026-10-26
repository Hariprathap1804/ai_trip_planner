import React from 'react';
import { 
  Plane, 
  Train, 
  Bus, 
  Car, 
  Navigation, 
  ArrowRight, 
  ArrowRightLeft, 
  Clock, 
  IndianRupee, 
  Luggage, 
  Info,
  ShieldCheck,
  MapPin
} from 'lucide-react';
import { JourneyLeg, TransportMode } from '../../types/journey';

const MODE_CONFIG: Record<TransportMode, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  flight: { label: 'Flight', icon: Plane, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  train: { label: 'Train', icon: Train, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  bus: { label: 'Bus', icon: Bus, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  metro: { label: 'Metro', icon: Train, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
  cab: { label: 'Cab', icon: Car, color: 'text-sky-600', bg: 'bg-sky-50 border-sky-200' },
  auto: { label: 'Auto', icon: Navigation, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  multimodal: { label: 'Multimodal', icon: ArrowRight, color: 'text-violet-600', bg: 'bg-violet-50 border-violet-200' },
};

interface JourneyTimelineProps {
  legs: JourneyLeg[];
}

export const JourneyTimeline: React.FC<JourneyTimelineProps> = ({ legs }) => {
  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
        <span className="font-bold text-slate-800">
          Journey Breakdown: {legs.length} {legs.length === 1 ? 'Direct Segment' : 'Connected Segments'}
        </span>
        <span className="text-[11px] text-slate-500">
          All scheduled departure and arrival times shown in IST
        </span>
      </div>

      <div className="space-y-3">
        {legs.map((leg, index) => {
          const cfg = MODE_CONFIG[leg.mode] || MODE_CONFIG.flight;
          const Icon = cfg.icon;

          const depTime = leg.departure_time.includes('T')
            ? leg.departure_time.split('T')[1].substring(0, 5)
            : leg.departure_time;
          const arrTime = leg.arrival_time.includes('T')
            ? leg.arrival_time.split('T')[1].substring(0, 5)
            : leg.arrival_time;

          const legHours = Math.floor(leg.duration_minutes / 60);
          const legMins = leg.duration_minutes % 60;
          const legDurationStr = legHours > 0 ? `${legHours}h ${legMins}m` : `${legMins}m`;

          const isRoadHail = leg.mode === 'cab' || leg.mode === 'auto';
          const isMetro = leg.mode === 'metro';
          const isFlight = leg.mode === 'flight';
          const isTrain = leg.mode === 'train';

          return (
            <React.Fragment key={leg.id || index}>
              {/* Segment Card */}
              <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/90 space-y-3">
                {/* Segment Top Meta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-200/70 px-2 py-0.5 rounded-md">
                      Segment {index + 1} of {legs.length}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md border ${cfg.bg} ${cfg.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                      <span>{cfg.label}</span>
                    </span>
                    <span className="font-bold text-slate-900 text-xs">
                      {leg.operator}
                    </span>
                    {leg.service_number && (
                      <span className="text-[11px] text-slate-500 font-mono">
                        ({leg.service_number})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                      {leg.class_or_category || 'Standard'}
                    </span>
                    <span className="font-mono font-bold text-xs text-indigo-950">
                      ₹{leg.fare.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Departure to Arrival Row */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center text-xs">
                  {/* Origin */}
                  <div className="md:col-span-5 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-extrabold text-sm text-slate-900">{depTime}</span>
                      <span className="font-bold text-slate-800">{leg.origin.city}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 truncate" title={leg.origin.name}>
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{leg.origin.name}</span>
                    </div>
                  </div>

                  {/* Midline duration & stops */}
                  <div className="md:col-span-2 flex flex-col items-center justify-center text-center px-1">
                    <span className="text-[11px] font-semibold text-slate-600 mb-0.5">
                      {legDurationStr}
                    </span>
                    <div className="w-full flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      <div className="h-0.5 flex-1 bg-slate-300" />
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-0.5">
                      {leg.stops_count === 0 
                        ? 'Non-stop' 
                        : `${leg.stops_count} intermediate stop${leg.stops_count > 1 ? 's' : ''}`}
                    </span>
                  </div>

                  {/* Destination */}
                  <div className="md:col-span-5 space-y-0.5 md:text-right">
                    <div className="flex items-center gap-1.5 md:justify-end">
                      <span className="font-mono font-extrabold text-sm text-slate-900">{arrTime}</span>
                      <span className="font-bold text-slate-800">{leg.destination.city}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 md:justify-end truncate" title={leg.destination.name}>
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{leg.destination.name}</span>
                    </div>
                  </div>
                </div>

                {/* Segment Meta Footer (Baggage, Amenities, Notices) */}
                <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-slate-200/60 text-[11px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    {leg.baggage_allowance && (
                      <span className="inline-flex items-center gap-1 text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                        <Luggage className="w-3 h-3 text-slate-400" />
                        <span>Baggage: {leg.baggage_allowance}</span>
                      </span>
                    )}

                    {isRoadHail && (
                      <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md font-medium">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>Estimated pickup wait: 5–10 min dispatch • Tolls included</span>
                      </span>
                    )}

                    {isMetro && (
                      <span className="inline-flex items-center gap-1 text-purple-800 bg-purple-50 border border-purple-200/80 px-2 py-0.5 rounded-md font-medium">
                        <Clock className="w-3 h-3 text-purple-600" />
                        <span>Rapid transit: Departs every 5 min • No advance booking needed</span>
                      </span>
                    )}

                    {isFlight && (
                      <span className="inline-flex items-center gap-1 text-blue-800 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-md font-medium">
                        <Info className="w-3 h-3 text-blue-600" />
                        <span>Airport advisory: Arrive 2 hours prior to scheduled departure</span>
                      </span>
                    )}

                    {isTrain && leg.stops_count > 0 && (
                      <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md font-medium">
                        <Info className="w-3 h-3 text-emerald-600" />
                        <span>Station stops are scheduled halts along the same line (stay on board)</span>
                      </span>
                    )}
                  </div>

                  <span className="text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-md">
                    {leg.seat_count 
                      ? `${leg.seat_status} (${leg.seat_count} seats left)` 
                      : `${leg.seat_status || 'Available'}`}
                  </span>
                </div>
              </div>

              {/* Transfer Connection between segments */}
              {index < legs.length - 1 && (
                <div className="bg-gradient-to-r from-indigo-50 via-violet-50 to-indigo-50 border border-indigo-200/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-indigo-950 block">
                        Vehicle Transfer at {leg.destination.name.split(' ')[0]} ({leg.destination.city})
                      </span>
                      <span className="text-[11px] text-slate-600">
                        Disembark from {legs[index].operator} ({cfg.label}) and proceed to {legs[index + 1].operator} ({MODE_CONFIG[legs[index + 1].mode]?.label || 'Next leg'}).
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-block text-[11px] font-semibold text-indigo-900 bg-white border border-indigo-200 px-2.5 py-1 rounded-lg">
                      Recommended Transfer Window: ~30–45 min buffer
                    </span>
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
