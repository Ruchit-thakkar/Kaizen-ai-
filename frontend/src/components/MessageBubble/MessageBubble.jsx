import React, { useState } from 'react';
import { Copy, Check, RotateCw, Sparkles, User, Edit3 } from 'lucide-react';
import MarkdownRenderer from '../MarkdownRenderer/MarkdownRenderer';
import { useAuth } from '../../context/AuthContext';

export default function MessageBubble({ message, onRegenerate, onSendMessage, isLast, isGenerating }) {
  const { role, content } = message;
  const isUser = role === 'user';
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(content || '');

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (editText.trim() && editText.trim() !== content) {
      onSendMessage(editText.trim());
      setIsEditing(false);
    }
  };

  return (
    <div className="group w-full py-8 transition-all duration-300 animate-slide-in border-b border-border-color/30 hover:bg-input-bg/10">
      <div className="flex gap-5 max-w-[1100px] mx-auto px-4 md:px-6 w-full">
        
        {/* Avatar block */}
        <div className="shrink-0 select-none">
          {isUser ? (
            <div className="h-9 w-9 rounded-xl bg-elevated-card flex items-center justify-center text-white font-bold text-xs shadow-sm uppercase font-outfit">
              {user ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'U'}
            </div>
          ) : (
            <div className="h-9 w-9 rounded-xl bg-input-bg border border-border-color flex items-center justify-center text-white shadow-sm">
              <img 
                src="https://ik.imagekit.io/devnext/kaizen%20ai%20logo" 
                alt="Kaizen AI" 
                className="h-6 w-6 object-contain" 
              />
            </div>
          )}
        </div>

        {/* Content Box */}
        <div className="flex flex-col flex-1 min-w-0">
          
          {/* Header Metadata - ONLY display user name for user messages */}
          {isUser && (
            <div className="flex items-center gap-2 mb-1.5 select-none">
              <span className="text-sm font-bold text-white font-outfit">
                {user?.name || 'You'}
              </span>
            </div>
          )}

          {/* Message Content */}
          {isEditing ? (
            /* Inline Prompt Editor */
            <form onSubmit={handleEditSubmit} className="w-full bg-input-bg border border-border-color rounded-2xl p-3 shadow-xl mt-1.5 max-w-3xl">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={3}
                className="w-full bg-transparent text-white text-sm focus:outline-none resize-none leading-relaxed"
                autoFocus
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => { setIsEditing(false); setEditText(content); }}
                  className="px-3 py-1.5 rounded-lg hover:bg-elevated-card text-secondary-text text-xs font-semibold transition-colors cursor-pointer font-outfit"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!editText.trim()}
                  className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-secondary-text text-main-bg text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 font-outfit"
                >
                  Save & Submit
                </button>
              </div>
            </form>
          ) : (
            /* Normal content flow (transparent backgrounds) */
            <div className="text-secondary-text text-base leading-relaxed font-light font-outfit mt-1 select-text">
              {isUser ? (
                <p className="whitespace-pre-wrap text-white font-light">{content}</p>
              ) : content ? (
                <MarkdownRenderer content={content} />
              ) : (
                /* Initial thinking pulse */
                <div className="flex items-center gap-1.5 py-2.5 select-none">
                  <span className="h-1.5 w-1.5 bg-muted-text rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 bg-muted-text rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 bg-muted-text rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>
          )}

          {/* Action buttons (reveals on hover of message container) */}
          {content && !isGenerating && !isEditing && (
            <div className="flex items-center gap-3 mt-3.5 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200 select-none">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 p-1 rounded hover:bg-input-bg text-muted-text hover:text-white transition-colors text-xs cursor-pointer focus:outline-none"
                title="Copy to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-green-400" />
                    <span className="text-green-400 font-bold text-[10px]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span className="text-[10px]">Copy</span>
                  </>
                )}
              </button>

              {isUser ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 p-1 rounded hover:bg-input-bg text-muted-text hover:text-white transition-colors text-xs cursor-pointer focus:outline-none"
                  title="Edit message"
                >
                  <Edit3 className="h-3 w-3" />
                  <span className="text-[10px]">Edit</span>
                </button>
              ) : (
                isLast && onRegenerate && (
                  <button
                    onClick={onRegenerate}
                    className="flex items-center gap-1 p-1 rounded hover:bg-input-bg text-muted-text hover:text-white transition-colors text-xs cursor-pointer focus:outline-none"
                    title="Regenerate reply"
                  >
                    <RotateCw className="h-3 w-3" />
                    <span className="text-[10px]">Regenerate</span>
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
