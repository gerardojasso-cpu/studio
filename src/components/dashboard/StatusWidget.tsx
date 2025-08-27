"use client";

import type { ElementType } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatusWidgetProps {
  status: string;
  subtext: string;
  color: string;
  Icon: ElementType;
  isPulsing: boolean;
  onClick: () => void;
  textColor?: string;
}

export function StatusWidget({ status, subtext, color, Icon, isPulsing, onClick, textColor = 'text-white' }: StatusWidgetProps) {
  return (
    <Card 
      className="h-full aspect-square max-w-sm w-full flex flex-col items-center justify-center text-center p-0 cursor-pointer hover:shadow-2xl transition-shadow duration-300 bg-transparent border-0 shadow-none"
      onClick={onClick}
    >
      <CardContent className="flex flex-col items-center justify-center p-0 w-full h-full">
        <div 
          className={cn(
            "relative flex items-center justify-center w-full h-full rounded-full transition-all duration-500 shadow-lg", 
            color,
            isPulsing && "animate-pulse"
          )}
        >
          <div className="absolute inset-0 rounded-full shadow-inner bg-black/10"></div>
          <div className="text-center">
            <Icon className={cn("h-24 w-24 md:h-32 md:w-32 mx-auto drop-shadow-lg", textColor)} />
            <h2 className={cn("text-4xl md:text-5xl font-bold mt-4 drop-shadow-md", textColor)}>{status}</h2>
          </div>
        </div>
        {subtext && <p className="text-lg md:text-xl text-muted-foreground mt-6 text-center">{subtext}</p>}
      </CardContent>
    </Card>
  );
}
