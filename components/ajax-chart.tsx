'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LineChartComponent from '@/components/line-chart';
import axios from 'axios';
import { CircularProgress, Typography } from '@mui/material';


interface ChartSeries {
  data: number[];
  label: string;
  color?: string;
}

interface ChartData {
  labels: string[];
  series: ChartSeries[];
}

interface AjaxChartProps {
  title?: string;
  height?: number;
}

export const AjaxChart: React.FC<AjaxChartProps> = ({ 
  title = "Analytics Overview", 
  height = 400 
}) => {
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    series: [],
  });
  const [dataType, setDataType] = useState<'users' | 'watchtime'>('users');
  const [timePeriod, setTimePeriod] = useState<'days' | 'weeks' | 'months'>('months');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchChartData = useCallback(async (type: string, period: string) => {
    if (!API_BASE_URL) {
      setError("API URL is not configured");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const url = `${API_BASE_URL}/chart-data?type=${type}&period=${period}`;
      const response = await axios.get(url, { timeout: 10000 });
      setChartData(response.data);
    } catch (error) {
      console.error(`Error fetching chart data for type: ${type}, period: ${period}`, error);
      setError('Failed to load chart data');
      setChartData({ labels: [], series: [{ data: [], label: 'Error loading chart data' }] });
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL]);

  // Initial load
  useEffect(() => {
    fetchChartData(dataType, timePeriod);
  }, [fetchChartData, dataType, timePeriod]);

  const handleDataTypeChange = (newType: 'users' | 'watchtime') => {
    setDataType(newType);
    fetchChartData(newType, timePeriod);
  };

  const handleTimePeriodChange = (newPeriod: 'days' | 'weeks' | 'months') => {
    setTimePeriod(newPeriod);
    fetchChartData(dataType, newPeriod);
  };

  const StatusDisplay = ({ message, isError = false }: { message: string, isError?: boolean }) => (
    <div className={`flex flex-col items-center justify-center rounded-lg p-8 ${isError ? 'bg-red-50 dark:bg-red-900/10' : ''}`} style={{ height }}>
      {!isError && <CircularProgress size={40} />}
      <Typography variant="body1" className={`mt-4 ${isError ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}>
        {message}
      </Typography>
    </div>
  );

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {!isLoading && !error && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
              <span className="text-muted-foreground">
                {dataType === 'users' ? 'User Accounts' : 'Watch Time'}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full mb-5 flex gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-muted-foreground mb-1">Data Type:</label>
            <select 
              value={dataType}
              onChange={(e) => handleDataTypeChange(e.target.value as 'users' | 'watchtime')}
              className="px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isLoading}
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
              disabled={isLoading}
            >
              <option value="days">Last 7 Days</option>
              <option value="weeks">Last 4 Weeks</option>
              <option value="months">Last 6 Months</option>
            </select>
          </div>
          {isLoading && (
            <div className="flex items-end">
              <CircularProgress size={20} />
            </div>
          )}
        </div>
        
        {isLoading && <StatusDisplay message="Loading chart data..." />}
        {error && <StatusDisplay message={error} isError />}
        {!isLoading && !error && (
          <div style={{ height }}>
            <LineChartComponent 
              height={height} 
              labels={chartData.labels}
              series={chartData.series}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AjaxChart;