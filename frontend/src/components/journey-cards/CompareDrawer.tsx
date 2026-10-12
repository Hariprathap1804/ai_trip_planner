import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { useComparisonStore } from '../../store/useComparisonStore';
import { useBookingStore } from '../../store/useBookingStore';
import { Journey } from '../../types/journey';

export const CompareDrawer: React.FC = () => {
  const navigate = useNavigate();
  const { comparedJourneys, isDrawerOpen, removeJourney, clearComparison, setDrawerOpen } = useComparisonStore();
  const { setDraftJourney } = useBookingStore();

  if (!isDrawerOpen || comparedJourneys.length === 0) return null;

  const handleBook = (journey: Journey) => {
    setDraftJourney(journey);
    setDrawerOpen(false);
    navigate('/booking/review');
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-300 shadow-2xl p-5 transition-all">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-sm">
              Side-by-Side Comparison ({comparedJourneys.length}/3 Selected)
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">• Compare cost, time, and comfort</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={clearComparison}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3-column grid comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {comparedJourneys.map((j) => {
            const depTime = j.departure_time.includes('T') ? j.departure_time.split('T')[1].substring(0, 5) : j.departure_time;
            const arrTime = j.arrival_time.includes('T') ? j.arrival_time.split('T')[1].substring(0, 5) : j.arrival_time;
            const hours = Math.floor(j.total_duration_minutes / 60);
            const minutes = j.total_duration_minutes % 60;

            return (
              <div key={j.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between relative">
                <button
                  type="button"
                  onClick={() => removeJourney(j.id)}
                  className="absolute top-2.5 right-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div>
                  <div className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1">
                    {j.legs[0]?.operator} • {j.modes.join(' + ').toUpperCase()}
                  </div>
                  <div className="text-xl font-extrabold text-slate-900 font-mono mb-2">
                    ₹{j.total_fare.toLocaleString()}
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 mb-4 border-t border-slate-200/60 pt-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Duration:</span>
                      <span className="font-semibold text-slate-800">{hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Departure:</span>
                      <span className="font-mono font-medium text-slate-800">{depTime} ({j.origin.city})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Arrival:</span>
                      <span className="font-mono font-medium text-slate-800">{arrTime} ({j.destination.city})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Transfers:</span>
                      <span className="font-medium text-slate-800">{j.transfers_count === 0 ? 'Direct Non-stop' : `${j.transfers_count} stops`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Availability:</span>
                      <span className="font-medium text-emerald-700">{j.legs[0]?.seat_status || 'Available'}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleBook(j)}
                  className="w-full py-2 bg-indigo-950 hover:bg-indigo-900 text-white font-bold text-xs rounded-lg transition-transform active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Select & Book Demo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
