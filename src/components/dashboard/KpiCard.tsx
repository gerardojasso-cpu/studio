import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface KpiCardProps {
  title: string;
  value: string;
  unit?: string;
}

export function KpiCard({ title, value, unit }: KpiCardProps) {
  return (
    <Card className="flex flex-col justify-center p-4">
      <CardHeader className="p-2 pb-0">
        <CardTitle className="text-muted-foreground font-medium text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold leading-none tracking-tight text-foreground">
            {value}
          </span>
          {unit && <span className="text-lg font-medium text-muted-foreground">{unit}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
