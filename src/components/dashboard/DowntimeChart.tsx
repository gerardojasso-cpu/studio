"use client";

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";

export interface DowntimeData {
  reason: string;
  time: number;
}

interface DowntimeChartProps {
  data: DowntimeData[];
}

const chartConfig = {
  time: {
    label: "Tiempo (min)",
    color: "hsl(var(--accent))",
  },
} satisfies ChartConfig;

export function DowntimeChart({ data }: DowntimeChartProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-xl">Análisis de Tiempos de Paro</CardTitle>
        <CardDescription className="text-muted-foreground">Tiempo total de paro por motivo (minutos)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              accessibilityLayer
              data={data}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              layout="vertical"
            >
              <CartesianGrid horizontal={false} stroke="hsl(var(--border))" />
              <YAxis
                type="category"
                dataKey="reason"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                width={80}
                tickFormatter={(value) => value}
                className="fill-muted-foreground"
              />
              <XAxis
                type="number"
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={(value) => `${value}`}
                className="fill-muted-foreground"
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Bar dataKey="time" fill="hsl(var(--accent))" radius={5} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
