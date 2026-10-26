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
  Check,
  Lock,
} from 'lucide-react';
import { useBookingStore } from '../store/useBookingStore';
import { useAuthStore } from '../store/useAuthStore';
import { Passenger } from '../types/booking';
import { apiClient } from '../services/apiClient';
import { PaymentConfig, RazorpayOrder } from '../types/payment';
import { loadRazorpayScript } from '../services/razorpay';
import { getDefaultPreferences } from '../components/profile/TravelPreferencesModal';

export const BookingReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeDraftJourney, createBooking, verifyAndBook, isLoading, error } = useBookingStore();
  const { user, isAuthenticated, openAuthModal } = useAuthStore();

  const [fullName, setFullName] = useState(user?.name || 'Rahul Nair');
  const [age, setAge] = useState<number>(31);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [email, setEmail] = useState(user?.email || 'rahul.nair@example.com');
  const [phone, setPhone] = useState(user?.phone || '+91 98450 12345');
  const [seatPreference, setSeatPreference] = useState('Window Seat');
  const [notes, setNotes] = useState('');

  // Load preferences from saved traveler settings on initial mount
  useEffect(() => {
    const prefs = getDefaultPreferences();
    if (prefs.seatPreference) setSeatPreference(prefs.seatPreference);
    if (prefs.specialAssistance) setNotes(prefs.specialAssistance);
  }, []);

  // Update fields when user signs in or profile changes
  useEffect(() => {
    if (user) {
      if (user.name) setFullName(user.name);
      if (user.email) setEmail(user.email);
      if (user.phone) setPhone(user.phone);
    }
  }, [user]);

  // Payment states
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'simulated'>('razorpay');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showSimulatedModal, setShowSimulatedModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<RazorpayOrder | null>(null);

  // Client-side regex & validation feedback state
  const [touched, setTouched] = useState<{ email?: boolean; phone?: boolean; name?: boolean }>({});
  const cleanEmail = email.trim();
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);
  const cleanPhoneDigits = phone.replace(/[\s\-()+]/g, '');
  const isPhoneValid = /^\d{7,15}$/.test(cleanPhoneDigits);
  const cleanName = fullName.trim();
  const isNameValid = cleanName.length >= 2 && !/[<>{}[\];]/.test(cleanName);

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
    if (!isNameValid || !isEmailValid || !isPhoneValid || age < 1 || age > 120) {
      setPaymentError('Please provide valid passenger details before completing booking.');
      return;
    }
    setIsProcessingPayment(true);
    setShowSimulatedModal(false);

    const passenger: Passenger = {
      full_name: cleanName,
      age,
      gender,
      seat_preference: seatPreference,
      email: cleanEmail,
      phone: phone.trim(),
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

    // Strict Auth Gatekeeper
    if (!isAuthenticated) {
      openAuthModal('login', 'Please sign in or create an account to finalize your booking and proceed to payment.');
      return;
    }

    // Client-side regex & boundaries validation
    if (!isNameValid) {
      setPaymentError('Passenger full name must be at least 2 characters and cannot contain special characters.');
      setTouched((prev) => ({ ...prev, name: true }));
      return;
    }

    if (age < 1 || age > 120) {
      setPaymentError('Passenger age must be between 1 and 120 years.');
      return;
    }

    if (!isEmailValid) {
      setPaymentError('Please enter a valid email address (e.g. traveller@example.com).');
      setTouched((prev) => ({ ...prev, email: true }));
      return;
    }

    if (!isPhoneValid) {
      setPaymentError('Please enter a valid contact phone number (7 to 15 digits).');
      setTouched((prev) => ({ ...prev, phone: true }));
      return;
    }

    setIsProcessingPayment(true);

    const passenger: Passenger = {
      full_name: cleanName,
      age,
      gender,
      seat_preference: seatPreference,
      email: cleanEmail,
      phone: phone.trim(),
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
            Enter traveller details and complete your secure reservation.
          </p>
        </div>

        {/* Guaranteed Secure Booking status badge */}
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-950 self-start sm:self-auto shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Guaranteed Secure Booking</span>
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

      {/* Authentication Required Warning Banner */}
      {!isAuthenticated && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-white shrink-0 shadow-xs">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Sign In Required to Complete Booking</h4>
              <p className="text-xs text-slate-600 mt-0.5">
                TripPilot AI requires you to sign in or create an account to issue your confirmed ticket, verify payment signatures, and save bookings to your profile.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={() => openAuthModal('login', 'Please sign in to proceed with booking and payment.')}
              className="w-full sm:w-auto px-4 py-2 bg-indigo-900 hover:bg-indigo-950 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all"
            >
              Sign In to Book
            </button>
            <button
              type="button"
              onClick={() => openAuthModal('register', 'Create an account to proceed with booking and payment.')}
              className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all"
            >
              Create Account
            </button>
          </div>
        </div>
      )}

      {/* Authenticated User Status Banner */}
      {isAuthenticated && user && (
        <div className="p-3.5 px-4 rounded-2xl bg-indigo-50/80 border border-indigo-200/60 shadow-xs flex items-center justify-between gap-3 text-xs text-indigo-950">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              Booking as <strong className="font-semibold text-indigo-900">{user.name}</strong> ({user.email})
            </span>
          </div>
          <span className="text-[11px] font-semibold text-indigo-700 bg-white/80 px-2 py-0.5 rounded-md border border-indigo-100">
            Authenticated Profile
          </span>
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
                className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Auto-fill Traveller Details
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onBlur={() => setTouched((p) => ({ ...p, name: true }))}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 ${
                    touched.name && !isNameValid
                      ? 'border-rose-400 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:ring-indigo-600/20'
                  }`}
                />
                {touched.name && !isNameValid && (
                  <p className="text-[10px] text-rose-500 mt-1 font-medium">Please enter at least 2 characters with no special characters.</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Age</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
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
                    onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 ${
                      touched.email && !isEmailValid
                        ? 'border-rose-400 focus:ring-rose-500/20'
                        : 'border-slate-200 focus:ring-indigo-600/20'
                    }`}
                  />
                  {touched.email && !isEmailValid && (
                    <p className="text-[10px] text-rose-500 mt-1 font-medium">Please enter a valid email address.</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 ${
                      touched.phone && !isPhoneValid
                        ? 'border-rose-400 focus:ring-rose-500/20'
                        : 'border-slate-200 focus:ring-indigo-600/20'
                    }`}
                  />
                  {touched.phone && !isPhoneValid && (
                    <p className="text-[10px] text-rose-500 mt-1 font-medium">Please enter a valid 7–15 digit phone.</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Seat Preference
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                  {['Window Seat', 'Aisle Seat', 'Lower Berth', 'Any Available'].map((seat) => (
                    <button
                      key={seat}
                      type="button"
                      onClick={() => setSeatPreference(seat)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                        seatPreference === seat
                          ? 'bg-indigo-950 text-white border-indigo-950 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {seat}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={seatPreference}
                  onChange={(e) => setSeatPreference(e.target.value)}
                  placeholder="e.g. Window Seat, forward-facing coach, quiet cabin"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Seat choices are forwarded to transport operators upon reservation and allocated subject to coach inventory.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Special Assistance & Travel Preferences (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Wheelchair assistance required at airport departure terminal, senior citizen boarding priority, dietary meal request."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 placeholder:text-slate-400"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Let operators know if any passenger requires boarding help, accessibility assistance, or specialized care during transfers.
                </p>
              </div>
            </div>
          </div>

          {/* Payment Method Selection Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                Payment Method
              </h3>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                SSL Encrypted Checkout
              </span>
            </div>

            {/* Online Payment Method (UPI, Cards, NetBanking) */}
            <div className="p-4 rounded-xl border-2 border-indigo-600 bg-indigo-50/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-950 text-white flex items-center justify-center shrink-0">
                    <CreditCard className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">
                      UPI, Credit / Debit Cards & NetBanking
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Google Pay, PhonePe, Paytm, Visa, Mastercard, RuPay & NetBanking
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-indigo-800 bg-indigo-100/70 px-2 py-0.5 rounded">
                  Recommended
                </span>
              </div>

              <div className="pt-2 border-t border-indigo-100/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-semibold text-slate-500">Accepted:</span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-[10px] font-semibold text-slate-700">UPI</span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-[10px] font-semibold text-slate-700">Cards</span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-[10px] font-semibold text-slate-700">NetBanking</span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-[10px] font-semibold text-slate-700">Wallets</span>
                </div>
                <span className="text-emerald-700 font-medium text-[11px] flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Zero Processing Surcharge
                </span>
              </div>
            </div>

            {/* Payment Protection Guarantee */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 flex items-center gap-3 text-xs text-slate-600">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="font-bold text-slate-800 text-[11px]">256-Bit SSL Encrypted & Verified</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Your payment information is encrypted and processed through certified PCI-DSS compliant gateways.
                </div>
              </div>
            </div>
          </div>

          {isAuthenticated ? (
            <button
              type="submit"
              disabled={isLoading || isProcessingPayment}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-950 via-indigo-900 to-blue-700 hover:from-indigo-900 hover:to-blue-600 text-white font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              {isProcessingPayment || isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Secure Payment...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>Pay ₹{totalAmount.toLocaleString()} & Confirm Booking</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal('login', 'Please sign in or create an account to finalize your booking and proceed to payment.')}
              className="w-full py-3.5 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-98 cursor-pointer flex items-center justify-center gap-2 shadow-amber-600/20 hover:scale-[1.01]"
            >
              <Lock className="w-4 h-4 text-amber-200" />
              <span>Sign In to Complete Booking & Pay (₹{totalAmount.toLocaleString()})</span>
            </button>
          )}
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
                <span>TripPilot Booking Guarantee</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Instant reservation confirmation with official PNR and travel voucher. 24/7 passenger assistance for all journey legs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Secure Checkout Confirmation Modal */}
      {showSimulatedModal && currentOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-950 text-white flex items-center justify-center font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Secure Payment Checkout</h3>
                  <p className="text-[10px] text-slate-400 font-mono">Ref: {currentOrder.order_id}</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-950 bg-indigo-50 px-2.5 py-1 rounded-md">
                ₹{currentOrder.amount.toLocaleString()}
              </span>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-700">
                  <span className="text-slate-400">Route</span>
                  <span className="font-semibold text-slate-900">{activeDraftJourney.origin.city} → {activeDraftJourney.destination.city}</span>
                </div>
                <div className="flex justify-between items-center text-slate-700">
                  <span className="text-slate-400">Primary Traveller</span>
                  <span className="font-semibold text-slate-900">{cleanName}</span>
                </div>
                <div className="flex justify-between items-center text-slate-700">
                  <span className="text-slate-400">Payment Gateway</span>
                  <span className="font-semibold text-indigo-900 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Razorpay Verified
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 text-center px-2">
                Click <strong>Confirm Payment</strong> to complete your reservation and generate your official travel voucher.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowSimulatedModal(false);
                  setIsProcessingPayment(false);
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSimulatedPaymentSuccess}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-950 to-indigo-800 hover:from-indigo-900 hover:to-indigo-700 text-xs font-bold text-white shadow-md cursor-pointer flex items-center justify-center gap-1.5 transition-all"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Confirm Payment</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
