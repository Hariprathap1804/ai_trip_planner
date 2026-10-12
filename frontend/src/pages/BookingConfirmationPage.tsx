import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Ticket, Printer, ArrowRight, ShieldCheck, Compass, Calendar, MapPin } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { DemoBooking } from '../types/booking';

export const BookingConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<DemoBooking | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-3">
        <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Generating simulated travel voucher...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-3">
        <h2 className="text-lg font-bold text-slate-900">Booking Reference Not Found</h2>
        <Link to="/bookings" className="text-xs font-semibold text-indigo-600 underline">
          View My Bookings
        </Link>
      </div>
    );
  }

  const journey = booking.journey;
  const depTime = journey.departure_time.includes('T') ? journey.departure_time.split('T')[1].substring(0, 5) : journey.departure_time;
  const arrTime = journey.arrival_time.includes('T') ? journey.arrival_time.split('T')[1].substring(0, 5) : journey.arrival_time;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Confirmation Hero */}
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Demo Booking Confirmed!
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Your simulated travel pass has been issued and stored in your account.
        </p>
      </div>

      {/* Boarding Pass / Ticket Voucher Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
        {/* Ticket Header */}
        <div className="bg-indigo-950 text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-300">Simulated Pass</span>
              <div className="text-base font-bold tracking-tight">TripPilot AI Travel Voucher</div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-indigo-300 uppercase tracking-widest block">Reference / PNR</span>
            <span className="text-xl font-extrabold font-mono text-emerald-400 tracking-wider">
              {booking.reference_number}
            </span>
          </div>
        </div>

        {/* Ticket Body */}
        <div className="p-6 space-y-6">
          {/* Origin and Destination Stations */}
          <div className="flex items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase">Departure</div>
              <div className="text-2xl font-bold font-mono text-slate-900">{depTime}</div>
              <div className="text-sm font-bold text-slate-800">{journey.origin.city}</div>
              <div className="text-xs text-slate-500">{journey.origin.name}</div>
            </div>

            <div className="flex flex-col items-center flex-1 max-w-[140px]">
              <span className="text-[11px] font-semibold text-slate-500 mb-1">
                {Math.floor(journey.total_duration_minutes / 60)}h {journey.total_duration_minutes % 60}m
              </span>
              <div className="w-full flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-indigo-600" />
                <div className="h-0.5 flex-1 bg-slate-200" />
                <div className="w-2 h-2 rounded-full bg-indigo-600" />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 uppercase font-medium">
                {journey.modes.join(' + ')}
              </span>
            </div>

            <div className="text-right">
              <div className="text-xs font-semibold text-slate-400 uppercase">Arrival</div>
              <div className="text-2xl font-bold font-mono text-slate-900">{arrTime}</div>
              <div className="text-sm font-bold text-slate-800">{journey.destination.city}</div>
              <div className="text-xs text-slate-500">{journey.destination.name}</div>
            </div>
          </div>

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
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                {booking.status}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Total Fare (Simulated)</span>
              <span className="font-extrabold text-slate-900 font-mono text-sm">
                ₹{booking.fare_breakdown.total_amount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Persisted to demo database. Accessible anytime in My Bookings.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Pass</span>
            </button>

            <Link
              to="/bookings"
              className="px-4 py-1.5 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
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
