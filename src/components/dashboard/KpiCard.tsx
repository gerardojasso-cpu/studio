import type { ElementType } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  description: string;
  progress: number;
  icon: ElementType;
  change: string;
}

export function KpiCard({ title, value, description, progress, icon: Icon, change }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-5xl font-extrabold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        <div className="mt-4 flex items-center gap-2">
          <Progress value={progress} className="h-2" />
          <span className="text-xs font-semibold text-status-green">{change}</span>
        </div>
      </CardContent>
    </Card>
  );
}
