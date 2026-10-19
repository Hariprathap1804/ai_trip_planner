import React from 'react';
import { Clock, AlertTriangle, CheckCircle2, XCircle, MapPin } from 'lucide-react';
import { JourneyLeg } from '../../types/journey';

interface TransferBufferCardProps {
  legA: JourneyLeg;
  legB: JourneyLeg;
  index: number;
}

export const TransferBufferCard: React.FC<TransferBufferCardProps> = ({ legA, legB }) => {
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
  const isOptimal = !isTight && !isNegative;

  return (
    <div className="relative py-2 px-6">
      <div className="flex items-center gap-3">
        {/* Connector vertical dotted line */}
        <div className="w-9 flex justify-center shrink-0">
          <div className="w-0.5 h-10 border-l-2 border-dashed border-slate-300" />
        </div>

        {/* Buffer Badge */}
        <div
          className={`flex-1 flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl border text-xs transition-all ${
            isNegative
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : isTight
              ? 'bg-amber-50/90 border-amber-200 text-amber-800'
              : 'bg-emerald-50/80 border-emerald-200/90 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {isNegative ? (
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : isTight ? (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}

            <span className="font-semibold">
              {isNegative
                ? 'Impossible Connection: Departure occurs before previous arrival!'
                : isTight
                ? `Tight Connection Buffer: ${bufferM} mins`
                : `Comfortable Transfer Buffer: ${bufferM} mins`}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1 text-slate-600">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span className="truncate max-w-[200px]">
                {legA.destination.name}
              </span>
            </div>

            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-white/80 border border-slate-200">
              Min Recommended: {minRecommended}m
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
