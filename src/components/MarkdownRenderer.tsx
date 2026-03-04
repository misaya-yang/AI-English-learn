import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const sanitizeMarkdownContent = (raw: string): string => {
  const trimmed = raw.trim();
  if (!trimmed) return '';

  const objectDumpMatches = trimmed.match(/\[object Object\]/g);
  if (objectDumpMatches && objectDumpMatches.length >= 2) {
    return 'The response payload was malformed. Please retry.';
  }

  const tryExtractEnvelopeText = (value: string): string => {
    if (!value.startsWith('{') || !value.endsWith('}')) return '';
    try {
      const parsed = JSON.parse(value) as { content?: unknown; text?: unknown; message?: unknown };
      const candidate =
        (typeof parsed.content === 'string' && parsed.content.trim()) ||
        (typeof parsed.text === 'string' && parsed.text.trim()) ||
        (typeof parsed.message === 'string' && parsed.message.trim()) ||
        '';
      return candidate;
    } catch {
      return '';
    }
  };

  const fencedMatch = trimmed.match(/^```(?:json|markdown|md)?\s*([\s\S]*?)```$/i);
  if (fencedMatch?.[1]) {
    const parsed = tryExtractEnvelopeText(fencedMatch[1].trim());
    if (parsed) return parsed;
  }

  const parsed = tryExtractEnvelopeText(trimmed);
  if (parsed) return parsed;

  return raw;
};

// Custom code block component
const CodeBlock: React.FC<{ children: string; className?: string }> = ({ children, className }) => {
  const language = className?.replace('language-', '') || 'text';
  
  return (
    <div className="relative group my-3">
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted-foreground/10 rounded-t-lg text-xs">
        <span className="text-muted-foreground font-mono">{language}</span>
        <button
          onClick={() => navigator.clipboard.writeText(children)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          Copy
        </button>
      </div>
      <pre className="bg-muted/50 p-3 rounded-b-lg overflow-x-auto">
        <code className={cn('text-sm font-mono', className)}>{children}</code>
      </pre>
    </div>
  );
};

// Custom inline code component
const InlineCode: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <code className="px-1.5 py-0.5 bg-muted rounded text-sm font-mono text-emerald-600 dark:text-emerald-400">
    {children}
  </code>
);

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
  const safeContent = sanitizeMarkdownContent(content);
  const hasMarkdownSyntax = /[`*_#[\]|>-]|(?:\n\s*\d+\.)|(?:\n\s*[-*+]\s)/.test(safeContent);
  const hasCodeFence = /```/.test(safeContent);

  if (!hasMarkdownSyntax) {
    return (
      <div className={cn('markdown-content max-w-none', className)}>
        <p className="text-[15px] leading-8 whitespace-pre-wrap">{safeContent}</p>
      </div>
    );
  }

  return (
    <div className={cn('markdown-content prose prose-sm dark:prose-invert max-w-none', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={hasCodeFence ? [rehypeHighlight, rehypeRaw] : [rehypeRaw]}
        components={{
          // Custom code blocks
          code({
            inline,
            className,
            children,
          }: {
            inline?: boolean;
            className?: string;
            children?: React.ReactNode;
          }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <CodeBlock className={className}>{String(children).replace(/\n$/, '')}</CodeBlock>
            ) : (
              <InlineCode>{children}</InlineCode>
            );
          },
          // Custom headings
          h1: ({ children }) => <h1 className="text-xl font-bold mt-4 mb-2 text-foreground">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-semibold mt-4 mb-2 text-foreground">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-semibold mt-3 mb-1.5 text-foreground">{children}</h3>,
          // Custom paragraphs
          p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
          // Custom lists
          ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
          // Custom blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-emerald-500 pl-4 py-1 my-2 bg-muted/30 rounded-r">
              {children}
            </blockquote>
          ),
          // Custom tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-3">
              <table className="min-w-full border-collapse border border-border">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
          th: ({ children }) => (
            <th className="border border-border px-3 py-2 text-left font-semibold">{children}</th>
          ),
          td: ({ children }) => <td className="border border-border px-3 py-2">{children}</td>,
          // Custom links
          a: ({ children, href }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-emerald-600 hover:text-emerald-700 underline"
            >
              {children}
            </a>
          ),
          // Custom horizontal rule
          hr: () => <hr className="my-4 border-border" />,
        }}
      >
        {safeContent}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
