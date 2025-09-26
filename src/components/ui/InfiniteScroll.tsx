'use client';

import { ReactNode, useRef } from 'react';

interface InfiniteScrollProps {
  children: ReactNode;
  direction?: 'left' | 'right';
  speed?: 'slow' | 'normal' | 'fast';
  className?: string;
  pauseOnHover?: boolean;
  gap?: string; // Nuevo prop para controlar el espacio entre copias
}

export function InfiniteScroll({ 
  children, 
  direction = 'left', 
  speed = 'normal',
  className = "",
  pauseOnHover = false,
  gap = "mr-8" // Valor por defecto para el espacio entre copias
}: InfiniteScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const speedClass = {
    slow: 'animate-scroll-slow',
    normal: 'animate-scroll-normal', 
    fast: 'animate-scroll-fast'
  }[speed];

  const directionClass = direction === 'right' ? 'animate-scroll-reverse' : '';

  const handleMouseEnter = () => {
    if (pauseOnHover && containerRef.current) {
      const animatedElements = containerRef.current.querySelectorAll('.animate-scroll');
      animatedElements.forEach(el => {
        (el as HTMLElement).style.animationPlayState = 'paused';
      });
    }
  };

  const handleMouseLeave = () => {
    if (pauseOnHover && containerRef.current) {
      const animatedElements = containerRef.current.querySelectorAll('.animate-scroll');
      animatedElements.forEach(el => {
        (el as HTMLElement).style.animationPlayState = 'running';
      });
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`overflow-hidden ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`flex ${speedClass} ${directionClass}`}>
        <div className={`flex animate-scroll whitespace-nowrap ${gap}`}>
          {children}
        </div>
        <div className="flex animate-scroll whitespace-nowrap" aria-hidden="true">
          {children}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        @keyframes scroll-reverse {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(0);
          }
        }

        .animate-scroll {
          animation: scroll 30s linear infinite;
        }

        .animate-scroll-reverse .animate-scroll {
          animation: scroll-reverse 30s linear infinite;
        }

        .animate-scroll-slow .animate-scroll {
          animation-duration: 50s;
        }

        .animate-scroll-normal .animate-scroll {
          animation-duration: 30s;
        }

        .animate-scroll-fast .animate-scroll {
          animation-duration: 20s;
        }
      `}</style>
    </div>
  );
}
