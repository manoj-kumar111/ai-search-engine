import { motion } from 'framer-motion';
import { ArrowRight, Lightbulb } from 'lucide-react';

interface FollowUpCardsProps {
  questions: string[];
  onSelect: (question: string) => void;
}

export function FollowUpCards({ questions, onSelect }: FollowUpCardsProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full max-w-3xl mx-auto mt-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-4 h-4 text-primary" />
        <span className="text-sm text-muted-foreground">Related questions</span>
      </div>

      <div className="grid gap-3">
        {questions.map((question, idx) => (
          <motion.button
            key={idx}
            variants={item}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(question)}
            className="group glass-card p-4 text-left transition-all duration-300 hover:border-primary/50"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="text-foreground/90 group-hover:text-foreground transition-colors">
                {question}
              </span>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
