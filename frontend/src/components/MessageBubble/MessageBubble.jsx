import React, { useState } from 'react';
import { Copy, Check, RotateCw, Sparkles, User } from 'lucide-react';
import MarkdownRenderer from '../MarkdownRenderer/MarkdownRenderer';

export default function MessageBubble({ message, onRegenerate, isLast, isGenerating }) {
  const { role, content } = message;
  const isUser = role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className={`group w-full border-b border-zinc-900/40 py-6 transition-all duration-300 animate-fade-in
        ${isUser ? 'bg-zinc-900/10' : 'bg-transparent'}
      `}
    >
      <div className="flex gap-4 max-w-3xl mx-auto px-4 md:px-6 w-full">
        {/* Avatar */}
        {isUser ? (
          <div className="h-8 w-8 rounded-lg bg-indigo-650/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-semibold text-xs shrink-0 shadow-sm">
            <User className="h-4 w-4 text-indigo-450" />
          </div>
        ) : (
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shrink-0 shadow-md">
            <Sparkles className="h-4 w-4" />
          </div>
        )}

        {/* Content Box */}
        <div className="flex flex-col gap-1 w-full min-w-0">
          {/* Header */}
          <div className="text-xs text-zinc-500 font-semibold tracking-wider uppercase font-mono">
            {isUser ? 'You' : 'Kaizen AI'}
          </div>

          {/* Text body */}
          <div className="text-zinc-200 mt-1">
            {isUser ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">{content}</p>
            ) : content ? (
              <MarkdownRenderer content={content} />
            ) : (
              // Pulse while loading initial chunk
              <span className="text-zinc-500 italic text-sm animate-pulse">Kaizen AI is thinking...</span>
            )}
          </div>

          {/* Message actions footer (reveals on hover, hidden when loading/generating) */}
          {content && !isGenerating && (
            <div className="flex items-center gap-3 mt-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 p-1 rounded hover:bg-zinc-900 text-zinc-500 hover:text-zinc-350 transition-colors text-xs"
                title="Copy response"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              {!isUser && isLast && onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="flex items-center gap-1.5 p-1 rounded hover:bg-zinc-900 text-zinc-500 hover:text-zinc-350 transition-colors text-xs"
                  title="Regenerate response"
                >
                  <RotateCw className="h-3 w-3.5" />
                  <span>Regenerate</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
