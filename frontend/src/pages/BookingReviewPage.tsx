import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  User,
  Mail,
  Phone,
  ArrowLeft,
  CheckCircle,
  Sparkles,
  AlertTriangle,
  CreditCard,
  QrCode,
  Copy,
  Check,
  Lock,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { useBookingStore } from '../store/useBookingStore';
import { Passenger } from '../types/booking';
import { apiClient } from '../services/apiClient';
import { PaymentConfig, RazorpayOrder } from '../types/payment';
import { loadRazorpayScript, RAZORPAY_TEST_INFO } from '../services/razorpay';

export const BookingReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeDraftJourney, createBooking, verifyAndBook, isLoading, error } = useBookingStore();

  const [fullName, setFullName] = useState('Rahul Nair');
  const [age, setAge] = useState<number>(31);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [email, setEmail] = useState('rahul.nair@example.com');
  const [phone, setPhone] = useState('+91 98450 12345');
  const [seatPreference, setSeatPreference] = useState('Window Seat');
  const [notes, setNotes] = useState('');

  // Payment states
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'simulated'>('razorpay');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showSimulatedModal, setShowSimulatedModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<RazorpayOrder | null>(null);

  useEffect(() => {
    // Pre-load payment configuration and Razorpay script
    apiClient
      .getPaymentConfig()
      .then((cfg) => setPaymentConfig(cfg))
      .catch((err) => console.warn('Could not load payment configuration:', err));

    loadRazorpayScript().catch((err) => console.warn('Could not pre-load Razorpay SDK:', err));
  }, []);

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

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRazorpayPayment = async (order: RazorpayOrder, passenger: Passenger) => {
    // If Razorpay SDK is available on window and real/test keys are accepted
    if (window.Razorpay && !order.is_simulated && paymentConfig?.has_live_credentials) {
      try {
        const rzp = new window.Razorpay({
          key: order.key_id,
          amount: order.amount_paise,
          currency: order.currency,
          name: 'TripPilot AI',
          description: `${activeDraftJourney.origin.city} to ${activeDraftJourney.destination.city}`,
          order_id: order.order_id,
          prefill: {
            name: passenger.full_name,
            email: passenger.email,
            contact: passenger.phone,
          },
          notes: {
            journey_id: activeDraftJourney.id,
            origin: activeDraftJourney.origin.city,
            destination: activeDraftJourney.destination.city,
          },
          theme: {
            color: '#1e1b4b',
          },
          handler: async (response) => {
            try {
              setIsProcessingPayment(true);
              const confirmed = await verifyAndBook({
                order_id: response.razorpay_order_id || order.order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                booking_payload: {
                  journey_id: activeDraftJourney.id,
                  journey: activeDraftJourney,
                  passengers: [passenger],
                  contact_email: email,
                  contact_phone: phone,
                  notes,
                },
                journey_data: activeDraftJourney,
              });
              navigate(`/booking/confirmation/${confirmed.id}`);
            } catch (vErr: any) {
              setPaymentError(vErr.message || 'Payment signature verification failed.');
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
      } catch (sdkErr) {
        console.warn('Razorpay SDK modal open failed, triggering fallback test modal:', sdkErr);
      }
    }

    // In-app test simulator modal for demo keys or offline testing
    setCurrentOrder(order);
    setShowSimulatedModal(true);
    setIsProcessingPayment(false);
  };

  const handleSimulatedPaymentSuccess = async () => {
    if (!currentOrder) return;
    setIsProcessingPayment(true);
    setShowSimulatedModal(false);

    const passenger: Passenger = {
      full_name: fullName,
      age,
      gender,
      seat_preference: seatPreference,
      email,
      phone,
    };

    const simulatedPaymentId = `pay_${Math.random().toString(36).substring(2, 12)}`;
    const simulatedSignature = `sig_demo_${Math.random().toString(36).substring(2, 16)}`;

    try {
      const confirmed = await verifyAndBook({
        order_id: currentOrder.order_id,
        payment_id: simulatedPaymentId,
        signature: simulatedSignature,
        booking_payload: {
          journey_id: activeDraftJourney.id,
          journey: activeDraftJourney,
          passengers: [passenger],
          contact_email: email,
          contact_phone: phone,
          notes,
        },
        journey_data: activeDraftJourney,
      });
      navigate(`/booking/confirmation/${confirmed.id}`);
    } catch (err: any) {
      setPaymentError(err.message || 'Payment verification failed.');
      setIsProcessingPayment(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);
    setIsProcessingPayment(true);

    const passenger: Passenger = {
      full_name: fullName,
      age,
      gender,
      seat_preference: seatPreference,
      email,
      phone,
    };

    if (paymentMethod === 'simulated') {
      try {
        const confirmed = await createBooking({
          journey: activeDraftJourney,
          passengers: [passenger],
          contact_email: email,
          contact_phone: phone,
          notes,
        });
        navigate(`/booking/confirmation/${confirmed.id}`);
      } catch (err: any) {
        setPaymentError(err.message || 'Booking creation failed.');
        setIsProcessingPayment(false);
      }
      return;
    }

    // Razorpay Flow
    try {
      const orderRes = await apiClient.createPaymentOrder({
        amount: totalAmount,
        currency: 'INR',
        notes: {
          passenger_name: fullName,
          route: `${activeDraftJourney.origin.city} - ${activeDraftJourney.destination.city}`,
        },
      });

      if (!orderRes.success || !orderRes.order) {
        throw new Error('Could not initiate Razorpay order.');
      }

      await handleRazorpayPayment(orderRes.order, passenger);
    } catch (err: any) {
      setPaymentError(err.message || 'Failed to initialize payment gateway.');
      setIsProcessingPayment(false);
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Review & Confirm Booking</h1>
          <p className="text-xs text-slate-500">
            Enter traveller details and checkout with Razorpay Payment Gateway (Test Mode).
          </p>
        </div>

        {/* Razorpay Sandbox status badge */}
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200/80 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-950 self-start sm:self-auto shadow-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Razorpay Test Sandbox Active</span>
        </div>
      </div>

      {paymentError && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-800 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Transaction Issue: </span>
            {paymentError}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Passenger & Payment Form */}
        <form onSubmit={handleSubmit} className="md:col-span-7 space-y-5">
          {/* Passenger details card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600" />
                Traveller Details
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
          </div>

          {/* Payment Method Selection Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              Payment Gateway Mode
            </h3>

            <div className="space-y-3">
              {/* Option 1: Razorpay Gateway (Primary) */}
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'razorpay'
                    ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600/10'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="razorpay"
                  checked={paymentMethod === 'razorpay'}
                  onChange={() => setPaymentMethod('razorpay')}
                  className="mt-1 text-indigo-600 focus:ring-indigo-600"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <span>Razorpay Test Gateway</span>
                      <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100/70 px-1.5 py-0.2 rounded">
                        Standard Modal
                      </span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      Test Cards & UPI
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Authentic checkout modal with server order creation and cryptographic HMAC-SHA256 verification.
                  </p>
                </div>
              </label>

              {/* Option 2: Instant Simulated Booking */}
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'simulated'
                    ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600/10'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="simulated"
                  checked={paymentMethod === 'simulated'}
                  onChange={() => setPaymentMethod('simulated')}
                  className="mt-1 text-indigo-600 focus:ring-indigo-600"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>Simulated Instant Booking</span>
                    </span>
                    <span className="text-[10px] font-medium text-slate-500">Zero-step bypass</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Direct confirmation for rapid walkthroughs without opening checkout modals.
                  </p>
                </div>
              </label>
            </div>

            {/* Test Credentials Reference Box */}
            {paymentMethod === 'razorpay' && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-700 font-bold text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-indigo-600" />
                    Razorpay Test Mode Helper
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">Click to copy</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div
                    onClick={() => copyToClipboard(RAZORPAY_TEST_INFO.cardNumber, 'card')}
                    className="flex items-center justify-between bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg cursor-pointer hover:border-indigo-300"
                  >
                    <div>
                      <div className="text-[10px] text-slate-400">Test Card</div>
                      <div className="font-mono font-medium text-slate-800">{RAZORPAY_TEST_INFO.cardNumber}</div>
                    </div>
                    {copiedField === 'card' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>

                  <div
                    onClick={() => copyToClipboard(RAZORPAY_TEST_INFO.testUpi, 'upi')}
                    className="flex items-center justify-between bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg cursor-pointer hover:border-indigo-300"
                  >
                    <div>
                      <div className="text-[10px] text-slate-400">Test UPI ID</div>
                      <div className="font-mono font-medium text-slate-800">{RAZORPAY_TEST_INFO.testUpi}</div>
                    </div>
                    {copiedField === 'upi' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                </div>
                <div className="text-[10px] text-slate-500">
                  Card Expiry: <span className="font-mono text-slate-700 font-semibold">{RAZORPAY_TEST_INFO.cardExpiry}</span> • CVV: <span className="font-mono text-slate-700 font-semibold">{RAZORPAY_TEST_INFO.cardCvv}</span> • OTP: <span className="font-mono text-slate-700 font-semibold">{RAZORPAY_TEST_INFO.testOtp}</span>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || isProcessingPayment}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-950 via-indigo-900 to-blue-700 hover:from-indigo-900 hover:to-blue-600 text-white font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            {isProcessingPayment || isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing Payment via Razorpay...</span>
              </>
            ) : paymentMethod === 'razorpay' ? (
              <>
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Pay ₹{totalAmount.toLocaleString()} via Razorpay (Test)</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Confirm Simulated Booking (₹{totalAmount.toLocaleString()})</span>
              </>
            )}
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
                <span>Taxes & Service Fees (12%)</span>
                <span className="font-mono font-medium">₹{taxes.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Promotional Discount</span>
                <span className="font-mono text-emerald-600">- ₹0</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 text-sm pt-2 border-t border-slate-200">
                <span>Total Due</span>
                <span className="font-mono text-base text-indigo-950">₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 text-[11px] text-slate-600 space-y-1.5 border border-slate-100">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Secure Test Checkout</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Test environment: No real credit cards or bank accounts will be charged. All verification signatures are generated and validated on the backend.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* In-App Simulated Payment Modal (Fallback for sandbox without live keys) */}
      {showSimulatedModal && currentOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-950 text-white flex items-center justify-center font-bold text-xs">
                  R
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Razorpay Test Checkout</h3>
                  <p className="text-[10px] text-slate-400 font-mono">Order: {currentOrder.order_id}</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-950 bg-indigo-50 px-2 py-1 rounded-md">
                ₹{currentOrder.amount.toLocaleString()}
              </span>
            </div>

            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Test Sandbox Checkout</div>
                  <p className="text-[11px] text-amber-700">
                    Click <strong>Simulate Successful Payment</strong> to generate a valid test payment ID and verify the HMAC signature with FastAPI.
                  </p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-3 space-y-2 text-xs">
                <div className="text-[11px] font-bold text-slate-700">Simulated Payment Method:</div>
                <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg text-slate-700">
                  <span className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    <span>Test Card •••• 1111</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold">READY</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowSimulatedModal(false);
                  setIsProcessingPayment(false);
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSimulatedPaymentSuccess}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-xs font-bold text-white shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Simulate Success</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
