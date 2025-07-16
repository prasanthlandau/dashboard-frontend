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
        totalStudents: data.length,
        totalHomeworksAssigned: data.reduce((sum, item) => sum + Number(item.total_homeworks_assigned || 0), 0),
        totalCompleted: data.reduce((sum, item) => sum + Number(item.completed_homeworks || 0), 0),
    }), [data]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <MetricCard title="Total Students Enrolled in Classrooms" value={stats.totalStudents} />
            <MetricCard title="Homeworks Assigned To Students" value={stats.totalHomeworksAssigned} />
            <MetricCard title="Homeworks Completed By Students" value={stats.totalCompleted} />
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

const DataTableStudent = () => {
  const [allRows, setAllRows] = useState([]);
  const [visibleRows, setVisibleRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  
  const { startDate, endDate } = useApp();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const columns: GridColDef[] = useMemo(() => [
    { field: 'student_email', headerName: 'Email', flex: 2 },
    { field: 'student_name', headerName: 'Name', flex: 2 },
    { field: 'total_classrooms', headerName: 'Classrooms', type: 'number', flex: 1 },
    { field: 'total_homeworks_assigned', headerName: 'Homeworks Assigned', type: 'number', flex: 1 },
    { field: 'completed_homeworks', headerName: 'Completed', type: 'number', flex: 1 },
  ], []);

  const fetchStudentReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ startDate, endDate });
      const url = `${API_BASE_URL}/report/student?${params.toString()}`;
      const response = await axios.get(url);
      const formattedData = response.data.map((item: any) => ({ ...item, id: item.student_id }));
      setAllRows(formattedData);
      setVisibleRows(formattedData);
    } catch (error) {
      console.error('Error fetching student report:', error);
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, startDate, endDate]);

  useEffect(() => {
    fetchStudentReport();
  }, [fetchStudentReport]);

  const handleFilter = () => {
    const filtered = allRows.filter(row => 
      row.student_name.toLowerCase().includes(searchText.toLowerCase()) ||
      row.student_email.toLowerCase().includes(searchText.toLowerCase())
    );
    setVisibleRows(filtered);
  };

  const handleReset = () => {
    setSearchText('');
    setVisibleRows(allRows);
  };

  return (
    <div className="space-y-6">
      <Header onRefresh={fetchStudentReport} isLoading={isLoading} />
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

export default DataTableStudent;
