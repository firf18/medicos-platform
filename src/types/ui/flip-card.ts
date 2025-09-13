import * as React from "react";

export interface FlipCardProps {
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  className?: string;
  frontBackgroundColor?: string;
  backBackgroundColor?: string;
}

export const FlipCard: React.FC<FlipCardProps> = null as any;