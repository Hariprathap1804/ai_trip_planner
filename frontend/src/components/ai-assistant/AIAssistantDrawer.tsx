import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Trash2, ShieldCheck } from 'lucide-react';
import { useAiStore } from '../../store/useAiStore';
import { AIMessageBubble } from './AIMessageBubble';

export const AIAssistantDrawer: React.FC = () => {
  const { isOpen, setIsOpen, messages, isThinking, sendMessage, clearHistory } = useAiStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Global hotkey handler (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;
    const text = input;
    setInput('');
    await sendMessage(text);
  };

  const sampleSuggestions = [
    'Find cheapest train from Bengaluru to Chennai tomorrow',
    'Show direct flights under ₹6,000',
    'Arrive in Chennai before 10:00 AM',
    'Plan a door-to-door trip combining train and cab',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside aria-label="AI Travel Assistant" className="w-screen max-w-md bg-slate-50 shadow-2xl flex flex-col border-l border-slate-200">
          {/* Header */}
          <div className="p-4 bg-white border-b border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-700 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-slate-900">TripPilot AI Travel Companion</h2>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Online • Ready to assist with your journey</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={clearHistory}
                title="Clear conversation"
                aria-label="Clear conversation history"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                aria-label="Close AI Assistant drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => (
              <AIMessageBubble key={m.id} message={m} />
            ))}

            {isThinking && (
              <div className="flex items-center gap-2 text-xs text-slate-500 italic p-3 bg-white rounded-2xl border border-slate-200 w-fit">
                <Sparkles className="w-3.5 h-3.5 text-violet-600 animate-spin" />
                <span>Searching travel options and preparing recommendations...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions pills */}
          <div className="p-3 bg-white border-t border-slate-100 overflow-x-auto">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Suggested Travel Prompts:
            </div>
            <div className="flex gap-1.5">
              {sampleSuggestions.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => sendMessage(s)}
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-900 text-slate-600 text-[11px] whitespace-nowrap cursor-pointer transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Input form */}
          <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-200">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask e.g. 'Cheapest morning train to Chennai' or 'Plan train + cab'..."
                className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-600/20 focus:border-violet-600 transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || isThinking}
                aria-label="Send message to AI Assistant"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-indigo-950 hover:bg-indigo-900 disabled:opacity-40 text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
              <span>AI helps you search routes, apply filters, and plan multimodal journeys</span>
              <span className="flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Verified schedule & fare data
              </span>
            </div>
          </form>
        </aside>
      </div>
    </div>
  );
};
