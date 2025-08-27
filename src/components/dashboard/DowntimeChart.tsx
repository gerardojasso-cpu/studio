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
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function DowntimeChart({ data }: DowntimeChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Análisis de Tiempos de Paro</CardTitle>
        <CardDescription>Tiempo total de paro por motivo en minutos</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              accessibilityLayer
              data={data}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="reason"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value}
                className="fill-muted-foreground"
              />
              <YAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={(value) => `${value} min`}
                className="fill-muted-foreground"
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Bar dataKey="time" radius={8} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
