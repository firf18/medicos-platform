import * as React from "react";

export interface InfiniteScrollProps {
  children: React.ReactNode;
  direction?: "left" | "right";
  speed?: "slow" | "normal" | "fast";
  className?: string;
  pauseOnHover?: boolean;
  gap?: string;
}

export const InfiniteScroll: React.FC<InfiniteScrollProps> = null as any;