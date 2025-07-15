'use client';
import * as React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { useTheme } from 'next-themes';
import { Typography } from '@mui/material';

interface SeriesData {
    data: number[];
    label: string;
    color?: string;
}

export default function LineChartComponent({ series, labels, height }: { series: SeriesData[], labels: string[], height: number }) {
  const { resolvedTheme } = useTheme();

  const axisColor = resolvedTheme === 'dark' ? '#94a3b8' : '#334155'; 
  const gridColor = resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const defaultLineColor = resolvedTheme === 'dark' ? '#3b82f6' : '#3b82f6'; 

  if (!series || series.length === 0 || series.every(s => s.data.length === 0)) {
    return (
        <div style={{ height }} className="flex items-center justify-center">
            <Typography color="text.secondary">No data available for this view.</Typography>
        </div>
    );
  }

  return (
    <LineChart
      height={height}
      series={series.map((s, index) => ({
        ...s,
        area: true,
        showMark: false,
        color: s.color || defaultLineColor,
        // Apply a unique gradient for each series
        areaStyle: {
          fill: `url(#chart-gradient-${index})`,
        },
      }))}
      xAxis={[{
        scaleType: 'point',
        data: labels,
        tickLabelStyle: { fill: axisColor },
      }]}
      yAxis={[{
        tickLabelStyle: { fill: axisColor },
      }]}
      grid={{ horizontal: true, strokeDasharray: '3 5', stroke: gridColor }}
      sx={{
        '.MuiChartsAxis-line, .MuiChartsAxis-tick': {
          stroke: gridColor,
        },
        '.MuiChartsLegend-series text': {
            fill: axisColor + ' !important',
        },
      }}
    >
      <defs>
        
        {series.map((s, index) => (
            <linearGradient key={index} id={`chart-gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={s.color || defaultLineColor} stopOpacity={resolvedTheme === 'dark' ? 0.3 : 0.5}/>
                <stop offset="95%" stopColor={s.color || defaultLineColor} stopOpacity={0}/>
            </linearGradient>
        ))}
      </defs>
    </LineChart>
  );
}
