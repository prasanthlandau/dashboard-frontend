import * as React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';

interface LineChartProps {
  data: number[];
  labels: string[];
  label: string;
}

const LineChartComponent: React.FC<LineChartProps> = ({ 
  data, 
  labels, 
  label 
}) => {
  return (
    <LineChart
      width={1000}
      height={600}
      series={[{ 
        data: data, 
        label: label, 
        area: true, 
        showMark: false,
        color: label.includes('Watch Time') ? '#ff6b6b' : '#4dabf7'
      }]}
      xAxis={[{ scaleType: 'point', data: labels }]}
      yAxis={[{ 
        label: label.includes('Watch Time') ? 'Hours' : 'Count'
      }]}
    />
  )
}

export default LineChartComponent
