import { motion } from 'framer-motion';

export function LoadingSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-3xl mx-auto"
    >
      <div className="glass-card p-6 space-y-4">
        {/* Thinking indicator */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-accent animate-pulse" />
            <div className="absolute inset-0 rounded-lg bg-linear-to-br from-primary to-accent blur-md opacity-50 animate-pulse-glow" />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">AI is thinking</span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-primary"
            >
              ...
            </motion.span>
          </div>
        </div>

        {/* Skeleton lines */}
        <div className="space-y-3">
          {[100, 95, 80, 90, 60].map((width, idx) => (
            <div
              key={idx}
              className="h-4 bg-secondary/50 rounded-lg relative overflow-hidden"
              style={{ width: `${width}%` }}
            >
              <motion.div
                className="absolute inset-0 bg-linear-to-r from-transparent via-muted/30 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: idx * 0.1,
                }}
              />
            </div>
          ))}
        </div>

        {/* Skeleton paragraph */}
        <div className="pt-4 space-y-3">
          {[90, 100, 85, 70].map((width, idx) => (
            <div
              key={idx}
              className="h-4 bg-secondary/50 rounded-lg relative overflow-hidden"
              style={{ width: `${width}%` }}
            >
              <motion.div
                className="absolute inset-0 bg-linear-to-r from-transparent via-muted/30 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: 0.5 + idx * 0.1,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
