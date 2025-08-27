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
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-5xl font-extrabold" style={{fontSize: '3.5rem'}}>{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        <div className="mt-4">
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
