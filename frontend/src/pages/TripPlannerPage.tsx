import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Route, 
  Plus, 
  Trash2, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  IndianRupee, 
  AlertTriangle, 
  ShieldCheck, 
  RefreshCw,
  Layers,
  MapPin,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { usePlannerStore } from '../store/usePlannerStore';
import { useBookingStore } from '../store/useBookingStore';
import { useAiStore } from '../store/useAiStore';
import { JourneyLeg, TransportMode } from '../types/journey';
import { MultimodalPresets, MULTIMODAL_PRESETS } from '../components/trip-planner/MultimodalPresets';
import { LegCard } from '../components/trip-planner/LegCard';
import { TransferBufferCard } from '../components/trip-planner/TransferBufferCard';
import { LegEditModal } from '../components/trip-planner/LegEditModal';

export const TripPlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    legs, 
    activeItinerary, 
    setInitialLegs, 
    removeLeg, 
    addLeg, 
    reorderLegs,
    replaceLeg,
    resetPlanner,
    recalculateItinerary, 
    isLoading 
  } = usePlannerStore();
  
  const { setDraftJourney } = useBookingStore();
  const { toggleOpen, sendMessage } = useAiStore();

  const [editingLeg, setEditingLeg] = useState<JourneyLeg | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Initialize with High-Speed Rail default if store is empty
  useEffect(() => {
    if (legs.length === 0) {
      setInitialLegs(MULTIMODAL_PRESETS[1].legs);
    }
  }, [legs.length, setInitialLegs]);

  const handleBookItinerary = () => {
    if (activeItinerary) {
      setDraftJourney(activeItinerary);
      navigate('/booking/review');
    }
  };

  const handleEditLeg = (leg: JourneyLeg) => {
    setEditingLeg(leg);
    setIsEditModalOpen(true);
  };

  const handleSaveEditedLeg = (updatedLeg: JourneyLeg) => {
    if (editingLeg) {
      replaceLeg(editingLeg.id, updatedLeg);
      setEditingLeg(null);
      setIsEditModalOpen(false);
    }
  };

  const handleAddNewLeg = (newLeg: JourneyLeg) => {
    addLeg(newLeg);
    setIsAddModalOpen(false);
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      reorderLegs(index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < legs.length - 1) {
      reorderLegs(index, index + 1);
    }
  };

  const handleQuickModeSwap = (id: string, newMode: TransportMode) => {
    const target = legs.find((l) => l.id === id);
    if (!target) return;
    const updated: JourneyLeg = {
      ...target,
      mode: newMode,
      operator: `${newMode.toUpperCase()} Connection`,
      class_or_category: 'Standard',
    };
    replaceLeg(id, updated);
  };

  const handleAskAIToOptimize = () => {
    toggleOpen();
    const origin = legs[0]?.origin.city || 'Bengaluru';
    const dest = legs[legs.length - 1]?.destination.city || 'Chennai';
    sendMessage(`Analyze my current ${legs.length}-leg multimodal route from ${origin} to ${dest}. Optimize transfer buffers, reduce total travel time, and verify if any connection is too tight.`);
  };

  const handleClearItinerary = () => {
    // Reset to single fresh leg so user can configure
    const singleBlankLeg: JourneyLeg = {
      id: `leg_${Date.now()}`,
      mode: 'cab',
      operator: 'UberGo Sedan',
      service_number: 'Ride #1',
      origin: { id: 'addr_1', name: 'Home / Pickup Location', city: 'Bengaluru', type: 'address' },
      destination: { id: 'dest_1', name: 'KSR Bengaluru Station', city: 'Bengaluru', type: 'railway_station' },
      departure_time: '2026-10-13T08:00:00',
      arrival_time: '2026-10-13T08:45:00',
      duration_minutes: 45,
      fare: 350,
      class_or_category: 'Sedan (4 seater)',
      stops_count: 0,
      seat_status: 'Available',
    };
    setInitialLegs([singleBlankLeg]);
  };

  const lastLeg = legs.length > 0 ? legs[legs.length - 1] : undefined;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-semibold mb-2">
            <Route className="w-3.5 h-3.5 text-indigo-600" />
            <span>Signature Multimodal Engine</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Multimodal Trip Planner
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Build custom door-to-door routes chaining flights, trains, metro, buses, cabs, and autos with real-time transfer buffer validation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleAskAIToOptimize}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-violet-50 text-violet-800 border border-violet-200 hover:bg-violet-100 flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
            <span>Ask AI to Optimize</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-950 text-white hover:bg-indigo-900 flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Connection Leg</span>
          </button>
        </div>
      </div>

      {/* 2. Route Presets Bar */}
      <MultimodalPresets
        onSelectPreset={(presetLegs) => setInitialLegs(presetLegs)}
        onClear={handleClearItinerary}
      />

      {/* 3. Advisory Warning Banner if any connections are tight or impossible */}
      {activeItinerary?.warnings && activeItinerary.warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs space-y-1.5 text-amber-900">
          <div className="font-bold flex items-center gap-1.5 text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Transfer Buffer Advisory ({activeItinerary.warnings.length})</span>
          </div>
          <ul className="ml-5 list-disc space-y-1 text-amber-800">
            {activeItinerary.warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 4. Timeline Sequence of Journey Legs */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-2 mb-2">
          <span>Itinerary Leg Sequence ({legs.length} transport segments)</span>
          <span>Door-to-door timeline</span>
        </div>

        {legs.map((leg, index) => (
          <React.Fragment key={leg.id}>
            {/* The Leg Card with Edit, Move Up/Down, Mode Swap, Delete */}
            <LegCard
              leg={leg}
              index={index}
              totalLegs={legs.length}
              onEdit={handleEditLeg}
              onRemove={removeLeg}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onQuickModeSwap={handleQuickModeSwap}
            />

            {/* Connection Buffer Card between consecutive legs */}
            {index < legs.length - 1 && (
              <TransferBufferCard
                legA={leg}
                legB={legs[index + 1]}
                index={index}
              />
            )}
          </React.Fragment>
        ))}

        {/* Quick Add Leg button at bottom of list */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="w-full py-3.5 border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl text-xs font-bold text-slate-600 hover:text-indigo-600 bg-white/50 hover:bg-indigo-50/50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            <span>+ Add Next Transit Leg / Last-Mile Connection</span>
          </button>
        </div>
      </div>

      {/* 5. Cumulative Totals Bar & Booking CTA */}
      {activeItinerary && (
        <div className="sticky bottom-6 z-20 bg-indigo-950 text-white rounded-3xl p-6 shadow-2xl border border-indigo-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-6 backdrop-blur-md">
          <div className="grid grid-cols-3 gap-6 text-left">
            <div>
              <div className="text-[10px] text-indigo-300 uppercase tracking-wider font-semibold">
                Total Duration
              </div>
              <div className="text-xl font-extrabold font-mono flex items-center gap-1.5 mt-0.5">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>
                  {Math.floor(activeItinerary.total_duration_minutes / 60)}h{' '}
                  {activeItinerary.total_duration_minutes % 60}m
                </span>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-indigo-300 uppercase tracking-wider font-semibold">
                Transfers
              </div>
              <div className="text-xl font-extrabold font-mono mt-0.5">
                {activeItinerary.transfers_count} {activeItinerary.transfers_count === 1 ? 'Transfer' : 'Transfers'}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-indigo-300 uppercase tracking-wider font-semibold">
                Cumulative Fare
              </div>
              <div className="text-2xl font-black font-mono text-emerald-400 mt-0.5">
                ₹{activeItinerary.total_fare.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBookItinerary}
              className="px-7 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Book Entire Multimodal Trip Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 6. Edit Leg Modal */}
      <LegEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingLeg(null);
        }}
        onSave={handleSaveEditedLeg}
        initialLeg={editingLeg}
        modeTitle="Edit Leg"
      />

      {/* 7. Add Leg Modal */}
      <LegEditModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddNewLeg}
        initialLeg={null}
        modeTitle="Add New Leg"
        previousLegDestination={lastLeg?.destination}
        previousLegArrivalTime={lastLeg?.arrival_time}
      />
    </div>
  );
};
