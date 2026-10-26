import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Ticket, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Check, 
  ShieldCheck, 
  ArrowRight, 
  User as UserIcon, 
  Lock,
  Copy,
  Clock,
  Compass,
  MapPin,
  RefreshCw,
  X
} from 'lucide-react';
import { useBookingStore } from '../store/useBookingStore';
import { useAuthStore } from '../store/useAuthStore';
import { DemoBooking, BookingStatus } from '../types/booking';

export const MyBookingsPage: React.FC = () => {
  const { bookings, fetchBookings, cancelBooking, isLoading } = useBookingStore();
  const { user, isAuthenticated, openAuthModal } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'ALL' | BookingStatus>('ALL');
  const [cancellingBooking, setCancellingBooking] = useState<DemoBooking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelSuccessMessage, setCancelSuccessMessage] = useState<string | null>(null);
  const [copiedPnr, setCopiedPnr] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings, isAuthenticated]);

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'ALL') return true;
    return b.status === activeTab;
  });

  const handleCopyPnr = (pnr: string) => {
    navigator.clipboard.writeText(pnr);
    setCopiedPnr(pnr);
    setTimeout(() => setCopiedPnr(null), 2000);
  };

  const handleConfirmCancel = async () => {
    if (cancellingBooking) {
      setIsCancelling(true);
      try {
        await cancelBooking(cancellingBooking.id);
        setCancelSuccessMessage(`Booking ${cancellingBooking.reference_number} was successfully cancelled. Your itinerary status has been updated.`);
        setCancellingBooking(null);
      } catch (e: any) {
        console.error(e);
      } finally {
        setIsCancelling(false);
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sign In to Access Your Bookings</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your travel itineraries, confirmed e-tickets, and receipts are stored securely with your account profile. Please sign in or create an account to view and manage your travel bookings.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => openAuthModal('login', 'Please sign in to view and manage your bookings.')}
            className="px-5 py-2.5 bg-indigo-950 hover:bg-indigo-900 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all"
          >
            Sign In to Account
          </button>
          <button
            type="button"
            onClick={() => openAuthModal('register', 'Create an account to start booking journeys and saving itineraries.')}
            className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all"
          >
            Create Free Account
          </button>
        </div>
      </div>
    );
  }

  const confirmedCount = bookings.filter((b) => b.status === 'CONFIRMED').length;
  const completedCount = bookings.filter((b) => b.status === 'COMPLETED').length;
  const cancelledCount = bookings.filter((b) => b.status === 'CANCELLED').length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. Page Header & Quick Plan CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-semibold mb-2">
            <Ticket className="w-3.5 h-3.5 text-indigo-600" />
            <span>Itinerary & Ticket Management</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Bookings</h1>
          <p className="text-xs text-slate-600 mt-1">
            Manage your travel reservations, access confirmed e-tickets, and track journey statuses across all transport legs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Link
            to="/explore"
            className="px-4 py-2.5 bg-indigo-950 hover:bg-indigo-900 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <span>Plan Another Journey</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 2. Cancellation Success Feedback Alert */}
      {cancelSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 flex items-start justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Cancellation Confirmed: </span>
              <span>{cancelSuccessMessage}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCancelSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. Account Status Notice */}
      {user && (
        <div className="p-3.5 px-4 rounded-2xl bg-indigo-50/80 border border-indigo-200/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-indigo-950">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              Showing reservations for <strong className="font-semibold text-indigo-900">{user.name}</strong> ({user.email})
            </span>
          </div>
          <span className="text-[11px] font-semibold text-indigo-700 bg-white/80 px-2.5 py-1 rounded-lg border border-indigo-100 self-start sm:self-auto">
            Personal Account • Instant Sync
          </span>
        </div>
      )}

      {/* 4. Booking Status Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs font-semibold overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('ALL')}
          className={`px-3.5 py-2 rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'ALL' ? 'bg-indigo-950 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          All Bookings ({bookings.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('CONFIRMED')}
          className={`px-3.5 py-2 rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'CONFIRMED' ? 'bg-indigo-950 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Upcoming / Confirmed ({confirmedCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('COMPLETED')}
          className={`px-3.5 py-2 rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'COMPLETED' ? 'bg-indigo-950 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Completed ({completedCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('CANCELLED')}
          className={`px-3.5 py-2 rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'CANCELLED' ? 'bg-indigo-950 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Cancelled ({cancelledCount})
        </button>
      </div>

      {/* 5. Bookings List & Cards */}
      {filteredBookings.length === 0 ? (
        bookings.length === 0 ? (
          /* Empty state when user has 0 bookings overall */
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-2xs">
              <Compass className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-base">No Travel Bookings Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                You haven't made any travel reservations yet. Search and compare flights, trains, buses, cabs, and multimodal routes to book your first journey.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                to="/explore"
                className="px-5 py-2.5 bg-indigo-950 hover:bg-indigo-900 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-1.5"
              >
                <span>Explore Journeys & Book Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/planner"
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all inline-flex items-center gap-1.5"
              >
                <span>Open Trip Planner</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Empty state for the selected status tab */
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200/90 space-y-3">
            <Ticket className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-900 text-sm">
              No {activeTab === 'CONFIRMED' ? 'Upcoming / Confirmed' : activeTab === 'COMPLETED' ? 'Completed' : 'Cancelled'} Bookings
            </h3>
            <p className="text-xs text-slate-500">
              There are currently no travel itineraries matching the "{activeTab.toLowerCase()}" filter.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab('ALL')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline cursor-pointer pt-1"
            >
              View All Bookings ({bookings.length})
            </button>
          </div>
        )
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const j = b.journey;
            const isConfirmed = b.status === 'CONFIRMED';
            const isCancelled = b.status === 'CANCELLED';
            const isCompleted = b.status === 'COMPLETED';

            const depTime = j.departure_time?.includes('T') ? j.departure_time.split('T')[1].substring(0, 5) : j.departure_time || '--:--';
            const arrTime = j.arrival_time?.includes('T') ? j.arrival_time.split('T')[1].substring(0, 5) : j.arrival_time || '--:--';
            const formattedDate = new Date(b.created_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={b.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all space-y-4"
              >
                {/* Card Top: PNR, Status Badge, Booking Date */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* PNR Reference badge */}
                    <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg text-slate-800 font-mono text-xs font-bold">
                      <span className="text-[10px] text-slate-500 font-sans font-semibold">PNR</span>
                      <span>{b.reference_number}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyPnr(b.reference_number)}
                        title="Copy PNR Reference"
                        className="p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {copiedPnr === b.reference_number ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    {/* Booking Status Badge */}
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide flex items-center gap-1 ${
                        isConfirmed
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/70'
                          : isCancelled
                          ? 'bg-rose-50 text-rose-800 border border-rose-200/70'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {isConfirmed && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      {isCancelled && <XCircle className="w-3 h-3 text-rose-600" />}
                      {isCompleted && <Check className="w-3 h-3 text-slate-500" />}
                      <span>
                        {isConfirmed ? 'Confirmed & Active' : isCancelled ? 'Reservation Cancelled' : 'Trip Completed'}
                      </span>
                    </span>

                    {/* Payment verification badge */}
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{b.payment_method?.includes('razorpay') ? 'Paid via Razorpay' : 'Paid Online'}</span>
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 font-medium">
                    Booked on {formattedDate}
                  </div>
                </div>

                {/* Card Middle: Route Timeline & Journey Details */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Origin to Destination */}
                  <div className="md:col-span-8 flex items-center gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                    <div className="min-w-0">
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Departure</div>
                      <div className="font-mono font-extrabold text-base text-slate-900">{depTime}</div>
                      <div className="text-slate-800 font-bold text-sm truncate">{j.origin.city}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[150px]">{j.origin.name}</div>
                    </div>

                    <div className="flex flex-col items-center flex-1 max-w-[120px] shrink-0 text-slate-400">
                      <span className="text-[10px] font-mono font-medium text-slate-500">
                        {Math.floor(j.total_duration_minutes / 60)}h {j.total_duration_minutes % 60}m
                      </span>
                      <div className="w-full flex items-center gap-1 my-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                        <div className="h-0.5 flex-1 bg-slate-300" />
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                      </div>
                      <span className="text-[9px] uppercase font-bold text-slate-600 tracking-wider">
                        {j.modes.join(' + ')}
                      </span>
                    </div>

                    <div className="min-w-0 text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Arrival</div>
                      <div className="font-mono font-extrabold text-base text-slate-900">{arrTime}</div>
                      <div className="text-slate-800 font-bold text-sm truncate">{j.destination.city}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[150px]">{j.destination.name}</div>
                    </div>
                  </div>

                  {/* Passenger and Leg Summary */}
                  <div className="md:col-span-4 space-y-1.5 text-xs text-slate-600 pl-2">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <UserIcon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span className="truncate">{b.passengers[0]?.full_name || 'Primary Traveller'}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <span>Seat preference:</span>
                      <span className="font-medium text-slate-700">{b.passengers[0]?.seat_preference || 'Standard'}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      <span>Service: </span>
                      <span className="font-medium text-slate-700">
                        {j.legs?.[0]?.operator || 'Transit Carrier'} {j.legs?.length && j.legs.length > 1 ? `(${j.legs.length} connected legs)` : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Bottom: Total Fare & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Paid</div>
                    <div className="font-mono font-extrabold text-lg text-slate-900">
                      ₹{b.fare_breakdown.total_amount.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400">Includes all taxes and service fees</div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Link
                      to={`/booking/confirmation/${b.id}`}
                      className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>View E-Ticket & Receipt</span>
                    </Link>

                    {isConfirmed && (
                      <button
                        type="button"
                        onClick={() => setCancellingBooking(b)}
                        className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Cancel Booking
                      </button>
                    )}

                    {isCancelled && (
                      <span className="text-[11px] text-slate-400 italic">
                        Cancelled • No further action required
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. Confirmation Modal for Cancellations */}
      {cancellingBooking && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget && !isCancelling) setCancellingBooking(null); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-bold text-slate-900 text-base">Cancel Travel Reservation?</h3>
              <p className="text-xs text-slate-600">
                Are you sure you want to cancel booking for <strong>{cancellingBooking.journey.origin.city} → {cancellingBooking.journey.destination.city}</strong> (PNR: <span className="font-mono font-bold text-slate-800">{cancellingBooking.reference_number}</span>)?
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-600 space-y-1">
              <div className="font-bold text-slate-800 text-[11px]">What happens next:</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Your reservation status will update to <strong>Cancelled</strong> immediately and any reserved seats will be released back into operator inventory. Eligible refunds are processed to your original payment method in accordance with operator cancellation policies.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => setCancellingBooking(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleConfirmCancel}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all"
              >
                {isCancelling ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>Confirm Cancellation</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Trip Planner Discovery Prompt */}
      <div className="bg-gradient-to-r from-slate-50 to-indigo-50/40 rounded-3xl p-6 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-slate-900 text-sm">Need a connected door-to-door itinerary?</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Plan complex routes combining flights, high-speed rail, metro, and cabs with verified transfer windows.
          </p>
        </div>
        <Link
          to="/planner"
          className="px-4 py-2 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-xs font-bold text-indigo-900 transition-colors shadow-2xs whitespace-nowrap self-start sm:self-auto"
        >
          Open Multimodal Trip Planner →
        </Link>
      </div>
    </div>
  );
};
