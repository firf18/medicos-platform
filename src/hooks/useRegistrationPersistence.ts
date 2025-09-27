'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'doctor-registration-progress';

interface RegistrationProgress {
  step: string;
  data: any;
  timestamp: number;
}

interface UseRegistrationPersistenceReturn {
  hasSavedProgress: boolean;
  saveProgress: (step: string, data: any) => void;
  loadProgress: () => { progress: RegistrationProgress | null };
  clearProgress: () => void;
}

export const useRegistrationPersistence = (): UseRegistrationPersistenceReturn => {
  const [hasSavedProgress, setHasSavedProgress] = useState(false);

  useEffect(() => {
    // Check if there's saved progress on mount
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const progress: RegistrationProgress = JSON.parse(saved);
        // Check if progress is not too old (24 hours)
        const isRecent = Date.now() - progress.timestamp < 24 * 60 * 60 * 1000;
        setHasSavedProgress(isRecent);
      }
    } catch (error) {
      console.error('Error checking saved progress:', error);
      setHasSavedProgress(false);
    }
  }, []);

  const saveProgress = useCallback((step: string, data: any) => {
    try {
      const progress: RegistrationProgress = {
        step,
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      setHasSavedProgress(true);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, []);

  const loadProgress = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const progress: RegistrationProgress = JSON.parse(saved);
        // Check if progress is not too old (24 hours)
        const isRecent = Date.now() - progress.timestamp < 24 * 60 * 60 * 1000;
        return { progress: isRecent ? progress : null };
      }
      return { progress: null };
    } catch (error) {
      console.error('Error loading progress:', error);
      return { progress: null };
    }
  }, []);

  const clearProgress = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setHasSavedProgress(false);
    } catch (error) {
      console.error('Error clearing progress:', error);
    }
  }, []);

  return {
    hasSavedProgress,
    saveProgress,
    loadProgress,
    clearProgress
  };
};

