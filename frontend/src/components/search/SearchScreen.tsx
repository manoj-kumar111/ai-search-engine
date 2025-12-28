import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchInput } from './SearchInput';
import { AIResponse } from './AIResponse';
import { FollowUpCards } from './FollowUpCards';
import { LoadingSkeleton } from './LoadingSkeleton';
import { Navbar } from '../layout/Navbar';
import { Sparkles } from 'lucide-react';

type Source = { title: string; url: string; content: string };

interface SearchScreenProps {
  user: { name: string; email: string };
  onLogout: () => void;
}

export function SearchScreen({ user, onLogout }: SearchScreenProps) {
  const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<{ content: string; timestamp: Date } | null>(null);
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showFollowUps, setShowFollowUps] = useState(false);

  const performSearch = useCallback(async (searchQuery: string) => {
    setQuery(searchQuery);
    setIsLoading(true);
    setHasSearched(true);
    setResponse(null);
    setShowFollowUps(false);

    try {
      const sourcesRes = await fetch(`${API_BASE}/api/getSources`.replace(/\/api\/api\//, '/api/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: searchQuery }),
      });
      if (!sourcesRes.ok) throw new Error('Failed to fetch sources');
      const sources: Source[] = await sourcesRes.json();

      const answerRes = await fetch(`${API_BASE}/api/getAnswer`.replace(/\/api\/api\//, '/api/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: searchQuery, sources }),
      });
      if (!answerRes.body) {
        const text = await answerRes.text().catch(() => '');
        throw new Error(text || 'No response body from getAnswer');
      }
      const reader = answerRes.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      // Read entire stream
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
      }

      setResponse({
        content: fullText,
        timestamp: new Date(),
      });

      const followRes = await fetch(`${API_BASE}/api/getSimilarQuestions`.replace(/\/api\/api\//, '/api/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: searchQuery, sources }),
      });
      if (followRes.ok) {
        const qs: string[] = await followRes.json();
        setFollowUps(qs);
      } else {
        setFollowUps([]);
      }
    } catch (e) {
      setResponse({
        content:
          '## Error\n\nWe could not generate an answer. Please try again or check your backend server.',
        timestamp: new Date(),
      });
      setFollowUps([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRegenerate = useCallback(() => {
    if (query) {
      performSearch(query);
    }
  }, [query, performSearch]);

  const handleFollowUp = useCallback((question: string) => {
    performSearch(question);
  }, [performSearch]);

  const handleTypingComplete = useCallback(() => {
    setShowFollowUps(true);
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar user={user} onLogout={onLogout} />

      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-125 h-125 bg-primary/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/3 right-1/4 w-125 h-125 bg-accent/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative pt-24 pb-32 px-4">
        <AnimatePresence mode="wait">
          {!hasSearched ? (
            // Initial centered search view
            <motion.div
              key="initial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="min-h-[60vh] flex flex-col items-center justify-center"
            >
              {/* Welcome text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
              >
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary to-accent flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-primary to-accent blur-xl opacity-40" />
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  <span className="gradient-text">Explore the Future</span>
                  <br />
                  <span className="text-foreground">of Search</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-md mx-auto">
                  Ask anything and get intelligent, comprehensive answers powered by advanced AI.
                </p>
              </motion.div>

              <SearchInput onSearch={performSearch} isLoading={isLoading} />
            </motion.div>
          ) : (
            // Results view
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-3xl mx-auto space-y-6"
            >
              {/* Current query display */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
              >
                <p className="text-sm text-muted-foreground mb-2">Searching for</p>
                <h2 className="text-2xl font-semibold text-foreground">"{query}"</h2>
              </motion.div>

              {/* Loading or Response */}
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <LoadingSkeleton key="loading" />
                ) : (
                  response && (
                    <motion.div
                      key="response"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-6"
                    >
                      <AIResponse response={response} onRegenerate={handleRegenerate} onTypingComplete={handleTypingComplete} />
                      {showFollowUps && <FollowUpCards questions={followUps} onSelect={handleFollowUp} />}
                    </motion.div>
                  )
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sticky search bar when results are shown */}
      {hasSearched && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-linear-to-t from-background via-background to-transparent">
          <SearchInput
            onSearch={performSearch}
            isLoading={isLoading}
            initialValue=""
            isSticky
          />
        </div>
      )}
    </div>
  );
}
