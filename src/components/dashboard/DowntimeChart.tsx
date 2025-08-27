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
  reason: string;
  time: number;
}

interface DowntimeChartProps {
  data: DowntimeData[];
}

const chartConfig = {
  time: {
    label: "Tiempo (h)",
    color: "hsl(var(--destructive))",
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
          <ResponsiveContainer width="100%" height={150}>
            <BarChart
              accessibilityLayer
              data={data}
              layout="vertical"
              margin={{ left: 10, right: 30 }}
            >
              <CartesianGrid horizontal={false} />
              <YAxis
                type="category"
                dataKey="reason"
                tickLine={false}
                axisLine={false}
                tickMargin={5}
                width={80}
                className="text-xs"
              />
              <XAxis
                type="number"
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={5}
                className="text-xs"
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Bar dataKey="time" fill="var(--color-time)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
