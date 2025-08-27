import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface KpiCardProps {
  title: string;
  value: string;
  unit?: string;
}

export function KpiCard({ title, value, unit }: KpiCardProps) {
  return (
    <Card className="flex flex-col justify-center bg-card/70 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-muted-foreground font-medium text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-[3.5rem] font-extrabold leading-none tracking-tight text-foreground">
            {value}
          </span>
          {unit && <span className="text-xl font-medium text-muted-foreground">{unit}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
