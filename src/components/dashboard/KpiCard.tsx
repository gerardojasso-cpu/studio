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
}

export function KpiCard({ title, value, description, progress, icon: Icon }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-5xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        <div className="flex items-center gap-2 mt-4">
          <Progress value={progress} className="h-2" />
          <span className="text-xs font-semibold text-emerald-500 flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" /> +{progress}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
