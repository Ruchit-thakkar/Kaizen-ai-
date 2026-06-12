import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

const CodeBlock = ({ inline, className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || '');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inline) {
    return (
      <code className="bg-soft-slate-black text-secondary-text px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
        {children}
      </code>
    );
  }

  const language = match ? match[1] : 'text';

  return (
    <div className="relative my-4 rounded-xl border border-border-color overflow-hidden bg-deep-jet-black font-mono shadow-lg">
      {/* Codeblock header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-soft-slate-black border-b border-border-color text-xs text-secondary-text select-none">
        <span className="font-mono text-muted-text font-semibold uppercase">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:text-white transition-colors py-1 px-2 rounded hover:bg-elevated-surface cursor-pointer"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-400" />
              <span className="text-green-400 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>
      
      {/* Codebody syntax highlighted */}
      <div className="overflow-x-auto text-xs p-0">
        <SyntaxHighlighter
          style={oneDark}
          language={language}
          PreTag="div"
          customStyle={{
            margin: 0,
            padding: '1.25rem',
            background: 'transparent',
            fontSize: '0.85rem',
            lineHeight: '1.5rem',
          }}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default function MarkdownRenderer({ content }) {
  return (
    <div className="prose prose-invert max-w-none text-white text-sm leading-relaxed space-y-2 font-light">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: CodeBlock,
          a({ href, children }) {
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-coral-glow hover:underline hover:text-hover-accent font-semibold transition-colors">
                {children}
              </a>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4 border border-border-color rounded-xl shadow-md">
                <table className="w-full text-left border-collapse text-xs">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-soft-slate-black border-b border-border-color text-secondary-text uppercase font-mono tracking-wider">{children}</thead>;
          },
          tbody({ children }) {
            return <tbody className="divide-y divide-border-color/50 text-secondary-text">{children}</tbody>;
          },
          tr({ children }) {
            return <tr className="hover:bg-soft-slate-black/35 transition-colors">{children}</tr>;
          },
          th({ children }) {
            return <th className="px-4 py-3 font-semibold">{children}</th>;
          },
          td({ children }) {
            return <td className="px-4 py-3">{children}</td>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-coral-glow/60 pl-4 py-1.5 italic text-secondary-text my-4 bg-coral-glow/5 rounded-r">
                {children}
              </blockquote>
            );
          },
          p({ children }) {
            return <div className="mb-3 last:mb-0">{children}</div>;
          },
          ul({ children }) {
            return <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>;
          },
          li({ children }) {
            return <li className="mb-0.5">{children}</li>;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
