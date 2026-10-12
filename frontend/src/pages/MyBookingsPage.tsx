import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Calendar, AlertCircle, X, Check, ShieldCheck, ArrowRight } from 'lucide-react';
import { useBookingStore } from '../store/useBookingStore';
import { DemoBooking, BookingStatus } from '../types/booking';

export const MyBookingsPage: React.FC = () => {
  const { bookings, fetchBookings, cancelBooking, isLoading } = useBookingStore();
  const [activeTab, setActiveTab] = useState<'ALL' | BookingStatus>('ALL');
  const [cancellingBooking, setCancellingBooking] = useState<DemoBooking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'ALL') return true;
    return b.status === activeTab;
  });

  const handleConfirmCancel = async () => {
    if (cancellingBooking) {
      await cancelBooking(cancellingBooking.id);
      setCancellingBooking(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Bookings</h1>
          <p className="text-xs text-slate-500">
            Review simulated boarding passes, view itineraries, or cancel demo bookings.
          </p>
        </div>

        <Link
          to="/explore"
          className="px-4 py-2 bg-indigo-950 hover:bg-indigo-900 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <span>Book Another Trip</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('ALL')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'ALL' ? 'bg-indigo-950 text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All ({bookings.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('CONFIRMED')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'CONFIRMED' ? 'bg-indigo-950 text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Confirmed ({bookings.filter((b) => b.status === 'CONFIRMED').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('COMPLETED')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'COMPLETED' ? 'bg-indigo-950 text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Completed ({bookings.filter((b) => b.status === 'COMPLETED').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('CANCELLED')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'CANCELLED' ? 'bg-indigo-950 text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Cancelled ({bookings.filter((b) => b.status === 'CANCELLED').length})
        </button>
      </div>

      {/* Booking List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/90 space-y-3">
          <Ticket className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 text-sm">No Bookings Found</h3>
          <p className="text-xs text-slate-500">There are no bookings matching this status category.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const j = b.journey;
            const isConfirmed = b.status === 'CONFIRMED';
            const isCancelled = b.status === 'CANCELLED';

            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                      {b.reference_number}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        isConfirmed
                          ? 'bg-emerald-50 text-emerald-700'
                          : isCancelled
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {b.status}
                    </span>
                    <span className="text-xs text-slate-400">• {new Date(b.created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="font-bold text-base text-slate-900">
                    {j.origin.city} → {j.destination.city}
                  </div>
                  <div className="text-xs text-slate-500">
                    {j.legs[0]?.operator} • Passenger: {b.passengers[0]?.full_name}
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-5 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Total Fare</span>
                    <span className="text-base font-extrabold font-mono text-slate-900">
                      ₹{b.fare_breakdown.total_amount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/booking/confirmation/${b.id}`}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700"
                    >
                      View Pass
                    </Link>

                    {isConfirmed && (
                      <button
                        type="button"
                        onClick={() => setCancellingBooking(b)}
                        className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
                      >
                        Cancel Demo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Cancellations */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-slate-900 text-base">Cancel Simulated Booking?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to cancel reference <strong>{cancellingBooking.reference_number}</strong>?
                This will update the demo status in Supabase.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancellingBooking(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-xs cursor-pointer"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
