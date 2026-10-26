import React from 'react';
import { Clock, AlertTriangle, CheckCircle2, XCircle, MapPin } from 'lucide-react';
import { JourneyLeg } from '../../types/journey';

interface TransferBufferCardProps {
  legA: JourneyLeg;
  legB: JourneyLeg;
  index: number;
}

export const TransferBufferCard: React.FC<TransferBufferCardProps> = ({ legA, legB, index }) => {
  // Parse departure and arrival minutes
  const parseMinutes = (timeStr: string): number => {
    try {
      const timePart = timeStr.includes('T') ? timeStr.split('T')[1] : timeStr;
      const [h, m] = timePart.split(':').map(Number);
      return h * 60 + m;
    } catch {
      return 0;
    }
  };

  const arrM = parseMinutes(legA.arrival_time);
  const depM = parseMinutes(legB.departure_time);
  let bufferM = depM - arrM;
  if (bufferM < 0) {
    bufferM += 24 * 60; // Next day connection
  }

  const isNextFlight = legB.mode === 'flight';
  const minRecommended = isNextFlight ? 90 : 30;

  const isNegative = depM < arrM && !legB.departure_time.includes('T');
  const isTight = bufferM < minRecommended;

  return (
    <div className="relative py-2 px-6">
      <div className="flex items-center gap-3">
        {/* Connector vertical dotted line */}
        <div className="w-9 flex justify-center shrink-0">
          <div className="w-0.5 h-10 border-l-2 border-dashed border-slate-300" />
        </div>

        {/* Buffer Badge */}
        <div
          className={`flex-1 flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl border text-xs transition-all ${
            isNegative
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : isTight
              ? 'bg-amber-50/90 border-amber-200 text-amber-900'
              : 'bg-emerald-50/80 border-emerald-200/90 text-emerald-900'
          }`}
        >
          <div className="flex items-start gap-2.5 max-w-xl">
            {isNegative ? (
              <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            ) : isTight ? (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            )}

            <div>
              <span className="font-bold block">
                {isNegative
                  ? `Insufficient Connection Time (Leg ${index + 1} → Leg ${index + 2})`
                  : isTight
                  ? `Tight Transfer Window: ${bufferM} minutes available`
                  : `Comfortable Connection Buffer: ${bufferM} minutes available`}
              </span>
              <p className="text-[11px] opacity-90 mt-0.5">
                {isNegative
                  ? `Leg ${index + 2} departs before Leg ${index + 1} arrives. Please adjust your scheduled departure time.`
                  : isTight
                  ? `Only ${bufferM}m between vehicles. Recommended minimum buffer is ${minRecommended}m for ${isNextFlight ? 'flight security and check-in' : 'station platform transfers'}.`
                  : `Adequate time to disembark at ${legA.destination.name.split(' ')[0]} and board ${legB.operator}.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] self-start sm:self-auto">
            <div className="flex items-center gap-1 text-slate-700 bg-white/70 px-2 py-0.5 rounded-md border border-slate-200/60">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate max-w-[180px]">
                {legA.destination.name}
              </span>
            </div>

            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-white/90 border border-slate-200 text-slate-700">
              Min Recommended: {minRecommended}m
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
