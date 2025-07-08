'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Paper, CircularProgress, Typography } from '@mui/material';
import axios from 'axios';
import Header from './header';
import { useCurriculum } from './curriculum-context';

const DataTableTeacher = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { getCurriculumId } = useCurriculum();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchTeacherReport = useCallback(async (curriculumId?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = `${API_BASE_URL}/report/teacher${curriculumId ? `?curriculum=${curriculumId}` : ''}`;
      const response = await axios.get(url);
      setData(response.data.map((item: any) => ({ ...item, id: item.teacher_id })));
    } catch (err) {
      console.error('Error fetching teacher report:', err);
      setError('Failed to load teacher report data.');
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    const curriculumId = getCurriculumId();
    fetchTeacherReport(curriculumId);
  }, [fetchTeacherReport, getCurriculumId]);
  
  const handleRefresh = () => {
      const curriculumId = getCurriculumId();
      fetchTeacherReport(curriculumId);
  };

  const columns: GridColDef[] = useMemo(() => [
    { field: 'teacher_name', headerName: 'Teacher Name', flex: 2 },
    { field: 'teacher_email', headerName: 'Email', flex: 2 },
    { field: 'total_classrooms', headerName: 'Classrooms', type: 'number', flex: 1 },
    { field: 'total_students', headerName: 'Students', type: 'number', flex: 1 },
    { field: 'total_watch_time', headerName: 'Watch Time (min)', type: 'number', flex: 1 },
  ], []);

  return (
    <div className="space-y-6">
      <Header onRefresh={handleRefresh} isLoading={isLoading} />
      <Paper style={{ height: '75vh', width: '100%' }}>
        <DataGrid
          rows={data}
          columns={columns}
          loading={isLoading}
          initialState={{ pagination: { paginationModel: { pageSize: 15 } } }}
          pageSizeOptions={[15, 30, 50]}
        />
      </Paper>
    </div>
  );
};

export default DataTableTeacher;
