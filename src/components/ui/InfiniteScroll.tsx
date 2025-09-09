'use client';

import { ReactNode } from 'react';

interface InfiniteScrollProps {
  children: ReactNode;
  direction?: 'left' | 'right';
  speed?: 'slow' | 'normal' | 'fast';
  className?: string;
}

export function InfiniteScroll({ 
  children, 
  direction = 'left', 
  speed = 'normal',
  className = "" 
}: InfiniteScrollProps) {
  const speedClass = {
    slow: 'animate-scroll-slow',
    normal: 'animate-scroll-normal', 
    fast: 'animate-scroll-fast'
  }[speed];

  const directionClass = direction === 'right' ? 'animate-scroll-reverse' : '';

  return (
    <div className={`overflow-hidden ${className}`}>
      <div className={`flex ${speedClass} ${directionClass}`}>
        <div className="flex animate-scroll whitespace-nowrap">
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