import React from 'react';
import { Sparkles, User, Check, ArrowRight, AlertCircle } from 'lucide-react';
import { AIMessage } from '../../types/ai';
import { useAiStore } from '../../store/useAiStore';

interface AIMessageBubbleProps {
  message: AIMessage;
}

export const AIMessageBubble: React.FC<AIMessageBubbleProps> = ({ message }) => {
  const { executeAction } = useAiStore();
  const isUser = message.sender === 'user';

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
          <div className="bg-violet-50/90 border border-violet-200/80 rounded-xl p-3 text-xs space-y-2">
            <div className="flex items-center justify-between text-violet-900 font-bold">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                Action: {message.action_proposal.action.replace('_', ' ').toUpperCase()}
              </span>
              {message.action_executed && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                  <Check className="w-3 h-3" />
                  Applied
                </span>
              )}
            </div>

            <p className="text-slate-600 text-[11px]">{message.action_proposal.explanation}</p>

            {!message.action_executed && (
              <button
                type="button"
                onClick={() => executeAction(message.action_proposal!)}
                className="w-full py-1.5 px-3 bg-violet-700 hover:bg-violet-800 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
              >
                <span>Apply to Website View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
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
