import React, { useState } from 'react';
import { 
  X, 
  HelpCircle, 
  ShieldCheck, 
  Route, 
  Clock, 
  CreditCard, 
  Ticket, 
  ChevronDown, 
  ChevronUp, 
  Lock, 
  Plane, 
  Train, 
  Car,
  AlertCircle,
  FileText
} from 'lucide-react';

interface HelpAndFaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'faqs' | 'policies';
}

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    id: 'multimodal-how',
    category: 'Trip Planning',
    question: 'How does TripPilot AI coordinate multimodal journeys across India?',
    answer:
      'TripPilot AI analyzes real transit networks connecting flights, express trains, intercity AC buses, urban metros, and local cabs. It calculates synchronized transfer windows between vehicles, so you receive a single unified door-to-door itinerary with clear timings and route guidance.',
  },
  {
    id: 'stops-vs-transfers',
    category: 'Trip Planning',
    question: 'What is the difference between an intermediate stop and a transfer?',
    answer:
      'An intermediate stop is a scheduled station halt along the same train or bus route where you remain on board. A transfer requires exiting one vehicle, navigating to the connecting platform or terminal, and boarding a new vehicle. TripPilot AI calculates transfer buffers specifically for transfers to keep your connection safe.',
  },
  {
    id: 'buffer-calculation',
    category: 'Safety & Connections',
    question: 'How are connection transfer buffers calculated?',
    answer:
      'Transfer buffers account for terminal distances, baggage claims, and station security checks. By default, airport flight departures include a 90-minute buffer, major railway stations include 30–45 minutes, and local metro or cab pickups include 15–20 minutes.',
  },
  {
    id: 'booking-process',
    category: 'Bookings & Tickets',
    question: 'What happens after I complete payment and confirm my reservation?',
    answer:
      'Your reservation is created immediately. You receive a unique TripPilot booking reference (e.g. TP-XXXXXX), and an official digital e-ticket with PNR numbers for each leg is stored in your My Bookings dashboard.',
  },
  {
    id: 'cancellation-policy',
    category: 'Bookings & Tickets',
    question: 'Can I cancel my confirmed booking or individual legs?',
    answer:
      'Yes. You can cancel any confirmed itinerary directly from your My Bookings screen. Your reservation status updates immediately to Cancelled, and seat allocations are released back to operator inventory.',
  },
  {
    id: 'payment-security',
    category: 'Payments & Security',
    question: 'How secure is the checkout and payment process?',
    answer:
      'All transactions are processed through 256-bit SSL encrypted channels adhering to PCI-DSS Level 1 security standards. We never store credit/debit card numbers or CVV codes on our servers.',
  },
  {
    id: 'seat-assistance',
    category: 'Preferences & Assistance',
    question: 'How do seat preferences and special assistance requests work?',
    answer:
      'When you select a seat preference (such as Window, Aisle, or Lower Berth) or note special assistance requirements (wheelchair, quiet coach), these are forwarded directly to operators during reservation and allocated based on real-time vehicle inventory.',
  },
];

export const HelpAndFaqModal: React.FC<HelpAndFaqModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'faqs',
}) => {
  const [activeTab, setActiveTab] = useState<'faqs' | 'policies'>(initialTab);
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('multimodal-how');

  if (!isOpen) return null;

  const toggleFaq = (id: string) => {
    setExpandedFaqId((prev) => (prev === id ? null : id));
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-950 text-white flex items-center justify-center shadow-md">
              <HelpCircle className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Help Center & Travel Guidelines
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Understand route planning, connection safety windows, and booking policies.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close help modal"
            title="Close dialog"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="px-6 pt-3 border-b border-slate-100 flex gap-4 text-xs font-bold bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('faqs')}
            className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${
              activeTab === 'faqs'
                ? 'border-indigo-600 text-indigo-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Frequently Asked Questions
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('policies')}
            className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${
              activeTab === 'policies'
                ? 'border-indigo-600 text-indigo-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Travel Policies & Safety Standards
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'faqs' ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 mb-2">
                Click any question to view detailed guidance on using TripPilot AI.
              </p>

              {FAQ_DATA.map((faq) => {
                const isExpanded = expandedFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="border border-slate-200 rounded-2xl overflow-hidden transition-all bg-slate-50/50"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full p-4 text-left flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-100/70 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                          {faq.category}
                        </span>
                        <h3 className="text-xs font-bold text-slate-900 leading-snug">
                          {faq.question}
                        </h3>
                      </div>
                      <div className="text-slate-400 shrink-0">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-4 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 bg-white">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-5 text-xs text-slate-600 leading-relaxed">
              {/* Policy 1: Transfer Buffers */}
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs uppercase tracking-wide">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>Transfer Buffer Safety Standards</span>
                </div>
                <p>
                  To prevent missed connections between different transport providers, TripPilot AI applies conservative transfer safety margins:
                </p>
                <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] text-slate-500">
                  <li><strong>Airport Flight Connections:</strong> Minimum 90 minutes for security clearance and boarding gates.</li>
                  <li><strong>Railway Station Transfers:</strong> Minimum 30 to 45 minutes for platform traversal and luggage movement.</li>
                  <li><strong>Intercity Bus Terminals:</strong> Minimum 25 minutes for bay arrival and luggage loading.</li>
                  <li><strong>Urban Metro & Local Cabs:</strong> Minimum 15 to 20 minutes for traffic buffer and vehicle dispatch.</li>
                </ul>
              </div>

              {/* Policy 2: Booking Confirmation & Digital Tickets */}
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs uppercase tracking-wide">
                  <Ticket className="w-4 h-4 text-indigo-600" />
                  <span>Ticketing & Reservation Policy</span>
                </div>
                <p>
                  Confirmed bookings generate immediate PNR references and travel vouchers. All tickets are accessible in your personal account under My Bookings, complete with individual leg details, scheduled departure times, and seat categories.
                </p>
              </div>

              {/* Policy 3: Data Security & Privacy */}
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs uppercase tracking-wide">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Data Protection & Privacy Safeguards</span>
                </div>
                <p>
                  TripPilot AI protects passenger personal data with strict industry standards. We only process traveler contact information to deliver booking confirmations, gate updates, and emergency delay notices. We do not sell or monetize personal traveler data.
                </p>
              </div>

              {/* Interactive Demonstration Notice */}
              <div className="bg-indigo-50/70 rounded-2xl p-4 border border-indigo-200/80 space-y-1 text-[11px] text-indigo-950">
                <div className="font-bold flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Platform Evaluation & Interactive Capabilities</span>
                </div>
                <p className="text-slate-600">
                  TripPilot AI provides fully functional door-to-door itinerary planning, transit comparisons, transfer validation, and booking lifecycle simulation for evaluation. Fares and schedules represent coordinated estimates across Indian transport corridors.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-[11px] text-slate-400">
            Need further guidance? Ask the <strong>AI Assistant (Ctrl+K)</strong> anytime.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
