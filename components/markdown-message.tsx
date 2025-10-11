import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

interface MarkdownMessageProps {
  content: string;
  isUser?: boolean;
}

export function MarkdownMessage({ content, isUser = false }: MarkdownMessageProps) {
  const components: Components = {
    // Paragraphs
    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
    
    // Headings
    h1: ({ children }) => <h1 className="text-lg font-bold mb-2 mt-3 first:mt-0">{children}</h1>,
    h2: ({ children }) => <h2 className="text-base font-bold mb-2 mt-3 first:mt-0">{children}</h2>,
    h3: ({ children }) => <h3 className="text-sm font-bold mb-1 mt-2 first:mt-0">{children}</h3>,
    
    // Lists
    ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
    li: ({ children }) => <li className="ml-2">{children}</li>,
    
    // Code
    code: ({ node, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      const isInline = !match;
      
      if (isInline) {
        return (
          <code 
            className={`px-1.5 py-0.5 rounded font-mono text-xs ${
              isUser 
                ? 'bg-primary-foreground/20' 
                : 'bg-muted-foreground/10'
            }`}
            {...props}
          >
            {children}
          </code>
        );
      }
      
      return (
        <code 
          className={`block p-3 rounded-lg font-mono text-xs overflow-x-auto my-2 ${
            isUser 
              ? 'bg-primary-foreground/20' 
              : 'bg-muted-foreground/10'
          }`}
          {...props}
        >
          {children}
        </code>
      );
    },
    
    // Pre (code blocks)
    pre: ({ children }) => <div className="my-2">{children}</div>,
    
    // Blockquotes
    blockquote: ({ children }) => (
      <blockquote className={`border-l-2 pl-3 py-1 my-2 italic ${
        isUser 
          ? 'border-primary-foreground/40' 
          : 'border-muted-foreground/40'
      }`}>
        {children}
      </blockquote>
    ),
    
    // Links
    a: ({ children, href }) => (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="underline hover:opacity-80 transition-opacity"
      >
        {children}
      </a>
    ),
    
    // Strong/Bold
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    
    // Emphasis/Italic
    em: ({ children }) => <em className="italic">{children}</em>,
    
    // Horizontal rule
    hr: () => <hr className="my-3 border-current opacity-20" />,
    
    // Tables
    table: ({ children }) => (
      <div className="overflow-x-auto my-2">
        <table className="min-w-full border-collapse text-xs">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => <thead className="border-b">{children}</thead>,
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => <tr className="border-b last:border-0">{children}</tr>,
    th: ({ children }) => (
      <th className="px-2 py-1 text-left font-semibold">{children}</th>
    ),
    td: ({ children }) => <td className="px-2 py-1">{children}</td>,
  };

  return (
    <div className="text-sm">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
