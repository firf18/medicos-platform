'use client';

import { ReactNode } from 'react';

interface FlipCardProps {
  frontContent: ReactNode;
  backContent: ReactNode;
  className?: string;
}

export function FlipCard({ frontContent, backContent, className = "" }: FlipCardProps) {
  return (
    <div className={`flip-box ${className}`}>
      <div className="flip-box-inner">
        <div className="flip-box-front">
          {frontContent}
        </div>
        <div className="flip-box-back">
          {backContent}
        </div>
      </div>
      
      <style jsx>{`
        .flip-box {
          background-color: transparent;
          width: 100%;
          height: 300px;
          perspective: 1000px;
        }

        .flip-box-inner {
          position: relative;
          width: 100%;
          height: 100%;
          text-align: center;
          transition: transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1);
          transform-style: preserve-3d;
        }

        .flip-box:hover .flip-box-inner {
          transform: rotateY(180deg);
        }

        .flip-box-front, .flip-box-back {
          position: absolute;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 2rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .flip-box-front {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .flip-box-back {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}