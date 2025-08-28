"use client";

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";

export interface DowntimeData {
  name: string;
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
        <CardTitle className="text-base">Motivos de Paro</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[150px] w-full">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              accessibilityLayer
              data={data}
              layout="horizontal"
              margin={{ left: -20, right: 20 }}
            >
              <CartesianGrid vertical={false} />
              <YAxis
                type="number"
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={5}
                className="text-xs"
              />
              <XAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={5}
                className="text-xs"
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Bar dataKey="time" fill="var(--color-time)" radius={4} barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
