import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  User,
  Check,
  ArrowRight,
  Route,
  Clock,
  IndianRupee,
  CreditCard,
  ShieldCheck,
  Zap,
  AlertCircle,
  Plane,
  Train,
  Bus,
  Car,
} from 'lucide-react';
import { AIMessage } from '../../types/ai';
import { useAiStore } from '../../store/useAiStore';
import { useBookingStore } from '../../store/useBookingStore';
import { useAuthStore } from '../../store/useAuthStore';
import { apiClient } from '../../services/apiClient';
import { Passenger } from '../../types/booking';
import { loadRazorpayScript } from '../../services/razorpay';

interface AIMessageBubbleProps {
  message: AIMessage;
}

export const AIMessageBubble: React.FC<AIMessageBubbleProps> = ({ message }) => {
  const navigate = useNavigate();
  const { executeAction, setIsOpen } = useAiStore();
  const { setDraftJourney, verifyAndBook } = useBookingStore();
  const { user: authUser, isAuthenticated, openAuthModal } = useAuthStore();
  const isUser = message.sender === 'user';

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [quickPayError, setQuickPayError] = useState<string | null>(null);

  const action = message.action_proposal?.action;
  const isMultimodal = action === 'plan_multimodal_trip';
  const isQuickBook = action === 'quick_book';
  const params = message.action_proposal?.parameters;

  const itinerary = params?.itinerary;
  const journey = params?.journey;
  const totalAmount = params?.total_amount || (journey ? Math.round(journey.total_fare * 1.12) : 1000);

  const handleOpenPlanner = async () => {
    if (message.action_proposal && !message.action_executed) {
      await executeAction(message.action_proposal);
    }
    setIsOpen(false);
    navigate('/planner');
  };

  const handleBookMultimodal = async () => {
    if (message.action_proposal && !message.action_executed) {
      await executeAction(message.action_proposal);
    }
    if (itinerary) {
      setDraftJourney(itinerary);
      setIsOpen(false);
      navigate('/booking/review');
    } else {
      setIsOpen(false);
      navigate('/planner');
    }
  };

  const handleReviewBeforeBooking = () => {
    if (journey) {
      setDraftJourney(journey);
      setIsOpen(false);
      navigate('/booking/review');
    }
  };

  const handleQuickPayRazorpay = async () => {
    if (!journey) return;

    // Strict Auth Gatekeeper
    if (!isAuthenticated) {
      openAuthModal('login', 'Please sign in or create an account to book your trip immediately with AI.');
      return;
    }

    setIsProcessingPayment(true);
    setQuickPayError(null);

    try {
      // 1. Fetch payment config & ensure Razorpay script loaded
      const cfg = await apiClient.getPaymentConfig();
      await loadRazorpayScript();

      // 2. Create server-side order in paise
      const orderRes = await apiClient.createPaymentOrder({
        amount: totalAmount,
        currency: 'INR',
        notes: {
          flow: 'ai_quick_booking',
          journey_id: journey.id,
          route: `${journey.origin.city} - ${journey.destination.city}`,
        },
      });

      const order = orderRes.order;

      // Authenticated traveller details
      const defaultPassenger: Passenger = {
        full_name: authUser?.name || 'Rahul Nair',
        age: 31,
        gender: 'male',
        seat_preference: 'Window Seat',
        email: authUser?.email || 'rahul.nair@example.com',
        phone: authUser?.phone || '+91 98450 12345',
      };

      // 3. Launch authentic Razorpay Checkout modal
      if (window.Razorpay && !order.is_simulated && cfg.has_live_credentials) {
        const rzp = new window.Razorpay({
          key: order.key_id,
          amount: order.amount_paise,
          currency: order.currency,
          name: 'TripPilot AI Quick Book',
          description: `${journey.origin.city} to ${journey.destination.city} (${journey.modes.join('+').toUpperCase()})`,
          order_id: order.order_id,
          prefill: {
            name: defaultPassenger.full_name,
            email: defaultPassenger.email,
            contact: defaultPassenger.phone,
          },
          notes: {
            journey_id: journey.id,
          },
          theme: {
            color: '#1e1b4b',
          },
          handler: async (response) => {
            try {
              const confirmed = await verifyAndBook({
                order_id: response.razorpay_order_id || order.order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                booking_payload: {
                  journey_id: journey.id,
                  journey: journey,
                  passengers: [defaultPassenger],
                  contact_email: defaultPassenger.email,
                  contact_phone: defaultPassenger.phone,
                  notes: 'Quick booked directly from TripPilot AI Assistant.',
                },
                journey_data: journey,
              });

              setIsOpen(false);
              navigate(`/booking/confirmation/${confirmed.id}`);
            } catch (vErr: any) {
              setQuickPayError(vErr.message || 'Signature verification failed.');
              setIsProcessingPayment(false);
            }
          },
          modal: {
            ondismiss: () => {
              setIsProcessingPayment(false);
            },
          },
        });

        rzp.open();
        return;
      }

      // 4. Test Simulation Fallback
      const simulatedPaymentId = `pay_${Math.random().toString(36).substring(2, 12)}`;
      const simulatedSignature = `sig_demo_${Math.random().toString(36).substring(2, 16)}`;

      const confirmed = await verifyAndBook({
        order_id: order.order_id,
        payment_id: simulatedPaymentId,
        signature: simulatedSignature,
        booking_payload: {
          journey_id: journey.id,
          journey: journey,
          passengers: [defaultPassenger],
          contact_email: defaultPassenger.email,
          contact_phone: defaultPassenger.phone,
          notes: 'Quick booked via AI Assistant (Test Simulation).',
        },
        journey_data: journey,
      });

      setIsOpen(false);
      navigate(`/booking/confirmation/${confirmed.id}`);
    } catch (err: any) {
      setQuickPayError(err.message || 'Failed to initialize payment.');
      setIsProcessingPayment(false);
    }
  };

  const renderModeIcon = (mode: string) => {
    switch (mode?.toLowerCase()) {
      case 'flight':
        return <Plane className="w-3.5 h-3.5 text-blue-600" />;
      case 'train':
        return <Train className="w-3.5 h-3.5 text-emerald-600" />;
      case 'bus':
        return <Bus className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <Car className="w-3.5 h-3.5 text-indigo-600" />;
    }
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} text-xs leading-relaxed`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      )}

      <div className={`max-w-[85%] space-y-2`}>
        <div
          className={`p-3.5 rounded-2xl ${
            isUser
              ? 'bg-indigo-950 text-white rounded-tr-none'
              : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none shadow-xs'
          }`}
        >
          <div className="whitespace-pre-line">{message.text}</div>
          <div className={`text-[10px] mt-1 text-right ${isUser ? 'text-indigo-200/70' : 'text-slate-400'}`}>
            {message.timestamp}
          </div>
        </div>

        {/* Structured Action Proposal Card */}
        {message.action_proposal && (
          <div className="bg-violet-50/90 border border-violet-200/80 rounded-xl p-3 text-xs space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between text-violet-900 font-bold">
              <span className="flex items-center gap-1.5">
                {isQuickBook ? (
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                ) : isMultimodal ? (
                  <Route className="w-3.5 h-3.5 text-violet-600" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                )}
                <span>
                  {isQuickBook ? 'QUICK BOOKING READY' : `ACTION: ${message.action_proposal.action.replace('_', ' ').toUpperCase()}`}
                </span>
              </span>
              {message.action_executed && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                  <Check className="w-3 h-3" />
                  Loaded
                </span>
              )}
            </div>

            <p className="text-slate-600 text-[11px]">{message.action_proposal.explanation}</p>

            {/* Quick Booking Journey Card */}
            {isQuickBook && journey && (
              <div className="bg-white rounded-xl p-3 border border-violet-200 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    {renderModeIcon(journey.modes[0] || 'flight')}
                    <span>{journey.legs[0]?.operator || 'Express Connection'}</span>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">
                    {journey.modes.join(' + ')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <div>
                    <div className="font-bold text-slate-800">{journey.origin.city}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {journey.departure_time.includes('T') ? journey.departure_time.split('T')[1].substring(0, 5) : journey.departure_time}
                    </div>
                  </div>

                  <div className="flex flex-col items-center px-2">
                    <span className="text-[9px] text-slate-400 font-medium">
                      {Math.floor(journey.total_duration_minutes / 60)}h {journey.total_duration_minutes % 60}m
                    </span>
                    <div className="w-16 h-0.5 bg-slate-200 my-1 relative">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 absolute -top-0.5 left-1/2 -translate-x-1/2" />
                    </div>
                    <span className="text-[9px] text-emerald-600 font-semibold">
                      {journey.transfers_count === 0 ? 'Direct' : `${journey.transfers_count} transfer`}
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-slate-800">{journey.destination.city}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {journey.arrival_time.includes('T') ? journey.arrival_time.split('T')[1].substring(0, 5) : journey.arrival_time}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                  <span className="text-slate-500 font-medium">Total (Inc. Taxes):</span>
                  <span className="font-mono font-extrabold text-sm text-indigo-950">
                    ₹{totalAmount.toLocaleString()}
                  </span>
                </div>

                {quickPayError && (
                  <div className="bg-rose-50 border border-rose-200 p-2 rounded-lg text-[10px] text-rose-700 flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span>{quickPayError}</span>
                  </div>
                )}

                <div className="space-y-1.5 pt-1">
                  <button
                    type="button"
                    disabled={isProcessingPayment}
                    onClick={handleQuickPayRazorpay}
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 hover:from-emerald-500 hover:to-indigo-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                  >
                    {isProcessingPayment ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Opening Razorpay Gateway...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Book & Pay Now • ₹{totalAmount.toLocaleString()}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleReviewBeforeBooking}
                    className="w-full py-1.5 px-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium text-[11px] rounded-lg border border-slate-200/80 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Customize Traveller Details</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </button>
                </div>
              </div>
            )}

            {/* Multimodal Preview Details */}
            {isMultimodal && !isQuickBook && (
              <div className="bg-white/90 p-2.5 rounded-lg border border-violet-100 space-y-1.5">
                <div className="flex items-center justify-between font-mono font-bold text-[11px] text-slate-800">
                  <span>
                    {params?.modes?.map((m: string) => m.toUpperCase()).join(' → ') || 'MULTIMODAL ROUTE'}
                  </span>
                  {itinerary?.total_fare && (
                    <span className="text-emerald-700">₹{itinerary.total_fare.toLocaleString()}</span>
                  )}
                </div>

                {itinerary?.total_duration_minutes && (
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>
                      {Math.floor(itinerary.total_duration_minutes / 60)}h {itinerary.total_duration_minutes % 60}m door-to-door
                    </span>
                    <span>•</span>
                    <span>{itinerary.transfers_count} transfers</span>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons for standard actions */}
            {isMultimodal && !isQuickBook ? (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleOpenPlanner}
                  className="py-1.5 px-2 bg-white hover:bg-slate-50 text-indigo-950 font-bold text-[11px] rounded-lg border border-indigo-200 flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-xs"
                >
                  <Route className="w-3 h-3 text-indigo-600" />
                  <span>Open Planner</span>
                </button>

                <button
                  type="button"
                  onClick={handleBookMultimodal}
                  className="py-1.5 px-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-[11px] rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all shadow-xs"
                >
                  <span>Book Demo</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ) : !isQuickBook && !message.action_executed ? (
              <button
                type="button"
                onClick={() => executeAction(message.action_proposal!)}
                className="w-full py-1.5 px-3 bg-violet-700 hover:bg-violet-800 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
              >
                <span>Apply to Website View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
          <User className="w-3.5 h-3.5" />
        </div>
      )}
    </div>
  );
};
