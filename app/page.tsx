'use client';
import Header from '@/components/header'
import React, { useEffect, useState } from 'react'
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import ClassIcon from '@mui/icons-material/Class';
import SchoolIcon from '@mui/icons-material/School';
import ScheduleIcon from '@mui/icons-material/Schedule';
import LineChartComponent from '@/components/line-chart';
import axios from 'axios';

interface DashboardStats {
  courseWatchtime: {
    total: number;
    thisWeek: number;
  };
  homeworkWatchtime: {
    total: number;
    thisWeek: number;
  };
  teachers: {
    total: number;
    thisWeek: number;
  };
  students: {
    total: number;
    thisWeek: number;
  };
  classrooms: {
    total: number;
    thisWeek: number;
  };
  homeworks: {
    total: number;
    thisWeek: number;
  };
  watchtime: {
    totalMinutes: number;
  };
}

interface ChartData {
  labels: string[];
  data: number[];
  label: string;
}

interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  total: number | string;
  thisWeek: number | string;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    courseWatchtime: { total: 0, thisWeek: 0 },
    homeworkWatchtime: { total: 0, thisWeek: 0 },
    teachers: { total: 0, thisWeek: 0 },
    students: { total: 0, thisWeek: 0 },
    classrooms: { total: 0, thisWeek: 0 },
    homeworks: { total: 0, thisWeek: 0 },
    watchtime: { totalMinutes: 0 }
  });

  // Chart controls
  const [dataType, setDataType] = useState<'users' | 'watchtime'>('users');
  const [timePeriod, setTimePeriod] = useState<'days' | 'weeks' | 'months'>('months');
  const [chartData, setChartData] = useState<ChartData>({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    data: [340, 385, 290, 445, 398, 520],
    label: 'User Accounts Created'
  });
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchDashboardStats = async () => {
    try {
      const url = `${API_BASE_URL}/dashboard-stats`;
      const response = await axios.get(url);
      if (response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setStats({
        courseWatchtime: { total: 0, thisWeek: 0 },
        homeworkWatchtime: { total: 0, thisWeek: 0 },
        teachers: { total: 0, thisWeek: 0 },
        students: { total: 0, thisWeek: 0 },
        classrooms: { total: 0, thisWeek: 0 },
        homeworks: { total: 0, thisWeek: 0 },
        watchtime: { totalMinutes: 0 }
      });
    }
  };

  const fetchChartData = async (type: string, period: string) => {
    try {
      const url = `${API_BASE_URL}/chart-data?type=${type}&period=${period}`;
      const response = await axios.get(url);
      if (response.data) {
        setChartData({
          labels: response.data.labels,
          data: response.data.data,
          label: type === 'users' ? 'User Accounts Created' : 'Watch Time (Hours)'
        });
      }
    } catch (error) {
      // Fallback data
      setChartData(generateFallbackData(type, period));
    }
  };

  const generateFallbackData = (type: string, period: string): ChartData => {
    let labels: string[] = [];
    let data: number[] = [];
    switch (period) {
      case 'days':
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        data = type === 'users'
          ? [12, 15, 8, 22, 18, 25, 20]
          : [45, 52, 38, 65, 48, 72, 58];
        break;
      case 'weeks':
        labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        data = type === 'users'
          ? [85, 92, 76, 110]
          : [320, 385, 298, 445];
        break;
      case 'months':
      default:
        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        data = type === 'users'
          ? [340, 385, 290, 445, 398, 520]
          : [1250, 1480, 1190, 1650, 1420, 1890];
        break;
    }
    return {
      labels,
      data,
      label: type === 'users' ? 'User Accounts Created' : 'Watch Time (Hours)'
    };
  };

  // Dropdown change handlers
  const handleDataTypeChange = (newType: 'users' | 'watchtime') => {
    setDataType(newType);
    fetchChartData(newType, timePeriod);
  };

  const handleTimePeriodChange = (newPeriod: 'days' | 'weeks' | 'months') => {
    setTimePeriod(newPeriod);
    fetchChartData(dataType, newPeriod);
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchChartData(dataType, timePeriod);
    // eslint-disable-next-line
  }, []);

  const formatWatchTime = (minutes: number) => {
    return `${Math.round(minutes/60)} Hrs`;
  };

  const MetricCard: React.FC<MetricCardProps> = ({ icon: Icon, label, total, thisWeek }) => (
    <li className='w-3/12 px-10'>
      <div className="bg-white w-full p-10 rounded-10 flex flex-wrap justify-between shadow-lg">
        <div className="bg-blue w-50 h-50 flex items-center justify-center rounded-5 text-white">
          <Icon />
        </div>
        <div className="flex flex-col items-end">
          <label>{label}</label>
          <b>{total}</b>
        </div>
        <div className="w-full border-solid border-t-1 border-[#f3f3f3] mt-11 pt-4 text-gray-600 text-14">
          {thisWeek} this week
        </div>
      </div>
    </li>
  );

  return (
    <div className="flex flex-wrap w-full flex-col">
      <Header onRefresh={fetchDashboardStats} />
      <ul className='flex flex-wrap -mx-10 mt-30'>
        <MetricCard 
          icon={GroupAddIcon}
          label="Total Course WatchTime"
          total={formatWatchTime(stats.courseWatchtime.total)}
          thisWeek={formatWatchTime(stats.courseWatchtime.thisWeek)}
        />
        <MetricCard 
          icon={GroupAddIcon}
          label="Total HW WatchTime"
          total={formatWatchTime(stats.homeworkWatchtime.total)}
          thisWeek={formatWatchTime(stats.homeworkWatchtime.thisWeek)}
        />
        <MetricCard 
          icon={ClassIcon}
          label="Total Classrooms"
          total={stats.classrooms.total}
          thisWeek={stats.classrooms.thisWeek}
        />
        <MetricCard 
          icon={SchoolIcon}
          label="Total Homeworks"
          total={stats.homeworks.total}
          thisWeek={stats.homeworks.thisWeek}
        />
      </ul>
<div className="grid grid-cols-1 gap-15 mt-10">
  <div className="bg-white w-full p-10 rounded-10 shadow-lg">
    {/* Chart Controls */}
    <div className="w-full mb-5 flex gap-4">
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-2">Data Type:</label>
        <select 
          value={dataType}
          onChange={(e) => handleDataTypeChange(e.target.value as 'users' | 'watchtime')}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="users">Users</option>
          <option value="watchtime">Watch Time</option>
        </select>
      </div>
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-2">Time Period:</label>
        <select 
          value={timePeriod}
          onChange={(e) => handleTimePeriodChange(e.target.value as 'days' | 'weeks' | 'months')}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="days">Daily</option>
          <option value="weeks">Weekly</option>
          <option value="months">Monthly</option>
        </select>
      </div>
    </div>
    <LineChartComponent 
      data={chartData.data}
      labels={chartData.labels}
      label={chartData.label}
    />
    <div className="w-full border-solid border-t-1 border-[#f3f3f3] mt-8 pt-4 text-gray-600 text-14 flex items-center">
      <ScheduleIcon className='text-14 text-gray mr-5'/>
      {dataType === 'users' ? `${stats.students.thisWeek} Users` : `${formatWatchTime(stats.courseWatchtime.thisWeek)} Watch Time`} this week
    </div>
  </div>
</div>

    </div>
  );
};

export default Dashboard;