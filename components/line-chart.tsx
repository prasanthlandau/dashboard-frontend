"use client";
import * as React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "next-themes";

interface SeriesData {
  data: number[];
  label: string;
  color?: string;
  dataKey?: string;
}

export default function LineChartComponent({
  series,
  labels,
  height,
}: {
  series: SeriesData[];
  labels: string[];
  height: number;
}) {
  const { resolvedTheme } = useTheme();

  const axisColor = resolvedTheme === "dark" ? "#94a3b8" : "#334155";
  const gridColor =
    resolvedTheme === "dark"
      ? "rgba(255, 255, 255, 0.1)"
      : "rgba(0, 0, 0, 0.1)";
  const defaultLineColor = resolvedTheme === "dark" ? "#3b82f6" : "#3b82f6";

  if (
    !series ||
    series.length === 0 ||
    series.every((s) => s.data.length === 0)
  ) {
    return (
      <div style={{ height }} className="flex items-center justify-center">
        <p className="text-muted-foreground">
          No data available for this view.
        </p>
      </div>
    );
  }

  // Transform data for Recharts
  const chartData = labels.map((label, i) => {
    const dataPoint: Record<string, any> = { name: label };
    series.forEach((s) => {
      dataPoint[s.label] = s.data[i];
    });
    return dataPoint;
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="name" stroke={axisColor} />
        <YAxis stroke={axisColor} />
        <Tooltip />
        <Legend wrapperStyle={{ color: axisColor }} />
        <defs>
          {series.map((s, index) => (
            <linearGradient
              key={index}
              id={`chart-gradient-${index}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor={s.color || defaultLineColor}
                stopOpacity={resolvedTheme === "dark" ? 0.3 : 0.5}
              />
              <stop
                offset="95%"
                stopColor={s.color || defaultLineColor}
                stopOpacity={0}
              />
            </linearGradient>
          ))}
        </defs>
        {series.map((s, index) => (
          <Line
            key={index}
            type="monotone"
            dataKey={s.label}
            stroke={s.color || defaultLineColor}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 8 }}
            fill={`url(#chart-gradient-${index})`}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
