import { useRef, useCallback } from 'react';

export function useTypingSound() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastPlayTimeRef = useRef(0);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playTypingSound = useCallback(() => {
    const now = Date.now();
    // Throttle sounds to prevent overwhelming audio
    if (now - lastPlayTimeRef.current < 30) return;
    lastPlayTimeRef.current = now;

    try {
      const ctx = getAudioContext();
      
      // Create oscillator for a soft click sound
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // Soft, subtle click sound
      oscillator.frequency.setValueAtTime(800 + Math.random() * 200, ctx.currentTime);
      oscillator.type = 'sine';
      
      // Quick fade in and out for click effect
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.005);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.03);
    } catch (error) {
      // Silently fail if audio context is not available
      console.warn('Audio context not available:', error);
    }
  }, [getAudioContext]);

  const cleanup = useCallback(() => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  return { playTypingSound, cleanup };
}
