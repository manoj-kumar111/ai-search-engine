import { motion } from 'framer-motion';
import { Copy, RefreshCw, CheckCircle, Sparkles } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTypingSound } from '@/hooks/useTypingSound';

interface AIResponseProps {
  response: {
    content: string;
    timestamp: Date;
  };
  onRegenerate: () => void;
  onTypingComplete?: () => void;
}

export function AIResponse({ response, onRegenerate, onTypingComplete }: AIResponseProps) {
  const [copied, setCopied] = useState(false);
  const [displayedContent, setDisplayedContent] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const contentRef = useRef(response.content);
  const { playTypingSound, cleanup } = useTypingSound();

  const htmlToPlain = (html: string) => {
    let s = html;
    s = s.replace(/<li[^>]*>/gi, "- ");
    s = s.replace(/<\/li>/gi, "\n");
    s = s.replace(/<br\s*\/?>/gi, "\n");
    s = s.replace(/<\/(p|h[1-6]|ul|ol)>/gi, "\n\n");
    s = s.replace(/<[^>]+>/g, "");
    const doc = new DOMParser().parseFromString(s, "text/html");
    return (doc.body.textContent || "").replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  };

  const markdownToPlain = (md: string) => {
    return md
      .replace(/^###\s+/gm, "")
      .replace(/^##\s+/gm, "")
      .replace(/\*\*/g, "")
      .replace(/`/g, "")
      .trim();
  };

  useEffect(() => {
    // Reset when content changes
    contentRef.current = response.content;
    setDisplayedContent('');
    setIsTyping(true);
    
    let currentIndex = 0;
    const content = response.content;
    
    const typeNextChar = () => {
      if (currentIndex < content.length) {
        // Type multiple characters at once for faster effect
        const charsToAdd = Math.min(3, content.length - currentIndex);
        setDisplayedContent(content.slice(0, currentIndex + charsToAdd));
        currentIndex += charsToAdd;
        
        // Play typing sound
        playTypingSound();
        
        // Variable speed for more natural feel
        const nextChar = content[currentIndex];
        let delay = 15;
        if (nextChar === '.' || nextChar === '!' || nextChar === '?') delay = 80;
        else if (nextChar === ',' || nextChar === ':') delay = 40;
        else if (nextChar === '\n') delay = 60;
        
        setTimeout(typeNextChar, delay);
      } else {
        setIsTyping(false);
        onTypingComplete?.();
      }
    };

    const startDelay = setTimeout(typeNextChar, 300);
    return () => {
      clearTimeout(startDelay);
      cleanup();
    };
  }, [response.content, response.timestamp, playTypingSound, cleanup]);

  const handleCopy = async () => {
    const isHTML = /<\/?[a-z][\s\S]*>/i.test(response.content);
    const text = isHTML ? htmlToPlain(response.content) : markdownToPlain(response.content);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple markdown-like formatting or HTML rendering
  const formatContent = (content: string) => {
    const isHTML = /<\/?[a-z][\s\S]*>/i.test(content);
    if (isHTML) {
      return (
        <div
          className="space-y-2"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-lg font-semibold mt-6 mb-3 gradient-text">
            {line.replace('### ', '')}
          </h3>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-xl font-semibold mt-6 mb-3 text-foreground">
            {line.replace('## ', '')}
          </h2>
        );
      }
      // Bold text
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <p key={idx} className="font-semibold text-foreground my-2">
            {line.replace(/\*\*/g, '')}
          </p>
        );
      }
      // List items
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return (
          <li key={idx} className="ml-4 text-foreground/90 my-1 list-disc list-inside">
            {line.replace(/^[-•] /, '')}
          </li>
        );
      }
      // Numbered list
      if (/^\d+\. /.test(line)) {
        return (
          <li key={idx} className="ml-4 text-foreground/90 my-1 list-decimal list-inside">
            {line.replace(/^\d+\. /, '')}
          </li>
        );
      }
      // Code blocks
      if (line.startsWith('`') && line.endsWith('`')) {
        return (
          <code key={idx} className="block bg-secondary/80 px-4 py-3 rounded-lg my-3 text-sm font-mono text-primary">
            {line.replace(/`/g, '')}
          </code>
        );
      }
      // Empty lines
      if (!line.trim()) {
        return <br key={idx} />;
      }
      // Regular paragraphs
      return (
        <p key={idx} className="text-foreground/90 my-2 leading-relaxed">
          {line}
        </p>
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl mx-auto"
    >
      <div className="glass-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="absolute inset-0 rounded-lg bg-linear-to-br from-primary to-accent blur-md opacity-40" />
            </div>
            <span className="font-medium">NexusAI</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Copy button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary text-sm transition-colors"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span className="text-primary">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </motion.button>

            {/* Regenerate button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRegenerate}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary text-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Regenerate</span>
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-6"
        >
          <div className="prose prose-invert max-w-none">
            {formatContent(displayedContent)}
            {isTyping && (
              <span className="inline-block w-2 h-5 ml-1 bg-primary animate-pulse rounded-sm" />
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
