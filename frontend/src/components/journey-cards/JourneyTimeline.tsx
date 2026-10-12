import React from 'react';
import { Plane, Train, Bus, Car, Navigation, ArrowRight } from 'lucide-react';
import { JourneyLeg, TransportMode } from '../../types/journey';

const MODE_ICONS: Record<TransportMode, React.ElementType> = {
  flight: Plane,
  train: Train,
  bus: Bus,
  metro: Train,
  cab: Car,
  auto: Navigation,
  multimodal: ArrowRight,
};

interface JourneyTimelineProps {
  legs: JourneyLeg[];
}

export const JourneyTimeline: React.FC<JourneyTimelineProps> = ({ legs }) => {
  return (
    <div className="py-2">
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {legs.map((leg, index) => {
          const Icon = MODE_ICONS[leg.mode] || ArrowRight;
          const depTime = leg.departure_time.includes('T')
            ? leg.departure_time.split('T')[1].substring(0, 5)
            : leg.departure_time;
          const arrTime = leg.arrival_time.includes('T')
            ? leg.arrival_time.split('T')[1].substring(0, 5)
            : leg.arrival_time;

          return (
            <React.Fragment key={leg.id || index}>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs shrink-0">
                <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-900 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <span>{leg.operator}</span>
                    {leg.service_number && (
                      <span className="text-[10px] text-slate-500 font-mono">({leg.service_number})</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    <span className="font-mono font-medium text-slate-700">{depTime}</span> {leg.origin.name.split(' ')[0]} →{' '}
                    <span className="font-mono font-medium text-slate-700">{arrTime}</span> {leg.destination.name.split(' ')[0]}
                  </div>
                </div>
              </div>

              {index < legs.length - 1 && (
                <div className="flex items-center text-slate-400 shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
