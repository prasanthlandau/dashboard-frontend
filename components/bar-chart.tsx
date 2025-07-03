import * as React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';

const pData = [12, 16, 9, 30, 19, 22, 3];
const xLabels = [
  'M',
  'T',
  'W',
  'T',
  'F',
  'S',
  's',
];

const BarChartComponent = () => {
  return (
    <BarChart
      width={500}
      height={300}
      series={[
        { data: pData, id: 'pvId', stack: 'total' },
      ]}
      xAxis={[{ data: xLabels, scaleType: 'band' }]}
    />
  )
}

export default BarChartComponent