import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Route, Plus, Trash2, ArrowUpDown, AlertTriangle, ShieldCheck, ArrowRight, Sparkles, Clock, IndianRupee } from 'lucide-react';
import { usePlannerStore } from '../store/usePlannerStore';
import { useBookingStore } from '../store/useBookingStore';
import { useAiStore } from '../store/useAiStore';
import { JourneyLeg } from '../types/journey';

const DEFAULT_MULTIMODAL_LEGS: JourneyLeg[] = [
  {
    id: 'leg_1',
    mode: 'cab',
    operator: 'UberGo (Hatchback)',
    service_number: 'Ride #1',
    origin: { id: 'h1', name: 'Home / Manyata Tech Park', city: 'Bengaluru', type: 'address' },
    destination: { id: 'h2', name: 'KSR Bengaluru City Station', city: 'Bengaluru', type: 'railway_station' },
    departure_time: '2026-10-13T04:45:00',
    arrival_time: '2026-10-13T05:15:00',
    duration_minutes: 30,
    fare: 250,
    class_or_category: 'Hatchback (4 seater)',
    stops_count: 0,
    seat_status: 'Available',
  },
  {
    id: 'leg_2',
    mode: 'train',
    operator: '20608 Vande Bharat Express',
    service_number: 'Train 20608',
    origin: { id: 'h2', name: 'KSR Bengaluru City Station', city: 'Bengaluru', type: 'railway_station' },
    destination: { id: 'h3', name: 'Puratchi Thalaivar Dr. MGR Central', city: 'Chennai', type: 'railway_station' },
    departure_time: '2026-10-13T05:45:00',
    arrival_time: '2026-10-13T10:10:00',
    duration_minutes: 265,
    fare: 995,
    class_or_category: 'Chair Car (CC)',
    stops_count: 2,
    seat_status: 'Available',
  },
  {
    id: 'leg_3',
    mode: 'cab',
    operator: 'UberGo (Sedan)',
    service_number: 'Ride #2',
    origin: { id: 'h3', name: 'Chennai Central Station', city: 'Chennai', type: 'railway_station' },
    destination: { id: 'h4', name: 'Marina Beach Promenade', city: 'Chennai', type: 'landmark' },
    departure_time: '2026-10-13T10:35:00',
    arrival_time: '2026-10-13T10:55:00',
    duration_minutes: 20,
    fare: 180,
    class_or_category: 'Sedan (4 seater)',
    stops_count: 0,
    seat_status: 'Available',
  },
];

export const TripPlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const { legs, activeItinerary, setInitialLegs, removeLeg, addLeg, recalculateItinerary, isLoading } = usePlannerStore();
  const { setDraftJourney } = useBookingStore();
  const { toggleOpen, sendMessage } = useAiStore();

  useEffect(() => {
    if (legs.length === 0) {
      setInitialLegs(DEFAULT_MULTIMODAL_LEGS);
    }
  }, [legs.length, setInitialLegs]);

  const handleBookItinerary = () => {
    if (activeItinerary) {
      setDraftJourney(activeItinerary);
      navigate('/booking/review');
    }
  };

  const handleAddSampleLeg = () => {
    const newLeg: JourneyLeg = {
      id: `leg_${Date.now()}`,
      mode: 'auto',
      operator: 'Namma Yatri Auto',
      origin: { id: 'auto_orig', name: 'Drop-off Point', city: 'Chennai', type: 'landmark' },
      destination: { id: 'auto_dest', name: 'Final Destination Hotel', city: 'Chennai', type: 'address' },
      departure_time: '2026-10-13T11:05:00',
      arrival_time: '2026-10-13T11:20:00',
      duration_minutes: 15,
      fare: 80,
      class_or_category: 'Standard 3-Wheeler',
      stops_count: 0,
      seat_status: 'Available',
    };
    addLeg(newLeg);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-semibold mb-2">
            <Route className="w-3.5 h-3.5 text-indigo-600" />
            <span>Signature Feature</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Multimodal Trip Planner</h1>
          <p className="text-xs text-slate-500">
            Chain multiple transportation modes into one seamless door-to-door itinerary with transfer buffer validation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleOpen}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-violet-50 text-violet-800 border border-violet-200 hover:bg-violet-100 flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
            <span>Ask AI to Refine</span>
          </button>

          <button
            type="button"
            onClick={handleAddSampleLeg}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Connection Leg</span>
          </button>
        </div>
      </div>

      {/* Warnings Banner if transfers are tight */}
      {activeItinerary?.warnings && activeItinerary.warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs space-y-1.5 text-amber-800">
          <div className="font-bold flex items-center gap-1.5 text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Connection Buffer Advisory</span>
          </div>
          {activeItinerary.warnings.map((w, idx) => (
            <div key={idx} className="ml-5 list-disc">{w}</div>
          ))}
        </div>
      )}

      {/* Sequence of Journey Legs */}
      <div className="space-y-4">
        {legs.map((leg, index) => {
          const depTime = leg.departure_time.includes('T') ? leg.departure_time.split('T')[1].substring(0, 5) : leg.departure_time;
          const arrTime = leg.arrival_time.includes('T') ? leg.arrival_time.split('T')[1].substring(0, 5) : leg.arrival_time;

          return (
            <div key={leg.id} className="relative">
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-950 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    #{index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{leg.operator}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                        {leg.mode}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {leg.class_or_category} • {leg.duration_minutes} mins
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs flex-1 max-w-sm justify-between">
                  <div>
                    <span className="font-mono font-bold text-slate-900">{depTime}</span>
                    <div className="text-slate-500 truncate max-w-[120px]">{leg.origin.name}</div>
                  </div>
                  <div className="text-slate-300">→</div>
                  <div>
                    <span className="font-mono font-bold text-slate-900">{arrTime}</span>
                    <div className="text-slate-500 truncate max-w-[120px]">{leg.destination.name}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="font-mono font-extrabold text-base text-slate-900">
                    ₹{leg.fare.toLocaleString()}
                  </div>
                  {legs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLeg(leg.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Transfer Buffer between legs */}
              {index < legs.length - 1 && (
                <div className="my-2 ml-10 flex items-center gap-2 text-[11px] font-medium text-slate-500">
                  <div className="w-0.5 h-6 bg-slate-200 ml-4" />
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200/60 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Transfer Buffer & Connection: ~30 mins
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Cumulative Totals Bar & Booking CTA */}
      {activeItinerary && (
        <div className="bg-indigo-950 text-white rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="grid grid-cols-3 gap-6 text-left">
            <div>
              <div className="text-[10px] text-indigo-300 uppercase tracking-wider font-semibold">Total Duration</div>
              <div className="text-lg font-bold font-mono">
                {Math.floor(activeItinerary.total_duration_minutes / 60)}h {activeItinerary.total_duration_minutes % 60}m
              </div>
            </div>

            <div>
              <div className="text-[10px] text-indigo-300 uppercase tracking-wider font-semibold">Connections</div>
              <div className="text-lg font-bold font-mono">{activeItinerary.transfers_count} Transfers</div>
            </div>

            <div>
              <div className="text-[10px] text-indigo-300 uppercase tracking-wider font-semibold">Cumulative Fare</div>
              <div className="text-xl font-extrabold font-mono text-emerald-400">
                ₹{activeItinerary.total_fare.toLocaleString()}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleBookItinerary}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Book Multimodal Trip Demo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
