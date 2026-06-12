import React from 'react';
import { Sparkles } from 'lucide-react';

export default function TypingIndicator() {
  return (
    <div className="w-full py-5 transition-all duration-300 animate-slide-in">
      <div className="flex gap-4.5 max-w-[1100px] mx-auto px-4 md:px-6 w-full flex-row items-center">
        {/* Kaizen AI Logo on Left */}
        <div className="shrink-0 select-none">
          <div className="h-8.5 w-8.5 rounded-xl bg-input-bg border border-border-color flex items-center justify-center text-white shadow-md">
            <img 
              src="https://ik.imagekit.io/devnext/kaizen%20ai%20logo" 
              alt="Kaizen AI" 
              className="h-5 w-5 object-contain" 
            />
          </div>
        </div>

        {/* Animated Bouncing Dots on Right */}
        <div className="flex items-center gap-1.5 py-2 pl-1 select-none">
          <div className="h-2 w-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="h-2 w-2 bg-secondary-text/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="h-2 w-2 bg-muted-text/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
