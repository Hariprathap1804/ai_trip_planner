import React from 'react';
import { Plane, Train, Bus, Sparkles, PlusCircle } from 'lucide-react';
import { JourneyLeg } from '../../types/journey';

export interface PresetTemplate {
  id: string;
  title: string;
  tagline: string;
  icon: React.ReactNode;
  badge: string;
  legs: JourneyLeg[];
}

const getTodayIso = (daysOffset = 0): string => {
  try {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().split('T')[0];
  } catch {
    return '2026-10-23';
  }
};

const BASE_D = getTodayIso(0);
const NEXT_D = getTodayIso(1);

export const MULTIMODAL_PRESETS: PresetTemplate[] = [
  {
    id: 'preset_flight_express',
    title: 'Airport Door-to-Door (BLR → MAA)',
    tagline: 'Cab to Airport + Flight + Cab to Hotel',
    badge: 'Fastest Transit',
    icon: <Plane className="w-4 h-4 text-sky-600" />,
    legs: [
      {
        id: 'leg_f1',
        mode: 'cab',
        operator: 'UberGo (Airport Sedan)',
        service_number: 'Ride #1',
        origin: { id: 'addr_1', name: 'Home / Indiranagar', city: 'Bengaluru', type: 'address' },
        destination: { id: 'blr_airport', name: 'Kempegowda International Airport (BLR)', city: 'Bengaluru', type: 'airport' },
        departure_time: `${BASE_D}T06:00:00`,
        arrival_time: `${BASE_D}T07:00:00`,
        duration_minutes: 60,
        fare: 950,
        class_or_category: 'Sedan (4 Seater)',
        stops_count: 0,
        seat_status: 'Available',
      },
      {
        id: 'leg_f2',
        mode: 'flight',
        operator: 'IndiGo 6E-243',
        service_number: '6E-243',
        origin: { id: 'blr_airport', name: 'Kempegowda International Airport (BLR)', city: 'Bengaluru', type: 'airport' },
        destination: { id: 'maa_airport', name: 'Chennai International Airport (MAA)', city: 'Chennai', type: 'airport' },
        departure_time: `${BASE_D}T08:45:00`,
        arrival_time: `${BASE_D}T09:45:00`,
        duration_minutes: 60,
        fare: 3250,
        class_or_category: 'Economy (7kg cabin)',
        stops_count: 0,
        seat_status: 'Available',
      },
      {
        id: 'leg_f3',
        mode: 'cab',
        operator: 'Ola Prime Sedan',
        service_number: 'Ride #2',
        origin: { id: 'maa_airport', name: 'Chennai International Airport (MAA)', city: 'Chennai', type: 'airport' },
        destination: { id: 'addr_2', name: 'T. Nagar Business District', city: 'Chennai', type: 'address' },
        departure_time: `${BASE_D}T10:15:00`,
        arrival_time: `${BASE_D}T10:50:00`,
        duration_minutes: 35,
        fare: 450,
        class_or_category: 'Prime Sedan',
        stops_count: 0,
        seat_status: 'Available',
      },
    ],
  },
  {
    id: 'preset_vande_bharat',
    title: 'High-Speed Rail Express (BLR → MAA)',
    tagline: 'Auto to Station + Vande Bharat Train + Metro',
    badge: 'Popular Choice',
    icon: <Train className="w-4 h-4 text-emerald-600" />,
    legs: [
      {
        id: 'leg_v1',
        mode: 'auto',
        operator: 'Namma Yatri Auto',
        service_number: 'Auto #1',
        origin: { id: 'addr_blr', name: 'Home / Koramangala', city: 'Bengaluru', type: 'address' },
        destination: { id: 'blr_rail', name: 'KSR Bengaluru City Junction (SBC)', city: 'Bengaluru', type: 'railway_station' },
        departure_time: `${BASE_D}T04:45:00`,
        arrival_time: `${BASE_D}T05:15:00`,
        duration_minutes: 30,
        fare: 150,
        class_or_category: 'Auto 3-Wheeler',
        stops_count: 0,
        seat_status: 'Available',
      },
      {
        id: 'leg_v2',
        mode: 'train',
        operator: '20608 Vande Bharat Express',
        service_number: '20608',
        origin: { id: 'blr_rail', name: 'KSR Bengaluru City Junction (SBC)', city: 'Bengaluru', type: 'railway_station' },
        destination: { id: 'maa_rail', name: 'Puratchi Thalaivar Dr. MGR Central (MAS)', city: 'Chennai', type: 'railway_station' },
        departure_time: `${BASE_D}T05:45:00`,
        arrival_time: `${BASE_D}T10:10:00`,
        duration_minutes: 265,
        fare: 995,
        class_or_category: 'AC Chair Car (CC)',
        stops_count: 2,
        seat_status: 'Available',
      },
      {
        id: 'leg_v3',
        mode: 'metro',
        operator: 'Chennai Metro Blue Line',
        service_number: 'Blue Line Line 1',
        origin: { id: 'maa_metro', name: 'Central Metro Station', city: 'Chennai', type: 'metro_station' },
        destination: { id: 'maa_dest', name: 'Guindy Tech Park', city: 'Chennai', type: 'landmark' },
        departure_time: `${BASE_D}T10:30:00`,
        arrival_time: `${BASE_D}T10:55:00`,
        duration_minutes: 25,
        fare: 40,
        class_or_category: 'Smart Token / QR',
        stops_count: 5,
        seat_status: 'Available',
      },
    ],
  },
  {
    id: 'preset_budget_bus',
    title: 'Budget Intercity (BLR → HYD)',
    tagline: 'Metro to Terminal + AC Sleeper Bus + Auto',
    badge: 'Budget Friendly',
    icon: <Bus className="w-4 h-4 text-amber-600" />,
    legs: [
      {
        id: 'leg_b1',
        mode: 'metro',
        operator: 'Namma Metro Purple Line',
        service_number: 'Purple Line',
        origin: { id: 'blr_m1', name: 'Indiranagar Metro Station', city: 'Bengaluru', type: 'metro_station' },
        destination: { id: 'blr_m2', name: 'Kempegowda Majestic Metro', city: 'Bengaluru', type: 'metro_station' },
        departure_time: `${BASE_D}T20:00:00`,
        arrival_time: `${BASE_D}T20:25:00`,
        duration_minutes: 25,
        fare: 35,
        class_or_category: 'Standard Metro',
        stops_count: 7,
        seat_status: 'Available',
      },
      {
        id: 'leg_b2',
        mode: 'bus',
        operator: 'KSRTC Airavat Club Class Multi-Axle',
        service_number: 'KA-01-F-8821',
        origin: { id: 'blr_bus', name: 'Kempegowda Bus Station (Majestic)', city: 'Bengaluru', type: 'bus_terminal' },
        destination: { id: 'hyd_bus', name: 'Mahatma Gandhi Bus Station (MGBS)', city: 'Hyderabad', type: 'bus_terminal' },
        departure_time: `${BASE_D}T21:00:00`,
        arrival_time: `${NEXT_D}T06:30:00`,
        duration_minutes: 570,
        fare: 1150,
        class_or_category: 'Volvo AC Multi-Axle Sleeper',
        stops_count: 3,
        seat_status: 'Few Seats Left',
      },
      {
        id: 'leg_b3',
        mode: 'auto',
        operator: 'Hyderabad Auto Rickshaw',
        service_number: 'Auto #2',
        origin: { id: 'hyd_bus', name: 'MGBS Bus Stand', city: 'Hyderabad', type: 'bus_terminal' },
        destination: { id: 'hyd_hitec', name: 'HITEC City Cyber Towers', city: 'Hyderabad', type: 'landmark' },
        departure_time: `${NEXT_D}T06:50:00`,
        arrival_time: `${NEXT_D}T07:25:00`,
        duration_minutes: 35,
        fare: 160,
        class_or_category: 'Standard Auto',
        stops_count: 0,
        seat_status: 'Available',
      },
    ],
  },
];

interface MultimodalPresetsProps {
  onSelectPreset: (legs: JourneyLeg[]) => void;
  onClear: () => void;
  activePresetId?: string;
}

export const MultimodalPresets: React.FC<MultimodalPresetsProps> = ({
  onSelectPreset,
  onClear,
}) => {
  return (
    <div className="bg-gradient-to-r from-slate-50 to-indigo-50/50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Pre-Configured Route Templates
          </h3>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Explore sample connected journeys or customize each connection leg
          </span>
        </div>

        <button
          type="button"
          onClick={onClear}
          className="text-xs font-semibold text-slate-600 hover:text-indigo-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 cursor-pointer transition-colors shadow-2xs"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Clear & Build Custom</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {MULTIMODAL_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onSelectPreset(preset.legs)}
            className="text-left p-3.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 group-hover:bg-indigo-50">
                {preset.icon}
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                {preset.badge}
              </span>
            </div>
            <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              {preset.title}
            </div>
            <div className="text-[11px] text-slate-500 truncate mt-0.5">
              {preset.tagline}
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-mono">
              <span>{preset.legs.length} connected legs</span>
              <span className="font-bold text-indigo-700">
                Est. ₹{preset.legs.reduce((acc, l) => acc + l.fare, 0).toLocaleString()}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
