import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Ticket, 
  Printer, 
  ArrowRight, 
  ShieldCheck, 
  Compass, 
  Calendar, 
  MapPin, 
  Copy, 
  Check, 
  Clock, 
  User, 
  Mail, 
  Phone,
  Plane,
  Train,
  Bus,
  Car,
  Navigation,
  Layers,
  CreditCard
} from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { DemoBooking } from '../types/booking';
import { TransportMode } from '../types/journey';

const getModeIcon = (mode: TransportMode) => {
  switch (mode) {
    case 'flight':
      return <Plane className="w-3.5 h-3.5 text-sky-600" />;
    case 'train':
      return <Train className="w-3.5 h-3.5 text-emerald-600" />;
    case 'metro':
      return <Layers className="w-3.5 h-3.5 text-purple-600" />;
    case 'bus':
      return <Bus className="w-3.5 h-3.5 text-amber-600" />;
    case 'cab':
      return <Car className="w-3.5 h-3.5 text-blue-600" />;
    case 'auto':
      return <Navigation className="w-3.5 h-3.5 text-yellow-600" />;
    default:
      return <Navigation className="w-3.5 h-3.5 text-indigo-600" />;
  }
};

export const BookingConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<DemoBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedPnr, setCopiedPnr] = useState(false);

  useEffect(() => {
    if (id) {
      apiClient
        .getBookingById(id)
        .then((b) => {
          setBooking(b);
          setLoading(false);
        })
        .catch((e) => {
          console.error(e);
          setLoading(false);
        });
    }
  }, [id]);

  const handleCopyPnr = (pnr: string) => {
    navigator.clipboard.writeText(pnr);
    setCopiedPnr(true);
    setTimeout(() => setCopiedPnr(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <div className="space-y-1">
          <h3 className="font-bold text-slate-900 text-sm">Confirming Your Reservation</h3>
          <p className="text-xs text-slate-500">Retrieving official e-ticket and booking confirmation details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <Ticket className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900">Booking Reference Not Found</h2>
          <p className="text-xs text-slate-500">
            We could not find a confirmed reservation matching this reference. It may have expired or been placed under another account.
          </p>
        </div>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Link
            to="/bookings"
            className="px-4 py-2 rounded-xl bg-indigo-950 text-white text-xs font-bold hover:bg-indigo-900 transition-colors"
          >
            View My Bookings
          </Link>
          <Link
            to="/explore"
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            Explore Routes
          </Link>
        </div>
      </div>
    );
  }

  const journey = booking.journey;
  const depTime = journey.departure_time.includes('T') ? journey.departure_time.split('T')[1].substring(0, 5) : journey.departure_time;
  const arrTime = journey.arrival_time.includes('T') ? journey.arrival_time.split('T')[1].substring(0, 5) : journey.arrival_time;
  const bookingDate = new Date(booking.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* 1. Confirmation Hero */}
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Booking Confirmed!
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            Your travel reservation has been confirmed and saved to your account. Your verified e-ticket and PNR reference are ready below.
          </p>
        </div>
      </div>

      {/* 2. Boarding Pass / Ticket Voucher Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
        {/* Ticket Header */}
        <div className="bg-indigo-950 text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-300">
                Official E-Ticket & Voucher
              </span>
              <div className="text-base font-bold tracking-tight">TripPilot Travel Reservation</div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:text-right">
            <div>
              <span className="text-[10px] text-indigo-300 uppercase tracking-widest block font-medium">
                Reference / PNR
              </span>
              <div className="flex items-center gap-1.5 justify-end">
                <span className="text-xl font-extrabold font-mono text-emerald-400 tracking-wider">
                  {booking.reference_number}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyPnr(booking.reference_number)}
                  title="Copy PNR Reference"
                  className="p-1 rounded-md bg-indigo-900 text-indigo-300 hover:text-white hover:bg-indigo-800 cursor-pointer transition-colors"
                >
                  {copiedPnr ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Body */}
        <div className="p-6 space-y-6">
          {/* Origin and Destination Stations */}
          <div className="flex items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Departure</div>
              <div className="text-2xl font-bold font-mono text-slate-900">{depTime}</div>
              <div className="text-sm font-bold text-slate-800">{journey.origin.city}</div>
              <div className="text-xs text-slate-500">{journey.origin.name}</div>
            </div>

            <div className="flex flex-col items-center flex-1 max-w-[150px]">
              <span className="text-[11px] font-mono font-semibold text-slate-600 mb-1">
                {Math.floor(journey.total_duration_minutes / 60)}h {journey.total_duration_minutes % 60}m
              </span>
              <div className="w-full flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-indigo-600" />
                <div className="h-0.5 flex-1 bg-slate-300" />
                <div className="w-2 h-2 rounded-full bg-indigo-600" />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-wider">
                {journey.modes.join(' + ')}
              </span>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Arrival</div>
              <div className="text-2xl font-bold font-mono text-slate-900">{arrTime}</div>
              <div className="text-sm font-bold text-slate-800">{journey.destination.city}</div>
              <div className="text-xs text-slate-500">{journey.destination.name}</div>
            </div>
          </div>

          {/* Connected Journey Legs (if multi-segment) */}
          {journey.legs && journey.legs.length > 1 && (
            <div className="space-y-3 pb-6 border-b border-slate-100">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
                <span>Itinerary Leg Schedule ({journey.legs.length} connected legs)</span>
                <span className="text-[11px] text-slate-400 font-normal">Door-to-door timeline</span>
              </div>

              <div className="space-y-2">
                {journey.legs.map((leg, idx) => {
                  const legDep = leg.departure_time?.includes('T') ? leg.departure_time.split('T')[1].substring(0, 5) : leg.departure_time;
                  const legArr = leg.arrival_time?.includes('T') ? leg.arrival_time.split('T')[1].substring(0, 5) : leg.arrival_time;

                  return (
                    <div
                      key={leg.id || idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-indigo-950 text-white font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {getModeIcon(leg.mode)}
                          <span className="font-bold text-slate-900">{leg.operator}</span>
                          {leg.service_number && (
                            <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                              ({leg.service_number})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-slate-600 font-mono text-[11px]">
                        <span>{legDep} {leg.origin.city}</span>
                        <span className="text-slate-400">→</span>
                        <span>{legArr} {leg.destination.city}</span>
                        <span className="text-[10px] text-slate-400">({leg.duration_minutes}m)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Passenger & Fare Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Primary Passenger</span>
              <span className="font-bold text-slate-800">{booking.passengers[0]?.full_name || 'Traveller'}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Seat Allocation</span>
              <span className="font-semibold text-slate-800">{booking.passengers[0]?.seat_preference || 'Standard'}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Booking Status</span>
              <span className="font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md inline-block uppercase">
                {booking.status === 'CONFIRMED' ? 'Confirmed & Active' : booking.status}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Total Paid</span>
              <span className="font-extrabold text-slate-900 font-mono text-sm">
                ₹{booking.fare_breakdown.total_amount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Payment Verification Receipt */}
          <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-900">Payment & Verification Receipt</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {booking.payment_status || 'PAID'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Gateway</span>
                <span className="font-semibold text-slate-800">
                  {booking.payment_method?.includes('razorpay') ? 'Razorpay Secure Checkout' : 'Online Payment'}
                </span>
              </div>
              {booking.razorpay_payment_id && (
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Payment ID</span>
                  <span className="font-mono text-xs font-semibold text-indigo-950 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                    {booking.razorpay_payment_id}
                  </span>
                </div>
              )}
              {booking.razorpay_order_id && (
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Order Reference</span>
                  <span className="font-mono text-[11px] text-slate-600 truncate block">
                    {booking.razorpay_order_id}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500">
              <span>Date: {bookingDate}</span>
              <span>Contact: {booking.contact_email} • {booking.contact_phone}</span>
            </div>
          </div>

          {/* Passenger Notice */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-950 space-y-1">
            <span className="font-bold text-[11px] block">Travel Instructions:</span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Please arrive at departure stations at least 20–30 minutes before departure (90 minutes for airport terminals). You can present this digital e-ticket or quote your PNR reference ({booking.reference_number}) during boarding.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Saved to your personal account. Accessible anytime in My Bookings.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Ticket</span>
            </button>

            <Link
              to="/bookings"
              className="px-4 py-2 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <span>Manage in My Bookings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
