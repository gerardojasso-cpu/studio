import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface KpiCardProps {
  title: string;
  value: string;
  unit?: string;
}

export function KpiCard({ title, value, unit }: KpiCardProps) {
  return (
    <Card className="flex flex-col justify-center p-6 bg-card border-border text-center h-full shadow-md">
      <CardHeader className="p-0 mb-2">
        <CardTitle className="text-muted-foreground font-bold text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-8xl font-extrabold leading-none tracking-tighter text-foreground">
            {value}
          </span>
          {unit && <span className="text-2xl font-medium text-muted-foreground">{unit}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
