/**
 * Countdown Timer Hook
 * @fileoverview React hook for managing countdown timers with real-time updates
 * @compliance HIPAA-compliant timer management
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseCountdownTimerReturn {
  timeLeft: number;
  isActive: boolean;
  start: (duration: number) => void;
  stop: () => void;
  reset: () => void;
  formatTime: (seconds: number) => string;
}

export const useCountdownTimer = (): UseCountdownTimerReturn => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start countdown
  const start = useCallback((duration: number) => {
    if (duration <= 0) return;

    setTimeLeft(duration);
    setIsActive(true);

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start new interval
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsActive(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Stop countdown
  const stop = useCallback(() => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Reset countdown
  const reset = useCallback(() => {
    setTimeLeft(0);
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Format time as MM:SS
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    timeLeft,
    isActive,
    start,
    stop,
    reset,
    formatTime
  };
};
