import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Settings, 
  Sliders, 
  ShieldCheck, 
  Check, 
  LogOut, 
  Bell, 
  HeartHandshake, 
  Clock, 
  Armchair, 
  Sparkles,
  Plane,
  Train,
  Bus,
  Car,
  Navigation,
  Layers,
  Save
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface TravelPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface UserTravelPreferences {
  seatPreference: string;
  bufferPreference: 'standard' | 'relaxed' | 'quick';
  preferredModes: string[];
  specialAssistance: string;
  smsNotifications: boolean;
  whatsappUpdates: boolean;
  emailReceipts: boolean;
}

const PREFERENCES_STORAGE_KEY = 'trippilot_traveler_preferences';

export const getDefaultPreferences = (): UserTravelPreferences => {
  try {
    const saved = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to parse saved travel preferences:', e);
  }
  return {
    seatPreference: 'Window Seat',
    bufferPreference: 'standard',
    preferredModes: ['flight', 'train', 'metro', 'bus', 'cab', 'auto'],
    specialAssistance: '',
    smsNotifications: true,
    whatsappUpdates: true,
    emailReceipts: true,
  };
};

export const TravelPreferencesModal: React.FC<TravelPreferencesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'preferences' | 'account'>('preferences');
  const [preferences, setPreferences] = useState<UserTravelPreferences>(getDefaultPreferences());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showSignoutConfirm, setShowSignoutConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPreferences(getDefaultPreferences());
      setSavedSuccess(false);
      setShowSignoutConfirm(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to save preferences:', err);
    }
  };

  const toggleMode = (mode: string) => {
    setPreferences((prev) => {
      const exists = prev.preferredModes.includes(mode);
      if (exists) {
        if (prev.preferredModes.length <= 1) return prev; // Keep at least one
        return { ...prev, preferredModes: prev.preferredModes.filter((m) => m !== mode) };
      }
      return { ...prev, preferredModes: [...prev.preferredModes, mode] };
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-950 text-white flex items-center justify-center shadow-md">
              <Sliders className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Traveler Profile & Preferences
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Customize your travel defaults, connection comfort buffers, and account settings.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preferences modal"
            title="Close dialog"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Tab Switcher */}
        <div className="px-6 pt-3 border-b border-slate-100 flex gap-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('preferences')}
            className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${
              activeTab === 'preferences'
                ? 'border-indigo-600 text-indigo-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Travel Preferences & Comfort
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('account')}
            className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${
              activeTab === 'account'
                ? 'border-indigo-600 text-indigo-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Account & Security Profile
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {savedSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Preferences saved! Your travel defaults will automatically apply to new journeys and bookings.</span>
            </div>
          )}

          {activeTab === 'preferences' ? (
            <form id="preferences-form" onSubmit={handleSave} className="space-y-6">
              {/* 1. Seat Preference */}
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  1. Default Seat Preference
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  Automatically applied when booking flights, express trains, and intercity buses.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                  {['Window Seat', 'Aisle Seat', 'Lower Berth', 'Any Available'].map((seat) => (
                    <button
                      key={seat}
                      type="button"
                      onClick={() => setPreferences((p) => ({ ...p, seatPreference: seat }))}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                        preferences.seatPreference === seat
                          ? 'bg-indigo-950 text-white border-indigo-950 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {seat}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Transfer Buffer Sensitivity */}
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  2. Connection Transfer Buffer
                </label>
                <p className="text-[11px] text-slate-500 mb-2.5">
                  Controls the safety margin calculated between vehicles in the Multimodal Trip Planner.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    {
                      id: 'relaxed',
                      label: 'Relaxed Margin',
                      time: '60–90 min buffer',
                      desc: 'Ideal for travelers with heavy luggage or unfamiliar with large airports/stations.',
                    },
                    {
                      id: 'standard',
                      label: 'Standard Buffer',
                      time: '30–45 min buffer',
                      desc: 'Recommended safety balance between quick transits and reliable connections.',
                    },
                    {
                      id: 'quick',
                      label: 'Quick Transit',
                      time: '15–25 min buffer',
                      desc: 'Best for light packers and familiar commuters moving between close platforms.',
                    },
                  ].map((buf) => (
                    <div
                      key={buf.id}
                      onClick={() => setPreferences((p) => ({ ...p, bufferPreference: buf.id as any }))}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                        preferences.bufferPreference === buf.id
                          ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20'
                          : 'bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900">{buf.label}</span>
                        {preferences.bufferPreference === buf.id && (
                          <Check className="w-3.5 h-3.5 text-indigo-600" />
                        )}
                      </div>
                      <div className="text-[11px] font-mono font-semibold text-indigo-700 mb-1">
                        {buf.time}
                      </div>
                      <p className="text-[10px] text-slate-500 leading-snug">{buf.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Preferred Transit Modes */}
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  3. Preferred Transit Modes
                </label>
                <p className="text-[11px] text-slate-500 mb-2.5">
                  Select modes you prefer to include by default when searching routes or planning trips.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'flight', label: 'Flights', icon: <Plane className="w-3.5 h-3.5" /> },
                    { id: 'train', label: 'Trains & Rail', icon: <Train className="w-3.5 h-3.5" /> },
                    { id: 'metro', label: 'Urban Metro', icon: <Layers className="w-3.5 h-3.5" /> },
                    { id: 'bus', label: 'AC Buses', icon: <Bus className="w-3.5 h-3.5" /> },
                    { id: 'cab', label: 'Airport Cabs', icon: <Car className="w-3.5 h-3.5" /> },
                    { id: 'auto', label: 'Local Autos', icon: <Navigation className="w-3.5 h-3.5" /> },
                  ].map((m) => {
                    const active = preferences.preferredModes.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => toggleMode(m.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          active
                            ? 'bg-indigo-950 text-white border-indigo-950 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        {m.icon}
                        <span>{m.label}</span>
                        {active && <Check className="w-3 h-3 ml-auto text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Special Assistance Requirements */}
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  4. Special Assistance & Accommodation Notes
                </label>
                <p className="text-[11px] text-slate-500 mb-1.5">
                  Provide ongoing accommodation requests so operators can prepare ahead for your journeys.
                </p>
                <textarea
                  rows={2}
                  value={preferences.specialAssistance}
                  onChange={(e) => setPreferences((p) => ({ ...p, specialAssistance: e.target.value }))}
                  placeholder="e.g. Wheelchair assistance required at domestic terminal, lower berth preferred for senior citizen, dietary meal requests."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 placeholder:text-slate-400"
                />
              </div>

              {/* 5. Communication & Alert Preferences */}
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  5. Trip Notification Alerts
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  Stay updated on schedule changes, gate arrivals, and transfer guidance.
                </p>
                <div className="space-y-2 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/70">
                  <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
                    <span className="font-medium">SMS Journey Alerts & Gate Updates</span>
                    <input
                      type="checkbox"
                      checked={preferences.smsNotifications}
                      onChange={(e) => setPreferences((p) => ({ ...p, smsNotifications: e.target.checked }))}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </label>
                  <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
                    <span className="font-medium">WhatsApp Transfer Window Reminders</span>
                    <input
                      type="checkbox"
                      checked={preferences.whatsappUpdates}
                      onChange={(e) => setPreferences((p) => ({ ...p, whatsappUpdates: e.target.checked }))}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </label>
                  <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
                    <span className="font-medium">E-Ticket & Booking Receipt Emails</span>
                    <input
                      type="checkbox"
                      checked={preferences.emailReceipts}
                      onChange={(e) => setPreferences((p) => ({ ...p, emailReceipts: e.target.checked }))}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Account Overview */}
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{user?.name || 'Verified Traveler'}</h3>
                    <p className="text-xs text-slate-500 font-mono">{user?.email}</p>
                    {user?.phone && <p className="text-[11px] text-slate-400 mt-0.5">{user.phone}</p>}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2 text-[11px] text-emerald-700 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Authenticated Session Active • 256-Bit SSL Protected</span>
                </div>
              </div>

              {/* Data & Privacy Description */}
              <div className="space-y-2 text-xs text-slate-600">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Account Protection & Data Integrity</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Your profile details and booking histories are stored securely. We only share passenger names and contact phone numbers with verified transport operators for ticketing, gate access, and emergency travel updates.
                </p>
              </div>

              {/* Sign Out Action with Destructive Warning Confirmation */}
              <div className="pt-4 border-t border-slate-200/80">
                {showSignoutConfirm ? (
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-3">
                    <div>
                      <div className="font-bold text-rose-900 text-xs">Are you sure you want to sign out?</div>
                      <p className="text-[11px] text-rose-700 mt-0.5">
                        Your confirmed bookings and saved itineraries remain safe in your account. You will need to sign in again to view your tickets.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowSignoutConfirm(false)}
                        className="px-3 py-1.5 rounded-xl border border-rose-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                      >
                        Stay Signed In
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          logout();
                        }}
                        className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Confirm Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowSignoutConfirm(true)}
                    className="w-full py-2.5 px-4 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Sign Out of Account</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close
          </button>

          {activeTab === 'preferences' && (
            <button
              type="submit"
              form="preferences-form"
              className="px-5 py-2.5 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-white text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-indigo-300" />
              <span>Save Travel Preferences</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
