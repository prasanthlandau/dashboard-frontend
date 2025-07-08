
'use client';
import Header from '@/components/header'
import React, { useEffect, useState, useCallback } from 'react'
import { Users, GraduationCap, BookOpen, Clock } from 'lucide-react'
import LineChartComponent from '@/components/line-chart';
import axios, { AxiosError } from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Interfaces for our data structures
interface DashboardStats {
  courseWatchtime: { total: number; thisWeek: number; };
  homeworkWatchtime: { total: number; thisWeek: number; };
  teachers: { total: number; thisWeek: number; };
  students: { total: number; thisWeek: number; };
  classrooms: { total: number; thisWeek: number; };
  homeworks: { total: number; thisWeek: number; };
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
  color: string;
}

// Reusable status display components
const StatusDisplay = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center h-64 space-y-4">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    <p className="text-lg font-medium text-slate-600">{message}</p>
  </div>
);

const ErrorDisplay = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center h-64 bg-red-50 border border-red-200 rounded-lg p-6">
    <p className="text-lg font-medium text-red-700 text-center">{message}</p>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dataType, setDataType] = useState<'users' | 'watchtime'>('users');
  const [timePeriod, setTimePeriod] = useState<'days' | 'weeks' | 'months'>('months');
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    data: [],
    label: 'User Accounts Created'
  });
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchPageData = useCallback(async (curriculumId?: string) => {
    setIsLoading(true);
    setError(null);

    if (!API_BASE_URL) {
        setError("API URL is not configured. Please check your .env.local file.");
        setIsLoading(false);
        return;
    }

    try {
      const [statsResponse, chartResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/dashboard-stats`, { timeout: 15000 }),
        axios.get(`${API_BASE_URL}/chart-data?type=${dataType}&period=${timePeriod}`, { timeout: 15000 })
      ]);

      setStats(statsResponse.data);
      setChartData(chartResponse.data);

    } catch (err) {
      const axiosError = err as AxiosError;
      console.error('Error fetching dashboard data:', axiosError);
      setError(axiosError.code === 'ECONNABORTED' 
        ? 'Failed to load dashboard data: The request timed out.'
        : `Failed to load dashboard data. Status: ${axiosError.response?.status || 'Network Error'}`
      );
      setStats(null);
    } finally {
        setIsLoading(false);
    }
  }, [API_BASE_URL, dataType, timePeriod]);
  
  const fetchChartDataOnly = useCallback(async (type: string, period: string) => {
    try {
      const url = `${API_BASE_URL}/chart-data?type=${type}&period=${period}`;
      const response = await axios.get(url, { timeout: 10000 });
      setChartData(response.data);
    } catch (error) {
      console.error(`Error fetching chart data for type: ${type}, period: ${period}`, error);
      setChartData({ labels: [], data: [], label: 'Error loading chart data' });
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  const handleDataTypeChange = (newType: 'users' | 'watchtime') => {
    setDataType(newType);
    fetchChartDataOnly(newType, timePeriod);
  };

  const handleTimePeriodChange = (newPeriod: 'days' | 'weeks' | 'months') => {
    setTimePeriod(newPeriod);
    fetchChartDataOnly(dataType, newPeriod);
  };

  const formatWatchTime = (minutes: number) => {
    if (typeof minutes !== 'number' || isNaN(minutes)) return '0 Hrs';
    return `${Math.round(minutes / 60)} Hrs`;
  };

  const MetricCard: React.FC<MetricCardProps> = ({ icon: Icon, label, total, thisWeek, color }) => (
    <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-600 mb-1">{label}</p>
            <p className="text-2xl font-bold text-slate-900">{total}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-sm text-slate-600">
            <span className="font-medium text-slate-900">{thisWeek}</span> this week
          </p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full space-y-6">
      <Header onRefresh={fetchPageData} isLoading={isLoading} />

      {isLoading && <StatusDisplay message="Loading dashboard data..." />}
      {error && <ErrorDisplay message={error} />}
      
      {!isLoading && !error && stats && (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard 
              icon={Clock}
              label="Course WatchTime"
              total={formatWatchTime(stats.courseWatchtime.total)}
              thisWeek={formatWatchTime(stats.courseWatchtime.thisWeek)}
              color="bg-blue-500"
            />
            <MetricCard 
              icon={BookOpen}
              label="HW WatchTime"
              total={formatWatchTime(stats.homeworkWatchtime.total)}
              thisWeek={formatWatchTime(stats.homeworkWatchtime.thisWeek)}
              color="bg-green-500"
            />
            <MetricCard 
              icon={Users}
              label="Total Classrooms"
              total={stats.classrooms.total}
              thisWeek={stats.classrooms.thisWeek}
              color="bg-purple-500"
            />
            <MetricCard 
              icon={GraduationCap}
              label="Total Homeworks"
              total={stats.homeworks.total}
              thisWeek={stats.homeworks.thisWeek}
              color="bg-orange-500"
            />
          </div>

          {/* Chart Section */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-slate-900">
                Analytics Overview
              </CardTitle>
              <div className="flex gap-2 mt-4">
                {/* Add chart controls here if needed */}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="mb-6">
                <LineChartComponent 
                  data={chartData.data}
                  labels={chartData.labels}
                  label={chartData.label}
                />
              </div>
              <div className="flex items-center gap-2 pt-4 border-t border-slate-100 text-sm text-slate-600">
                <Clock className="h-4 w-4" />
                <span>
                  {dataType === 'users' 
                    ? `${stats.students.thisWeek} Users this week` 
                    : `${formatWatchTime(stats.courseWatchtime.thisWeek)} Watch Time this week`
                  }
                </span>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Dashboard;
