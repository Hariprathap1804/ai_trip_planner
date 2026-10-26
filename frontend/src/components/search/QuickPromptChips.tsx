import React, { useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { useAiStore } from '../../store/useAiStore';

export const QuickPromptChips: React.FC = () => {
  const { quickPrompts, fetchQuickPrompts, sendMessage, setIsOpen } = useAiStore();

  useEffect(() => {
    fetchQuickPrompts();
  }, [fetchQuickPrompts]);

  const defaultPrompts = [
    { label: 'Cheapest under ₹1,000', prompt: 'Find the cheapest journey from Bengaluru to Chennai tomorrow under ₹1,000.' },
    { label: 'Arrive before 10:00 AM', prompt: 'Show journeys from Bengaluru to Chennai arriving before 10:00 AM.' },
    { label: 'Train + Cab Connection', prompt: 'Plan a door-to-door journey combining an express train with a cab for the final leg.' },
    { label: 'Direct Flights Only', prompt: 'Show direct flights from Delhi to Mumbai under ₹5,000.' },
    { label: 'My Bookings', prompt: 'Show my upcoming travel reservations and boarding passes.' },
  ];

  const items = quickPrompts.length > 0 ? quickPrompts : defaultPrompts;

  const handleClick = async (prompt: string) => {
    setIsOpen(true);
    await sendMessage(prompt);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap" role="region" aria-label="Suggested AI travel prompts">
      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
        <Sparkles className="w-3.5 h-3.5 text-violet-600" />
        Try asking our AI assistant:
      </span>
      {items.map((item, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => handleClick(item.prompt)}
          className="text-xs font-medium px-3 py-1.5 rounded-full bg-violet-50/80 hover:bg-violet-100 text-violet-900 border border-violet-200/60 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};
