import React from 'react';
import { Sparkles } from 'lucide-react';

export default function TypingIndicator() {
  return (
    <div className="flex gap-4 max-w-3xl mx-auto px-4 py-6 w-full">
      <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shrink-0 shadow-md">
        <Sparkles className="h-4 w-4 text-indigo-400 animate-spin" style={{ animationDuration: '3s' }} />
      </div>
      <div className="flex flex-col gap-1 w-full">
        <div className="text-xs text-zinc-500 font-semibold tracking-wider uppercase font-mono">Kaizen AI</div>
        <div className="flex items-center gap-1.5 py-3 pl-1">
          <div className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="h-2 w-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="h-2 w-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
