'use client';
import { PieChart } from '@mui/x-charts/PieChart';

interface PieChartProps {
  totalUsers: number;
  teachers: number;
  students: number;
}

const PieChartComponent = ({ totalUsers, teachers, students }: PieChartProps) => {
  const chartData = [
    { id: 0, value: students, label: 'Students', color: '#00B8B0' },
    { id: 1, value: teachers, label: 'Teachers', color: '#0066cc' }
  ];

  return (
    <div className="bg-white rounded-lg p-4">
      <div style={{ position: 'relative', height: '240px' }}>
        <PieChart
          series={[
            {
              data: chartData,
              innerRadius: 55,
              outerRadius: 80,
              paddingAngle: 3,
              cornerRadius: 5,
              startAngle: -90,
              endAngle: 270,
              cx: 150,
              cy: 110,
              highlightScope: { faded: 'global', highlighted: 'item' },
              faded: { innerRadius: 65, additionalRadius: -20, color: 'gray' }
            }
          ]}
          width={310}
          height={230}
          legend={{
            direction: 'row',
            position: { vertical: 'bottom', horizontal: 'middle' },
            padding: 0,
            labelStyle: {
              fontSize: 12,
            }
          }}
        />
        <div style={{
          position: 'absolute',
          top: '48%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {totalUsers}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Total Users
          </div>
        </div>
      </div>
    </div>
  );
};

export default PieChartComponent;
