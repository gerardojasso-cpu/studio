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
      className="h-full flex flex-col items-center justify-center text-center p-6 cursor-pointer hover:bg-card/80 transition-colors duration-300 bg-card/70 backdrop-blur-sm"
      onClick={onClick}
    >
      <CardContent className="flex flex-col items-center justify-center p-0">
        <div 
          className={cn(
            "relative flex items-center justify-center h-40 w-40 rounded-full mb-6 transition-all duration-500", 
            color, 
            isPulsing && "animate-pulse"
          )}
        >
          <Icon className="h-20 w-20 text-white/90" />
        </div>
        <h2 className="text-3xl font-bold text-foreground">{status}</h2>
        <p className="text-lg text-muted-foreground mt-1">{subtext}</p>
      </CardContent>
    </Card>
  );
}
