import React from 'react';
import { Sparkles } from 'lucide-react';
import MessageBubble from '../MessageBubble/MessageBubble';
import TypingIndicator from '../TypingIndicator/TypingIndicator';
import { useAutoScroll } from '../../hooks/useAutoScroll';

export default function ChatContainer({ messages, isGenerating, onSendMessage, onRegenerate }) {
  const { scrollContainerRef, handleScroll } = useAutoScroll([messages, isGenerating]);

  return (
    <div 
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto h-full scrollbar-thin select-text"
    >
      {messages.length === 0 ? (
        /* Welcome Dashboard Screen */
        <div className="min-h-full flex flex-col items-center justify-center py-12 px-6 max-w-3xl mx-auto text-center animate-fade-in">
          {/* Logo element */}
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl shadow-indigo-500/10 mb-6 scale-95 hover:scale-100 transition-transform duration-300">
            <Sparkles className="h-7 w-7 text-white animate-pulse" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
            I'm <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Kaizen AI</span>
          </h1>
          <p className="text-zinc-400 text-sm max-w-md leading-relaxed">
            A real-time assistant built on the principle of continuous improvement. How can I help you today?
          </p>
        </div>
      ) : (
        /* Conversation Message list */
        <div className="flex flex-col w-full min-h-full pb-36">
          {messages.map((msg, index) => {
            const isLast = index === messages.length - 1;
            const isEmptyAssistant = msg.role === 'assistant' && !msg.content;

            // Render loading animation if the latest assistant message is empty
            if (isEmptyAssistant && isGenerating) {
              return <TypingIndicator key={msg.id} />;
            }

            // Normal bubble rendering
            return (
              <MessageBubble
                key={msg.id}
                message={msg}
                onRegenerate={onRegenerate}
                isLast={isLast}
                isGenerating={isGenerating && isLast}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
