'use client';

import { useState, useEffect, useCallback } from 'react';

export function useAccessibility() {
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');

  // Detectar preferencias del usuario
  useEffect(() => {
    // Detectar modo de alto contraste
    const detectHighContrast = () => {
      // Esta es una detección básica, en la práctica se podría usar
      // window.matchMedia('(prefers-contrast: high)') cuando sea más ampliamente soportado
      const savedHighContrast = localStorage.getItem('highContrast') === 'true';
      setIsHighContrast(savedHighContrast);
    };

    // Detectar preferencia de movimiento reducido
    const detectReducedMotion = () => {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setIsReducedMotion(!mediaQuery || mediaQuery.matches);
      
      const handleChange = (e: MediaQueryListEvent) => {
        setIsReducedMotion(e.matches);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    };

    // Cargar tamaño de fuente
    const loadFontSize = () => {
      const savedFontSize = localStorage.getItem('fontSize') as 'small' | 'medium' | 'large' | null;
      if (savedFontSize) {
        setFontSize(savedFontSize);
      }
    };

    detectHighContrast();
    detectReducedMotion();
    loadFontSize();
  }, []);

  // Aplicar clases CSS según las preferencias
  useEffect(() => {
    // Aplicar clase de alto contraste
    if (isHighContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    
    // Guardar preferencia de alto contraste
    localStorage.setItem('highContrast', isHighContrast.toString());
  }, [isHighContrast]);

  useEffect(() => {
    // Aplicar clase de tamaño de fuente
    document.documentElement.classList.remove('text-small', 'text-medium', 'text-large');
    document.documentElement.classList.add(`text-${fontSize}`);
    
    // Guardar tamaño de fuente
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  // Funciones para cambiar las preferencias
  const toggleHighContrast = useCallback(() => {
    setIsHighContrast(prev => !prev);
  }, []);

  const setReducedMotion = useCallback((value: boolean) => {
    setIsReducedMotion(value);
  }, []);

  const changeFontSize = useCallback((size: 'small' | 'medium' | 'large') => {
    setFontSize(size);
  }, []);

  // Hook para manejar focus visible (solo mostrar outline cuando se usa teclado)
  const useFocusVisible = () => {
    const [isFocusVisible, setIsFocusVisible] = useState(false);

    useEffect(() => {
      const handleKeyDown = () => {
        setIsFocusVisible(true);
      };

      const handleMouseDown = () => {
        setIsFocusVisible(false);
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('mousedown', handleMouseDown);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('mousedown', handleMouseDown);
      };
    }, []);

    return { isFocusVisible };
  };

  // Hook para manejar navegación por teclado
  const useKeyboardNavigation = (onEnter?: () => void, onEscape?: () => void) => {
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && onEnter) {
          onEnter();
        }
        if (e.key === 'Escape' && onEscape) {
          onEscape();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onEnter, onEscape]);
  };

  // Hook para manejar ARIA attributes
  const useAriaAttributes = () => {
    const [ariaLabel, setAriaLabel] = useState<string | undefined>(undefined);
    const [ariaDescribedBy, setAriaDescribedBy] = useState<string | undefined>(undefined);
    const [ariaExpanded, setAriaExpanded] = useState<boolean | undefined>(undefined);
    const [ariaHidden, setAriaHidden] = useState<boolean | undefined>(undefined);

    return {
      ariaLabel,
      setAriaLabel,
      ariaDescribedBy,
      setAriaDescribedBy,
      ariaExpanded,
      setAriaExpanded,
      ariaHidden,
      setAriaHidden
    };
  };

  return {
    // Estados
    isHighContrast,
    isReducedMotion,
    fontSize,
    
    // Funciones para cambiar preferencias
    toggleHighContrast,
    setReducedMotion,
    changeFontSize,
    
    // Hooks auxiliares
    useFocusVisible,
    useKeyboardNavigation,
    useAriaAttributes
  };
}