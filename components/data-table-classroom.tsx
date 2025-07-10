'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Header from './header';
import axios from 'axios';
import { useApp } from './app-context';

const DataSummary = ({ data }: { data: any[] }) => {
  const stats = useMemo(() => ({
    totalClassrooms: data.length,
    totalStudents: data.reduce((sum, item) => sum + Number(item.total_student || 0), 0),
    totalHomeworks: data.reduce((sum, item) => sum + Number(item.total_homeworks || 0), 0),
  }), [data]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <MetricCard title="Total Classrooms" value={stats.totalClassrooms} />
      <MetricCard title="Total Students" value={stats.totalStudents} />
      <MetricCard title="Total Homeworks" value={stats.totalHomeworks} />
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

const DataTableClassroom = () => {
  const [allRows, setAllRows] = useState([]);
  const [visibleRows, setVisibleRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  
  const { startDate, endDate } = useApp();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const columns: GridColDef[] = useMemo(() => [
    { field: 'classroom_name', headerName: 'Classroom Name', flex: 2 },
    { field: 'teacher_email', headerName: 'Teacher Email', flex: 2 },
    { field: 'total_student', headerName: 'Total Students', type: 'number', flex: 1 },
    { field: 'total_homeworks', headerName: 'Total Homeworks', type: 'number', flex: 1 },
    { field: 'total_videos', headerName: 'Total Lessons', type: 'number', flex: 1 },
    { field: 'homework_completion_rate', headerName: 'Completion Rate', flex: 1, valueFormatter: (params) => `${params.value} %` },
  ], []);

  const fetchClassroomReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ startDate, endDate });
      const url = `${API_BASE_URL}/report/classroom?${params.toString()}`;
      const response = await axios.get(url);
      const formattedData = response.data.map((item: any) => ({ ...item, id: item.class_id }));
      setAllRows(formattedData);
      setVisibleRows(formattedData);
    } catch (error) {
      console.error('Error fetching classroom report:', error);
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, startDate, endDate]);

  useEffect(() => {
    fetchClassroomReport();
  }, [fetchClassroomReport]);

  const handleFilter = () => {
    const filtered = allRows.filter(row => 
      row.classroom_name.toLowerCase().includes(searchText.toLowerCase()) ||
      row.teacher_email.toLowerCase().includes(searchText.toLowerCase())
    );
    setVisibleRows(filtered);
  };

  const handleReset = () => {
    setSearchText('');
    setVisibleRows(allRows);
  };

  return (
    <div className="space-y-6">
      <Header onRefresh={fetchClassroomReport} isLoading={isLoading} />
      <DataSummary data={visibleRows} />
      {/*
      <Card className="p-4 flex items-center gap-4">
        <Input
          placeholder="Search by Classroom or Teacher..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={handleFilter}>Filter</Button>
        <Button variant="outline" onClick={handleReset}>Reset</Button>
      </Card>
      */}
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

export default DataTableClassroom;
