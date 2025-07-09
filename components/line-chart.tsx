'use client';
import * as React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { useTheme } from 'next-themes';

// The component now accepts a 'height' prop to resolve the container error.
export default function LineChartComponent({ data, labels, label, height }: { data: number[], labels: string[], label: string, height: number }) {
  const { resolvedTheme } = useTheme();

  // Determine colors based on the current theme for better readability
  const axisColor = resolvedTheme === 'dark' ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground))';
  const gridColor = resolvedTheme === 'dark' ? 'hsl(var(--border))' : 'hsl(var(--border))';
  const primaryColor = 'hsl(222.2 47.4% 11.2%)'; // A consistent blue for the line

  return (
    <LineChart
      height={height} // Explicitly set the height here
      series={[
        {
          data,
          label,
          area: true,
          showMark: false,
          color: primaryColor,
          areaStyle: {
            fill: "url(#chart-gradient)",
          },
        },
      ]}
      xAxis={[
        {
          scaleType: 'point',
          data: labels,
          tickLabelStyle: { fill: axisColor },
        },
      ]}
      yAxis={[
        {
          tickLabelStyle: { fill: axisColor },
        },
      ]}
      grid={{ horizontal: true, strokeDasharray: '3 5', stroke: gridColor }}
      sx={{
        '.MuiChartsAxis-line, .MuiChartsAxis-tick': {
          stroke: gridColor,
        },
        '.MuiAreaElement-root': {
          fill: "url(#chart-gradient)",
        },
        '.MuiChartsLegend-series text': {
            fill: axisColor + ' !important',
        },
      }}
    >
      <defs>
        <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={primaryColor} stopOpacity={0.4}/>
          <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
        </linearGradient>
      </defs>
    </LineChart>
  );
}
