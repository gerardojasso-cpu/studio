import type { ElementType } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string;
  description: string;
  icon: ElementType;
  change: string;
  changeColor: string;
}

export function KpiCard({ title, value, description, icon: Icon, change, changeColor }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
        <span className={cn("text-xs font-semibold", changeColor)}>{change}</span>
      </CardHeader>
      <CardContent>
        <div className="text-5xl font-extrabold">{value}</div>
        <p className="text-xs">{description}</p>
      </CardContent>
    </Card>
  );
}
