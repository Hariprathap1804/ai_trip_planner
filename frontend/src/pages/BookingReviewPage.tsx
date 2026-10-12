import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Mail, Phone, ArrowLeft, CheckCircle, Sparkles, AlertTriangle } from 'lucide-react';
import { useBookingStore } from '../store/useBookingStore';
import { Passenger } from '../types/booking';

export const BookingReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeDraftJourney, createBooking, isLoading, error } = useBookingStore();

  const [fullName, setFullName] = useState('Rahul Nair');
  const [age, setAge] = useState<number>(31);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [email, setEmail] = useState('rahul.nair@example.com');
  const [phone, setPhone] = useState('+91 98450 12345');
  const [seatPreference, setSeatPreference] = useState('Window Seat');
  const [notes, setNotes] = useState('');

  if (!activeDraftJourney) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">No Journey Selected</h2>
        <p className="text-xs text-slate-500">Please choose a flight, train, bus, or multimodal route first.</p>
        <button
          type="button"
          onClick={() => navigate('/explore')}
          className="px-4 py-2 bg-indigo-950 text-white rounded-xl text-xs font-semibold cursor-pointer"
        >
          Explore Journeys
        </button>
      </div>
    );
  }

  const baseFare = activeDraftJourney.total_fare;
  const taxes = Math.round(baseFare * 0.12);
  const totalAmount = baseFare + taxes;

  const handleFillDemo = () => {
    setFullName('Pooja Sundaram');
    setAge(27);
    setGender('female');
    setEmail('pooja.s@example.com');
    setPhone('+91 99001 88776');
    setSeatPreference('Aisle Seat');
    setNotes('Vegetarian snack meal preference.');
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    const passenger: Passenger = {
      full_name: fullName,
      age,
      gender,
      seat_preference: seatPreference,
      email,
      phone,
    };

    try {
      const confirmed = await createBooking({
        journey: activeDraftJourney,
        passengers: [passenger],
        contact_email: email,
        contact_phone: phone,
        notes,
      });
      navigate(`/booking/confirmation/${confirmed.id}`);
    } catch (err) {
      console.error('Booking creation error:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Results
      </button>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Review & Confirm Demo Booking</h1>
        <p className="text-xs text-slate-500">
          Complete passenger details to simulate booking issuance. No actual payment will be taken.
        </p>
      </div>

      {/* Demo Warning Banner */}
      <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-800 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Simulated Prototype Transaction:</span> This booking is created in the demo database (Supabase/FastAPI) and generates a realistic prototype PNR reference. No tickets or cards are charged.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Passenger details form */}
        <form onSubmit={handleConfirm} className="md:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              Demo Passenger Details
            </h3>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-xs font-semibold text-violet-700 hover:text-violet-900 flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-600" />
              Auto-fill Demo Traveller
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Age</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value) || 25)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Seat Preference</label>
              <input
                type="text"
                value={seatPreference}
                onChange={(e) => setSeatPreference(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-indigo-950 to-blue-700 hover:from-indigo-900 hover:to-blue-600 text-white font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{isLoading ? 'Processing Demo Booking...' : 'Confirm Demo Booking'}</span>
          </button>
        </form>

        {/* Selected Itinerary & Fare Breakdown */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
              Selected Itinerary
            </h3>

            <div>
              <div className="text-xs font-bold text-slate-900">
                {activeDraftJourney.origin.city} → {activeDraftJourney.destination.city}
              </div>
              <div className="text-[11px] text-slate-500">
                {activeDraftJourney.legs[0]?.operator} • {activeDraftJourney.modes.join(' + ').toUpperCase()}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Base Fare</span>
                <span className="font-mono font-medium">₹{baseFare.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Simulated Taxes & Fees (12%)</span>
                <span className="font-mono font-medium">₹{taxes.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Demo Discount</span>
                <span className="font-mono text-emerald-600">- ₹0</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 text-sm pt-2 border-t border-slate-200">
                <span>Total Amount</span>
                <span className="font-mono text-base text-indigo-950">₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
