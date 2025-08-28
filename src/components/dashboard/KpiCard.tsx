import type { ElementType } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string;
  description: string;
  icon: ElementType;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
}

const changeColorMap = {
  positive: 'text-status-green',
  negative: 'text-destructive',
  neutral: 'text-status-orange',
};

export function KpiCard({ title, value, description, icon: Icon, change, changeType }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
        <span className={cn("text-xs font-semibold", changeColorMap[changeType])}>{change}</span>
      </CardHeader>
      <CardContent>
        <div className="text-5xl font-extrabold">{value}</div>
        <p className="text-xs text-card-foreground/80">{description}</p>
      </CardContent>
    </Card>
  );
}
