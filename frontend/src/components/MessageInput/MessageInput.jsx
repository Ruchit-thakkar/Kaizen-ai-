import React, { useRef, useEffect, useState } from 'react';
import { Send, Square, Sparkles } from 'lucide-react';

export default function MessageInput({ onSendMessage, isGenerating, onStopGeneration }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  // Auto-grow textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      // Adjust height up to a max-height of 200px (12.5rem)
      const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [input]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isGenerating) return;

    onSendMessage(input);
    setInput('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    // If Enter is pressed without Shift, submit the form
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full relative max-w-3xl mx-auto px-4 md:px-0">
      
      {/* Floating Stop Generation Button above the input */}
      {isGenerating && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-10 animate-fade-in">
          <button
            type="button"
            onClick={onStopGeneration}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-700/80 rounded-full hover:bg-zinc-800 text-zinc-200 hover:text-white transition-all text-xs font-semibold shadow-lg hover:shadow-indigo-500/10"
          >
            <Square className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
            Stop generating
          </button>
        </div>
      )}

      {/* Input container */}
      <div className="relative flex items-end w-full rounded-2xl bg-zinc-900 border border-zinc-800 focus-within:border-zinc-700 transition-all duration-200 shadow-xl pr-12">
        {/* Left side Sparkle decorative element */}
        <div className="pl-4 pb-3 text-zinc-650">
          <Sparkles className="h-5 w-5 text-zinc-600" />
        </div>

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Kaizen AI anything..."
          rows={1}
          className="w-full bg-transparent text-zinc-150 py-3.5 pl-3 pr-2 resize-none focus:outline-none placeholder-zinc-500 text-sm leading-relaxed max-h-52 min-h-[48px]"
        />

        {/* Action Button inside right border */}
        <div className="absolute right-2.5 bottom-2">
          {isGenerating ? (
            <button
              type="button"
              onClick={onStopGeneration}
              className="flex items-center justify-center h-8.5 w-8.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-white transition-all shadow-md"
              title="Stop generating"
            >
              <Square className="h-4 w-4 text-rose-500 fill-rose-500" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className={`flex items-center justify-center h-8.5 w-8.5 rounded-xl transition-all shadow-md
                ${input.trim() 
                  ? 'bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white hover:opacity-95 hover:scale-[1.03] active:scale-95' 
                  : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}
              `}
              title="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
