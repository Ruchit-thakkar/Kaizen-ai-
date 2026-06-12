import React from 'react';
import { Sparkles, ChevronDown, Terminal, Compass, BookOpen, Lightbulb } from 'lucide-react';
import MessageBubble from '../MessageBubble/MessageBubble';
import TypingIndicator from '../TypingIndicator/TypingIndicator';
import { useAutoScroll } from '../../hooks/useAutoScroll';

const SUGGESTED_PROMPTS = [
  {
    title: "Explain quantum computing",
    desc: "Understand the complex concepts in simple terms",
    icon: Compass,
    prompt: "Explain quantum computing in simple terms for a high school student."
  },
  {
    title: "Write a Python script",
    desc: "Automate code, fetch APIs, or parse data structures",
    icon: Terminal,
    prompt: "Write a clean, commented Python script that fetches data from a public REST API and parses the JSON response."
  },
  {
    title: "Summarize an article",
    desc: "Condense long text and articles into key bullet points",
    icon: BookOpen,
    prompt: "Summarize this key concept into 5 actionable, high-impact bullet points: [Insert text here]"
  },
  {
    title: "Generate ideas",
    desc: "Brainstorm startup concepts, content schedules, or features",
    icon: Lightbulb,
    prompt: "Give me 5 unique, creative ideas for a premium SaaS application leveraging generative AI."
  }
];

export default function ChatContainer({ messages, isGenerating, onSendMessage, onRegenerate }) {
  const { 
    scrollContainerRef, 
    handleScroll, 
    shouldAutoScroll, 
    scrollToBottom 
  } = useAutoScroll([messages, isGenerating]);

  return (
    <div className="flex-1 relative min-h-0 min-w-0 bg-chat-bg">
      
      {/* Scrollable chat body */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto scrollbar-thin select-text"
      >
        {messages.length === 0 ? (
          /* Welcome Dashboard Screen (Empty State) */
          <div className="min-h-full flex flex-col items-center justify-center py-20 px-6 max-w-4xl mx-auto text-center animate-fade-in select-none">
            {/* Logo element */}
            <div className="h-20 w-20 flex items-center justify-center mb-6">
              <img 
                src="https://ik.imagekit.io/devnext/kaizen%20ai%20logo" 
                alt="Kaizen AI Logo" 
                className="h-16 w-16 object-contain" 
              />
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2 font-outfit">
              KAIZEN AI
            </h1>
            
            <p className="text-secondary-text text-sm max-w-md leading-relaxed font-light mb-12 font-outfit">
              A real-time assistant engineered for continuous improvement. Select an action below or type a query to begin.
            </p>

            {/* Suggested Prompts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5 w-full text-left">
              {SUGGESTED_PROMPTS.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(item.prompt)}
                    className="flex items-start gap-4.5 p-4.5 rounded-2xl bg-elevated-card border border-border-color hover:bg-input-bg hover:border-white transition-all duration-200 shadow-md group cursor-pointer text-left focus:outline-none"
                  >
                    <div className="p-2.5 rounded-xl bg-input-bg text-secondary-text group-hover:text-white transition-colors shrink-0">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-white font-outfit group-hover:underline transition-all">{item.title}</span>
                      <span className="text-xs text-muted-text mt-1.5 leading-normal font-light font-outfit">{item.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Conversation Message list */
          <div className="flex flex-col w-full min-h-full pb-12">
            {messages.map((msg, index) => {
              const isLast = index === messages.length - 1;
              const isEmptyAssistant = msg.role === 'assistant' && !msg.content;

              // Render typing indicator animation if the latest assistant message is empty and generating
              if (isEmptyAssistant && isGenerating) {
                return <TypingIndicator key={msg.id} />;
              }

              // Normal bubble rendering
              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  onRegenerate={onRegenerate}
                  onSendMessage={onSendMessage}
                  isLast={isLast}
                  isGenerating={isGenerating && isLast}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Scroll to Bottom Button */}
      {!shouldAutoScroll && messages.length > 0 && (
        <button
          onClick={() => scrollToBottom('smooth')}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 p-2.5 rounded-full bg-input-bg border border-border-color hover:bg-elevated-card text-white shadow-xl transition-all duration-150 cursor-pointer focus:outline-none"
          title="Scroll to bottom"
        >
          <ChevronDown className="h-5 w-5 animate-bounce" />
        </button>
      )}
    </div>
  );
}
