import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowUp, Loader2 } from 'lucide-react';

interface SearchInputProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  initialValue?: string;
  isSticky?: boolean;
}

export function SearchInput({ onSearch, isLoading, initialValue = '', isSticky }: SearchInputProps) {
  const [query, setQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
    }
  }, [query]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`w-full max-w-3xl mx-auto ${isSticky ? 'sticky bottom-4 z-40' : ''}`}
    >
      <form onSubmit={handleSubmit}>
        <div
          className={`relative glass-card overflow-hidden transition-all duration-300 ${
            isFocused ? 'glow-effect' : ''
          }`}
        >
          {/* Gradient border effect when focused */}
          {isFocused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 gradient-border pointer-events-none"
            />
          )}

          <div className="relative flex items-end gap-3 p-4">
            {/* Search icon */}
            <div className="shrink-0 pb-2">
              {isLoading ? (
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-accent flex items-center justify-center animate-pulse-glow">
                  <Loader2 className="w-5 h-5 text-primary-foreground animate-spin" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Input */}
            <textarea
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything… powered by AI"
              rows={1}
              className="flex-1 bg-transparent text-lg text-foreground placeholder:text-muted-foreground resize-none focus:outline-none min-h-12 py-2"
              style={{ maxHeight: '200px' }}
            />

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={!query.trim() || isLoading}
              whileHover={{ scale: query.trim() && !isLoading ? 1.05 : 1 }}
              whileTap={{ scale: query.trim() && !isLoading ? 0.95 : 1 }}
              className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                query.trim() && !isLoading
                  ? 'bg-linear-to-br from-primary to-accent text-primary-foreground shadow-lg'
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              <ArrowUp className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </form>

      {/* Helper text */}
      {!isSticky && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-4 text-sm text-muted-foreground"
        >
          Press <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs">Enter</kbd> to search or{' '}
          <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs">Shift + Enter</kbd> for new line
        </motion.p>
      )}
    </motion.div>
  );
}
