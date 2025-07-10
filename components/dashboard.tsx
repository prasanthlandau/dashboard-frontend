'use client';
import Header from '@/components/header';
import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, BookOpen, GraduationCap } from 'lucide-react';
import LineChartComponent from '@/components/line-chart';
import axios, { AxiosError } from 'axios';
import { CircularProgress, Typography } from '@mui/material';
import { useApp } from './app-context';

// Interfaces for our data structures
interface DashboardStats {
  courseWatchtime: { total: number; thisWeek: number; };
  homeworkWatchtime: { total: number; thisWeek: number; };
  classrooms: { total: number; thisWeek: number; };
  homeworks: { total: number; thisWeek: number; };
  students: { total: number; thisWeek: number; };
}

interface ChartSeries {
  data: number[];
  label: string;
  color?: string;
}

interface ChartData {
  labels: string[];
  series: ChartSeries[];
}

interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  total: string;
  thisWeek: string;
  borderColor: string;
}

// Reusable status display components
const StatusDisplay = ({ message, isError = false }: { message: string, isError?: boolean }) => (
    <div className={`flex flex-col items-center justify-center h-64 rounded-lg ${isError ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
        {!isError && <CircularProgress />}
        <Typography variant="h6" className={`mt-4 ${isError ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}>{message}</Typography>
    </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dataType, setDataType] = useState<'users' | 'watchtime'>('users');
  const [timePeriod, setTimePeriod] = useState<'months'>('months');
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    series: [],
  });
  
  const { startDate, endDate } = useApp();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchChartData = useCallback(async (type: string, period: string) => {
    try {
      const url = `${API_BASE_URL}/chart-data?type=${type}&period=${period}`;
      const response = await axios.get(url, { timeout: 10000 });
      setChartData(response.data);
    } catch (error) {
      console.error(`Error fetching chart data for type: ${type}, period: ${period}`, error);
      setChartData({ labels: [], series: [{ data: [], label: 'Error loading chart data' }] });
    }
  }, [API_BASE_URL]);

  const fetchPageData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const statsUrl = `${API_BASE_URL}/dashboard-stats?startDate=${startDate}&endDate=${endDate}`;
      const chartUrl = `${API_BASE_URL}/chart-data?type=${dataType}&period=${timePeriod}`;

      const [statsResponse, chartResponse] = await Promise.all([
        axios.get(statsUrl),
        axios.get(chartUrl)
      ]);

      setStats(statsResponse.data);
      setChartData(chartResponse.data);

    } catch (err) {
      const axiosError = err as AxiosError;
      console.error('Error fetching dashboard data:', axiosError);
      setError(axiosError.code === 'ECONNABORTED' 
        ? 'The request timed out. Please check the backend server.'
        : `Failed to load dashboard data.`
      );
    } finally {
        setIsLoading(false);
    }
  }, [API_BASE_URL, startDate, endDate, dataType, timePeriod]);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  const handleDataTypeChange = (newType: 'users' | 'watchtime') => {
    setDataType(newType);
    fetchChartData(newType, timePeriod);
  };

  const handleTimePeriodChange = (newPeriod: 'days' | 'weeks' | 'months') => {
    setTimePeriod(newPeriod);
    fetchChartData(dataType, newPeriod);
  };

  const formatWatchTime = (minutes: number) => {
    if (typeof minutes !== 'number' || isNaN(minutes)) return '0 Hrs';
    return `${Math.round(minutes / 60)} Hrs`;
  };

  const MetricCard: React.FC<MetricCardProps> = ({ icon: Icon, label, total, thisWeek, borderColor }) => (
    <Card className={`shadow-sm hover:shadow-lg transition-shadow border-l-4 ${borderColor}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
            <Icon className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-3xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground">{thisWeek}</p>
        </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col gap-6">
      <Header onRefresh={fetchPageData} isLoading={isLoading} />
      
      {isLoading && <StatusDisplay message="Loading Dashboard..." />}
      {error && <StatusDisplay message={error} isError />}
      
      {!isLoading && !error && stats && (
        <div className="space-y-6">
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            <MetricCard 
              icon={Clock}
              label="Course WatchTime"
              total={formatWatchTime(stats.courseWatchtime.total)}
              thisWeek={`${formatWatchTime(stats.courseWatchtime.thisWeek)} this week`}
              borderColor="border-l-blue-500"
            />
            <MetricCard 
              icon={Clock}
              label="HW WatchTime"
              total={formatWatchTime(stats.homeworkWatchtime.total)}
              thisWeek={`${formatWatchTime(stats.homeworkWatchtime.thisWeek)} this week`}
              borderColor="border-l-green-500"
            />
            <MetricCard 
              icon={BookOpen}
              label="Total Classrooms"
              total={stats.classrooms.total.toString()}
              thisWeek={`${stats.classrooms.thisWeek} this week`}
              borderColor="border-l-purple-500"
            />
            <MetricCard 
              icon={GraduationCap}
              label="Total Homeworks"
              total={stats.homeworks.total.toString()}
              thisWeek={`${stats.homeworks.thisWeek} this week`}
              borderColor="border-l-orange-500"
            />
          </div>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Analytics Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full mb-5 flex gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-muted-foreground mb-1">Data Type:</label>
                  <select 
                    value={dataType}
                    onChange={(e) => handleDataTypeChange(e.target.value as 'users' | 'watchtime')}
                    className="px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="users">Users</option>
                    <option value="watchtime">Watch Time</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-muted-foreground mb-1">Time Period:</label>
                  <select 
                    value={timePeriod}
                    onChange={(e) => handleTimePeriodChange(e.target.value as 'days' | 'weeks' | 'months')}
                    className="px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="days">Last 7 Days</option>
                    <option value="weeks">Last 4 Weeks</option>
                    <option value="months">Last 6 Months</option>
                  </select>
                </div>
              </div>
              <div style={{ height: '400px' }}>
                <LineChartComponent 
                  height={400} 
                  labels={chartData.labels}
                  series={chartData.series}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
