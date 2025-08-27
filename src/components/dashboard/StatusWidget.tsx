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
}

export function StatusWidget({ status, subtext, color, Icon, isPulsing, onClick }: StatusWidgetProps) {
  return (
    <Card 
      className="h-full flex flex-col items-center justify-center text-center p-6 cursor-pointer hover:shadow-lg transition-shadow duration-300 bg-card"
      onClick={onClick}
    >
      <CardContent className="flex flex-col items-center justify-center p-0">
        <div 
          className={cn(
            "relative flex items-center justify-center h-48 w-48 rounded-full mb-6 transition-all duration-500 shadow-inner", 
            color, 
            isPulsing && "animate-pulse"
          )}
        >
          <Icon className="h-24 w-24 text-white/90" />
        </div>
        <h2 className="text-3xl font-bold text-foreground">{status}</h2>
        <p className="text-lg text-accent mt-1">{subtext}</p>
      </CardContent>
    </Card>
  );
}