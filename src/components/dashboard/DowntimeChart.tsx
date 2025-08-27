"use client";

import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
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
    color: "hsl(var(--status-red))",
  },
} satisfies ChartConfig;

export function DowntimeChart({ data }: DowntimeChartProps) {
  return (
    <Card className="bg-card/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Análisis de Tiempos de Paro</CardTitle>
        <CardDescription>Tiempo total de paro por motivo en minutos</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{ left: 10, top: 10, right: 10, bottom: 10 }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="reason"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 10)}
              className="fill-muted-foreground"
            />
            <XAxis dataKey="time" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar dataKey="time" layout="vertical" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
