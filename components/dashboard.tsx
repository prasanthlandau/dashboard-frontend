'use client';
import Header from '@/components/header';
import React, { useEffect, useState, useCallback } from 'react';
import { Users, GraduationCap, BookOpen, Clock } from 'lucide-react';
import { AjaxChart } from '@/components/ajax-chart';
import axios, { AxiosError } from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from './app-context';
import Footer from '../components/footer'

// Interfaces for our data structures
interface DashboardStats {
  courseWatchtime: { total: number; thisWeek: number; };
  homeworkWatchtime: { total: number; thisWeek: number; };
  classrooms: { total: number; thisWeek: number; };
  homeworks: { total: number; thisWeek: number; };
}

interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  total: number | string;
  thisWeek: number | string;
  color: string;
}

// Status and error display components
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

  const { startDate, endDate } = useApp();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Fetches all page data, including stats (uses date range from context)
  const fetchPageData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (!API_BASE_URL) {
      setError("API URL is not configured. Please check your .env.local file.");
      setIsLoading(false);
      return;
    }

    try {
      const statsResponse = await axios.get(
        `${API_BASE_URL}/dashboard-stats?startDate=${startDate}&endDate=${endDate}`,
        { timeout: 15000 }
      );
      setStats(statsResponse.data);
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error('Error fetching dashboard data:', axiosError);
      setError(
        axiosError.code === 'ECONNABORTED'
          ? 'Failed to load dashboard data: The request timed out.'
          : `Failed to load dashboard data. Status: ${axiosError.response?.status || 'Network Error'}`
      );
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, startDate, endDate]);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  const formatWatchTime = (minutes: number) => {
    if (typeof minutes !== 'number' || isNaN(minutes)) return '0 Hrs';
    return `${Math.round(minutes / 60)} Hrs`;
  };

  const MetricCard: React.FC<MetricCardProps> = ({ icon: Icon, label, total, thisWeek, color }) => (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <div className={`p-2 rounded-full ${color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{total}</div>
        {/*<p className="text-sm text-muted-foreground mt-1">{thisWeek} this week</p>*/}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Header onRefresh={fetchPageData} isLoading={isLoading} />

      {/* Main Layout */}
      <div className="flex">
        {/* Main Content */}
        <main className="flex-1 p-6">
          {isLoading && <StatusDisplay message="Loading dashboard data..." />}
          {error && <ErrorDisplay message={error} />}

          {!isLoading && !error && stats && (
            <>
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard
                  icon={Clock}
                  label="Course WatchTime"
                  total={formatWatchTime(stats.courseWatchtime.total)}
                  thisWeek={formatWatchTime(stats.courseWatchtime.thisWeek)}
                  color="bg-blue-100 dark:bg-blue-900"
                />
                <MetricCard
                  icon={BookOpen}
                  label="HW WatchTime"
                  total={formatWatchTime(stats.homeworkWatchtime.total)}
                  thisWeek={formatWatchTime(stats.homeworkWatchtime.thisWeek)}
                  color="bg-green-100 dark:bg-green-900"
                />
                <MetricCard
                  icon={Users}
                  label="Total Classrooms"
                  total={stats.classrooms.total}
                  thisWeek={stats.classrooms.thisWeek}
                  color="bg-purple-100 dark:bg-purple-900"
                />
                <MetricCard
                  icon={GraduationCap}
                  label="Total Homeworks"
                  total={stats.homeworks.total}
                  thisWeek={stats.homeworks.thisWeek}
                  color="bg-orange-100 dark:bg-orange-900"
                />
              </div>

              {/* Chart Section */}
              <AjaxChart
                title="Analytics Overview"
                height={400}
                startDate={startDate}
                endDate={endDate}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
