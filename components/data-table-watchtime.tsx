'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Cancel, Person, School, AccountCircle } from '@mui/icons-material';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@mui/material';
import Header from './header';
import axios from 'axios';
import { useApp } from './app-context';


const onboardingIconMap = {
  'Manual': <Person className="text-blue-500" />,
  'Self': <Person className="text-orange-500" />,
};

const userTypeIconMap = {
  'Student': <School className="text-green-500" />,
  'Teacher': <AccountCircle className="text-blue-500" />,
};

const StatusAndOnboardingLegend = () => (
    <div className="flex items-center gap-x-6 gap-y-2 mb-4 flex-wrap p-4 bg-card rounded-lg border">
        <div className="flex items-center gap-2 text-sm"><Person className="h-4 w-4 text-blue-500" /><span>Manual Onboard</span></div>
        <div className="flex items-center gap-2 text-sm"><Person className="h-4 w-4 text-orange-500" /><span>Self Onboard</span></div>
        <div className="flex items-center gap-2 text-sm"><School className="h-4 w-4 text-green-500" /><span>Student</span></div>
        <div className="flex items-center gap-2 text-sm"><AccountCircle className="h-4 w-4 text-blue-500" /><span>Teacher</span></div>
    </div>
);

const DataSummary = ({ data }: { data: any[] }) => {
    const stats = useMemo(() => ({
        totalUsers: data.length,
        totalCourseWT: data.reduce((sum, item) => sum + Number(item.total_watched_minutes_q1 || 0), 0),
        totalHomeworkWT: data.reduce((sum, item) => sum + Number(item.total_watched_lesson_duration_in_minutes || 0), 0),
    }), [data]);

    // Round to nearest whole hour
    const minutesToHours = (mins: number) => Math.round(mins / 60);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <MetricCard title="Total Users" value={stats.totalUsers} />
            <MetricCard
                title="Total Course WatchTime"
                value={`${Math.round(stats.totalCourseWT)} min (${minutesToHours(stats.totalCourseWT)} hr)`}
            />
            <MetricCard
                title="Total Homework WatchTime"
                value={`${Math.round(stats.totalHomeworkWT)} min (${minutesToHours(stats.totalHomeworkWT)} hr)`}
            />
        </div>
    );
};



const MetricCard = ({ title, value }: { title: string, value: number }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

const DataTableWatchtime = () => {
  const [allRows, setAllRows] = useState([]);
  const [visibleRows, setVisibleRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  
  const { startDate, endDate } = useApp();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const columns: GridColDef[] = useMemo(() => [
    { field: 'email', headerName: 'Email', flex: 3 },
    { field: 'user_type', headerName: 'User Type', flex: 1, renderCell: (params) => <Tooltip title={params.value}>{userTypeIconMap[params.value]}</Tooltip> },
    { field: 'user_join', headerName: 'Onboarding', flex: 1, renderCell: (params) => <Tooltip title={params.value}>{onboardingIconMap[params.value]}</Tooltip> },
    { field: 'total_watched_minutes_q1', headerName: 'Course Watch (min)', type: 'number', flex: 1 },
    { field: 'total_watched_lesson_duration_in_minutes', headerName: 'Homework Watch (min)', type: 'number', flex: 1 },
    { field: 'total_watch_minutes', headerName: 'Total Watch (min)', type: 'number', flex: 1 },
  ], []);

  const fetchWatchtimeReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ startDate, endDate });
      const url = `${API_BASE_URL}/watchtime?${params.toString()}`;
      const response = await axios.get(url);
      const formattedData = response.data.map((item: any) => ({
        ...item,
        id: item.user_id,
        total_watch_minutes: Number(((item.total_watched_minutes_q1 || 0) + (item.total_watched_lesson_duration_in_minutes || 0)).toFixed(2))
      }));
      setAllRows(formattedData);
      setVisibleRows(formattedData);
    } catch (error) {
      console.error('Error fetching watch time data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, startDate, endDate]);

  useEffect(() => {
    fetchWatchtimeReport();
  }, [fetchWatchtimeReport]);

  const handleFilter = () => {
    const filtered = allRows.filter(row => 
      row.email.toLowerCase().includes(searchText.toLowerCase())
    );
    setVisibleRows(filtered);
  };

  const handleReset = () => {
    setSearchText('');
    setVisibleRows(allRows);
  };

  return (
    <div className="space-y-6">
      <Header onRefresh={fetchWatchtimeReport} isLoading={isLoading} />
      <StatusAndOnboardingLegend />
      <DataSummary data={visibleRows} />

      <Card>
        <div style={{ height: '70vh', width: '100%' }}>
          <DataGrid
            rows={visibleRows}
            columns={columns}
            loading={isLoading}
            sx={{
              border: 'none',
              color: 'hsl(var(--foreground))',
              '& .MuiDataGrid-columnHeaders': { backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' },
              '& .MuiDataGrid-cell': { borderBottom: '1px solid hsl(var(--border))' },
              '& .MuiDataGrid-footerContainer': { borderTop: '1px solid hsl(var(--border))', color: 'hsl(var(--muted-foreground))' },
              '& .MuiDataGrid-iconButton, & .MuiSelect-icon': { color: 'hsl(var(--muted-foreground))' },
              '& .MuiTablePagination-root': { color: 'hsl(var(--muted-foreground))' },
            }}
          />
        </div>
      </Card>
    </div>
  );
};

export default DataTableWatchtime;
