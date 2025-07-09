'use client';
import * as React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { useTheme } from 'next-themes';
import { Typography } from '@mui/material';

// The component now accepts a 'height' prop and handles theme-aware colors.
export default function LineChartComponent({ data, labels, label, height }: { data: number[], labels: string[], label: string, height: number }) {
  const { resolvedTheme } = useTheme();

  // Define theme-aware colors using simple hex codes to avoid parsing issues.
  const lineColor = resolvedTheme === 'dark' ? '#60A5FA' : '#3B82F6'; // Tailwind's blue-400 and blue-500
  const axisColor = resolvedTheme === 'dark' ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground))';
  const gridColor = resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  // Handle the case where there is no data to display.
  if (!data || data.length === 0) {
    return (
        <div style={{ height }} className="flex items-center justify-center">
            <Typography color="text.secondary">No data available for this view.</Typography>
        </div>
    );
  }

  return (
    <LineChart
      height={height}
      series={[
        {
          data,
          label,
          area: true,
          showMark: false,
          color: lineColor, // Use the safe hex color
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
        // Use a theme-specific ID for the gradient to prevent conflicts
        '.MuiAreaElement-root': {
          fill: `url(#chart-gradient-${resolvedTheme})`,
        },
        '.MuiChartsLegend-series text': {
            fill: axisColor + ' !important',
        },
      }}
    >
      <defs>
        <linearGradient id={`chart-gradient-${resolvedTheme}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={lineColor} stopOpacity={0.4}/>
          <stop offset="95%" stopColor={lineColor} stopOpacity={0}/>
        </linearGradient>
      </defs>
    </LineChart>
  );
}
