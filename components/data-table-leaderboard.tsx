'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Header from './header';
import axios from 'axios';

const LeaderboardSummary = ({ data }: { data: any[] }) => {
  const stats = useMemo(() => ({
    totalTeachers: data.length,
    totalPoints: data.reduce((sum, item) => sum + Number(String(item.points).replace(/,/g, '') || 0), 0),
    avgCompletion: data.length
      ? (data.reduce((sum, item) => {
          let raw = String(item.average_completion_rate).replace('%', '');
          let parsed = parseFloat(raw);
          return sum + (isNaN(parsed) ? 0 : parsed);
        }, 0) / data.length).toFixed(2)
      : '0.00',
  }), [data]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/*<MetricCard title="Total Teachers" value={stats.totalTeachers} />
      <MetricCard title="Total Points" value={stats.totalPoints.toLocaleString()} />
      <MetricCard title="Avg. Completion Rate" value={stats.avgCompletion + '%'} />*/}
    </div>
  );
};

const MetricCard = ({ title, value }: { title: string, value: number | string }) => ( 
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const DataTableLeaderboard = () => {
  const [allRows, setAllRows] = useState<any[]>([]);
  const [visibleRows, setVisibleRows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const columns: GridColDef[] = useMemo(() => [
    { field: 'rank', headerName: 'Rank', type: 'number', flex: 0.7 },
    { field: 'teacher_name', headerName: 'Teacher', flex: 1.5 },
    { field: 'region', headerName: 'Region', flex: 1 },
    { field: 'country', headerName: 'Country', flex: 1 },
    { field: 'points', headerName: 'Points', flex: 1, type: 'number' },
    { field: 'homework_count', headerName: 'Homeworks', type: 'number', flex: 1 },
    { field: 'student_count', headerName: 'Students', type: 'number', flex: 1 },
    { field: 'completed_homework_count', headerName: 'Completed HW', type: 'number', flex: 1 },
    { field: 'average_completion_rate', headerName: 'Avg. Completion', flex: 1 },
  ], []);

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = `${API_BASE_URL}/leaderboard`;
      const response = await axios.get(url);
      const formattedData = response.data.data.map((item: any, index: number) => ({
        ...item,
        id: item.id || item.teacher_id || index,
      }));
      setAllRows(formattedData);
      setVisibleRows(formattedData);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setAllRows([]);
      setVisibleRows([]);
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const handleFilter = () => {
    const filtered = allRows.filter(row =>
      row.teacher_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      row.region?.toLowerCase().includes(searchText.toLowerCase()) ||
      row.country?.toLowerCase().includes(searchText.toLowerCase())
    );
    setVisibleRows(filtered);
  };

  const handleReset = () => {
    setSearchText('');
    setVisibleRows(allRows);
  };

  return (
    <div className="space-y-6">
      <Header onRefresh={fetchLeaderboard} isLoading={isLoading} />
      <LeaderboardSummary data={visibleRows} />

      <Card>
        <div style={{ height: '70vh', width: '100%' }}>
          <DataGrid
            rows={visibleRows}
            columns={columns}
            loading={isLoading}
            pageSizeOptions={[15, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 15 } } }}
            sx={{
              border: 'none',
              color: 'hsl(var(--foreground))',
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'hsl(var(--muted))',
                color: 'hsl(var(--muted-foreground))'
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid hsl(var(--border))'
              },
              '& .MuiDataGrid-footerContainer': {
                borderTop: '1px solid hsl(var(--border))',
                color: 'hsl(var(--muted-foreground))'
              }
            }}
          />
        </div>
      </Card>
    </div>
  );
};

export default DataTableLeaderboard;
