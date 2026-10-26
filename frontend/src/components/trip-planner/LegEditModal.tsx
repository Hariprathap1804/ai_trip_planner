import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plane, 
  Train, 
  Bus, 
  Car, 
  Navigation, 
  Layers, 
  Check, 
  Clock, 
  IndianRupee, 
  MapPin 
} from 'lucide-react';
import { JourneyLeg, TransportMode, LocationHub } from '../../types/journey';
import { useSearchStore } from '../../store/useSearchStore';

interface LegEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (leg: JourneyLeg) => void;
  initialLeg?: JourneyLeg | null;
  modeTitle: 'Add New Leg' | 'Edit Leg';
  previousLegDestination?: LocationHub;
  previousLegArrivalTime?: string;
}

const MODE_PRESETS: Record<TransportMode, {
  defaultOperator: string;
  defaultClass: string;
  operators: string[];
  classes: string[];
  typicalFare: number;
  typicalDuration: number;
}> = {
  flight: {
    defaultOperator: 'IndiGo Airlines',
    defaultClass: 'Economy (7kg cabin)',
    operators: ['IndiGo Airlines', 'Air India Express', 'Vistara Club', 'SpiceJet'],
    classes: ['Economy (7kg cabin)', 'Premium Economy', 'Business Class'],
    typicalFare: 3450,
    typicalDuration: 65,
  },
  train: {
    defaultOperator: '20608 Vande Bharat Express',
    defaultClass: 'AC Chair Car (CC)',
    operators: ['Vande Bharat Express', 'Shatabdi Express', 'Rajdhani Superfast', 'Kaveri Express'],
    classes: ['AC Chair Car (CC)', 'Executive Class (EC)', 'AC 3 Tier (3A)', 'Sleeper (SL)'],
    typicalFare: 995,
    typicalDuration: 280,
  },
  metro: {
    defaultOperator: 'Namma Metro Rapid Transit',
    defaultClass: 'Standard Transit QR',
    operators: ['Namma Metro Purple Line', 'Namma Metro Green Line', 'Chennai Metro Blue Line', 'Delhi Metro Airport Express'],
    classes: ['Standard Transit QR', 'Smart Card', 'First Class Metro'],
    typicalFare: 45,
    typicalDuration: 25,
  },
  bus: {
    defaultOperator: 'KSRTC Airavat Club Class',
    defaultClass: 'AC Multi-Axle Sleeper',
    operators: ['KSRTC Airavat', 'IntrCity SmartBus', 'SRS Travels Multi-Axle', 'Zingbus Electric'],
    classes: ['AC Multi-Axle Sleeper', 'Volvo Semi-Sleeper', 'Non-AC Seater'],
    typicalFare: 850,
    typicalDuration: 360,
  },
  cab: {
    defaultOperator: 'UberGo Sedan',
    defaultClass: 'Sedan (4 Seater)',
    operators: ['UberGo Sedan', 'Ola Prime Sedan', 'BluSmart EV Cab', 'MakeMyTrip Airport Cab'],
    classes: ['Sedan (4 Seater)', 'Hatchback (4 Seater)', 'SUV (6 Seater)', 'EV Cab'],
    typicalFare: 350,
    typicalDuration: 35,
  },
  auto: {
    defaultOperator: 'Namma Yatri Auto',
    defaultClass: 'Standard 3-Wheeler',
    operators: ['Namma Yatri Auto', 'Ola Auto', 'Uber Auto', 'Local Meter Auto'],
    classes: ['Standard 3-Wheeler', 'Electric Auto (EV)'],
    typicalFare: 95,
    typicalDuration: 20,
  },
  multimodal: {
    defaultOperator: 'Combined Transit',
    defaultClass: 'Multi-Leg',
    operators: ['Multimodal Transit'],
    classes: ['Standard'],
    typicalFare: 500,
    typicalDuration: 60,
  },
};

const TRANSIT_HUBS_SUGGESTIONS = [
  { city: 'Bengaluru', name: 'Kempegowda International Airport (BLR)', type: 'airport' as const },
  { city: 'Bengaluru', name: 'KSR Bengaluru City Station (SBC)', type: 'railway_station' as const },
  { city: 'Bengaluru', name: 'Yesvantpur Junction (YPR)', type: 'railway_station' as const },
  { city: 'Bengaluru', name: 'Kempegowda Majestic Metro Station', type: 'metro_station' as const },
  { city: 'Bengaluru', name: 'Indiranagar Metro Station', type: 'metro_station' as const },
  { city: 'Bengaluru', name: 'Shantinagar TTMC Bus Terminal', type: 'bus_terminal' as const },
  { city: 'Bengaluru', name: 'Home / Koramangala', type: 'address' as const },
  { city: 'Chennai', name: 'Chennai International Airport (MAA)', type: 'airport' as const },
  { city: 'Chennai', name: 'Puratchi Thalaivar Dr. MGR Central (MAS)', type: 'railway_station' as const },
  { city: 'Chennai', name: 'Chennai Egmore Station (MS)', type: 'railway_station' as const },
  { city: 'Chennai', name: 'Central Metro Station', type: 'metro_station' as const },
  { city: 'Chennai', name: 'CMBT Koyambedu Bus Stand', type: 'bus_terminal' as const },
  { city: 'Chennai', name: 'T. Nagar Business District', type: 'address' as const },
  { city: 'Hyderabad', name: 'Rajiv Gandhi International Airport (HYD)', type: 'airport' as const },
  { city: 'Hyderabad', name: 'Secunderabad Junction (SC)', type: 'railway_station' as const },
  { city: 'Hyderabad', name: 'MGBS Bus Terminal', type: 'bus_terminal' as const },
  { city: 'Hyderabad', name: 'HITEC City Cyber Towers', type: 'landmark' as const },
];

export const LegEditModal: React.FC<LegEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialLeg,
  modeTitle,
  previousLegDestination,
  previousLegArrivalTime,
}) => {
  const [mode, setMode] = useState<TransportMode>('cab');
  const [operator, setOperator] = useState('');
  const [serviceNumber, setServiceNumber] = useState('');
  const [originCity, setOriginCity] = useState('Bengaluru');
  const [originName, setOriginName] = useState('Home / Koramangala');
  const [destCity, setDestCity] = useState('Bengaluru');
  const [destName, setDestName] = useState('KSR Bengaluru City Station (SBC)');
  const [depTime, setDepTime] = useState('08:00');
  const [arrTime, setArrTime] = useState('08:45');
  const [fare, setFare] = useState(250);
  const [category, setCategory] = useState('Sedan (4 Seater)');
  const [seatStatus, setSeatStatus] = useState('Available');

  useEffect(() => {
    if (initialLeg) {
      setMode(initialLeg.mode);
      setOperator(initialLeg.operator);
      setServiceNumber(initialLeg.service_number || '');
      setOriginCity(initialLeg.origin.city);
      setOriginName(initialLeg.origin.name);
      setDestCity(initialLeg.destination.city);
      setDestName(initialLeg.destination.name);
      
      const formatTimeOnly = (t: string) => t.includes('T') ? t.split('T')[1].substring(0, 5) : t;
      setDepTime(formatTimeOnly(initialLeg.departure_time));
      setArrTime(formatTimeOnly(initialLeg.arrival_time));
      setFare(initialLeg.fare);
      setCategory(initialLeg.class_or_category);
      setSeatStatus(initialLeg.seat_status || 'Available');
    } else {
      // New leg defaults
      const defaultMode: TransportMode = 'cab';
      const preset = MODE_PRESETS[defaultMode];
      setMode(defaultMode);
      setOperator(preset.defaultOperator);
      setCategory(preset.defaultClass);
      setFare(preset.typicalFare);
      
      if (previousLegDestination) {
        setOriginCity(previousLegDestination.city);
        setOriginName(previousLegDestination.name);
      } else {
        setOriginCity('Bengaluru');
        setOriginName('Home / Indiranagar');
      }

      if (previousLegArrivalTime) {
        // Parse previous arrival time + 30m buffer
        try {
          const raw = previousLegArrivalTime.includes('T') ? previousLegArrivalTime.split('T')[1] : previousLegArrivalTime;
          const [h, m] = raw.split(':').map(Number);
          const nextDepTotal = h * 60 + m + 30;
          const depH = String(Math.floor(nextDepTotal / 60) % 24).padStart(2, '0');
          const depM = String(nextDepTotal % 60).padStart(2, '0');
          setDepTime(`${depH}:${depM}`);
          
          const nextArrTotal = nextDepTotal + preset.typicalDuration;
          const arrH = String(Math.floor(nextArrTotal / 60) % 24).padStart(2, '0');
          const arrM = String(nextArrTotal % 60).padStart(2, '0');
          setArrTime(`${arrH}:${arrM}`);
        } catch {
          setDepTime('09:00');
          setArrTime('09:45');
        }
      } else {
        setDepTime('08:00');
        setArrTime('08:45');
      }
      setDestCity('Bengaluru');
      setDestName('Kempegowda International Airport (BLR)');
      setSeatStatus('Available');
    }
  }, [initialLeg, isOpen, previousLegDestination, previousLegArrivalTime]);

  if (!isOpen) return null;

  const handleModeChange = (newMode: TransportMode) => {
    setMode(newMode);
    const preset = MODE_PRESETS[newMode];
    if (preset) {
      setOperator(preset.defaultOperator);
      setCategory(preset.defaultClass);
      setFare(preset.typicalFare);

      // Re-calculate arrival time from departure time + typical duration
      try {
        const [h, m] = depTime.split(':').map(Number);
        const totalArr = h * 60 + m + preset.typicalDuration;
        const arrH = String(Math.floor(totalArr / 60) % 24).padStart(2, '0');
        const arrM = String(totalArr % 60).padStart(2, '0');
        setArrTime(`${arrH}:${arrM}`);
      } catch {
        // keep current arrTime
      }
    }
  };

  const calculateDurationMinutes = (): number => {
    try {
      const [dh, dm] = depTime.split(':').map(Number);
      const [ah, am] = arrTime.split(':').map(Number);
      let diff = (ah * 60 + am) - (dh * 60 + dm);
      if (diff <= 0) diff += 24 * 60;
      return diff;
    } catch {
      return 60;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const durationM = calculateDurationMinutes();

    const baseDate = initialLeg?.departure_time?.includes('T')
      ? initialLeg.departure_time.split('T')[0]
      : (useSearchStore.getState().date || new Date().toISOString().split('T')[0]);

    const [dh, dm] = depTime.split(':').map(Number);
    const [ah, am] = arrTime.split(':').map(Number);
    const isOvernight = (ah * 60 + am) < (dh * 60 + dm);

    let arrDate = baseDate;
    if (isOvernight) {
      try {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + 1);
        arrDate = d.toISOString().split('T')[0];
      } catch {
        arrDate = baseDate;
      }
    }

    const legToSave: JourneyLeg = {
      id: initialLeg ? initialLeg.id : `leg_${Date.now()}`,
      mode,
      operator: operator.trim() || 'Transport Service',
      service_number: serviceNumber.trim() || undefined,
      origin: {
        id: initialLeg?.origin.id || `orig_${Date.now()}`,
        name: originName.trim() || 'Origin Location',
        city: originCity.trim() || 'Bengaluru',
        type: 'address',
      },
      destination: {
        id: initialLeg?.destination.id || `dest_${Date.now()}`,
        name: destName.trim() || 'Destination Location',
        city: destCity.trim() || originCity.trim(),
        type: 'address',
      },
      departure_time: `${baseDate}T${depTime}:00`,
      arrival_time: `${arrDate}T${arrTime}:00`,
      duration_minutes: durationM,
      fare: Number(fare) || 100,
      class_or_category: category.trim() || 'Standard',
      stops_count: 0,
      seat_status: seatStatus,
    };

    onSave(legToSave);
    onClose();
  };

  const currentPreset = MODE_PRESETS[mode];

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              {modeTitle === 'Add New Leg' ? 'Add Transportation Leg' : 'Edit Transportation Leg'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure transport mode, operator, connection hubs, scheduled times, and estimated fare.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* 1. Mode Switcher */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              1. Transportation Mode
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { id: 'flight', label: 'Flight', icon: <Plane className="w-4 h-4" /> },
                { id: 'train', label: 'Train', icon: <Train className="w-4 h-4" /> },
                { id: 'metro', label: 'Metro', icon: <Layers className="w-4 h-4" /> },
                { id: 'bus', label: 'Bus', icon: <Bus className="w-4 h-4" /> },
                { id: 'cab', label: 'Cab', icon: <Car className="w-4 h-4" /> },
                { id: 'auto', label: 'Auto', icon: <Navigation className="w-4 h-4" /> },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleModeChange(m.id as TransportMode)}
                  className={`flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    mode === m.id
                      ? 'bg-indigo-950 text-white border-indigo-950 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {m.icon}
                  <span className="text-[11px]">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Operator & Service Name */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                2. Operator / Service Provider
              </label>
              <span className="text-[11px] text-slate-400">e.g. IndiGo, Vande Bharat, Namma Metro</span>
            </div>
            <input
              type="text"
              required
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-600 bg-white"
              placeholder="e.g. Vande Bharat Express or UberGo Sedan"
            />
            {/* Quick Suggestions */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[10px] text-slate-400 font-semibold">Suggested:</span>
              {currentPreset?.operators.map((op) => (
                <button
                  key={op}
                  type="button"
                  onClick={() => setOperator(op)}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-medium border transition-colors cursor-pointer ${
                    operator === op
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {op}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Origin & Destination Hubs */}
          <div>
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              3. Transit Route & Connection Hubs
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
              {/* Origin */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Departure Origin</span>
                </div>
                <input
                  type="text"
                  required
                  value={originCity}
                  onChange={(e) => setOriginCity(e.target.value)}
                  placeholder="City (e.g. Bengaluru)"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium bg-white"
                />
                <input
                  type="text"
                  required
                  value={originName}
                  onChange={(e) => setOriginName(e.target.value)}
                  placeholder="Station, airport, or address"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium bg-white"
                />
              </div>

              {/* Destination */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Arrival Destination</span>
                </div>
                <input
                  type="text"
                  required
                  value={destCity}
                  onChange={(e) => setDestCity(e.target.value)}
                  placeholder="City (e.g. Chennai)"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium bg-white"
                />
                <input
                  type="text"
                  required
                  value={destName}
                  onChange={(e) => setDestName(e.target.value)}
                  placeholder="Station, airport, or address"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium bg-white"
                />
              </div>
            </div>
          </div>

          {/* Hub Quick Preset Picker */}
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Popular Connection Hubs & Terminals
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {TRANSIT_HUBS_SUGGESTIONS.map((h, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setDestCity(h.city);
                    setDestName(h.name);
                  }}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-700 cursor-pointer transition-colors"
                >
                  {h.city}: {h.name.split(' ')[0]} {h.name.split(' ')[1] || ''}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Timings & Calculated Duration */}
          <div>
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              4. Departure & Arrival Schedule
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Departure Time
                </label>
                <div className="relative">
                  <input
                    type="time"
                    required
                    value={depTime}
                    onChange={(e) => setDepTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Arrival Time
                </label>
                <div className="relative">
                  <input
                    type="time"
                    required
                    value={arrTime}
                    onChange={(e) => setArrTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Duration (In Transit)
                </label>
                <div className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{calculateDurationMinutes()}m in transit</span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Fare & Category & Seat Status */}
          <div>
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              5. Fare & Seat Details
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Estimated Fare (₹)
                </label>
                <div className="relative">
                  <IndianRupee className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    min="0"
                    step="10"
                    required
                    value={fare}
                    onChange={(e) => setFare(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-white"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Estimated per passenger</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Class / Vehicle Type
                </label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                  placeholder="e.g. Chair Car (CC), Sedan"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Cabin tier or vehicle size</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Seat Availability Status
                </label>
                <select
                  value={seatStatus}
                  onChange={(e) => setSeatStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                >
                  <option value="Available">Available (Confirmed)</option>
                  <option value="Few Seats Left">Few Seats Left</option>
                  <option value="RAC">RAC (Reservation Against Cancellation)</option>
                  <option value="Waitlist">Waitlist</option>
                </select>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Reservation inventory</span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-white text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{initialLeg ? 'Save Leg Changes' : 'Add Leg to Itinerary'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
