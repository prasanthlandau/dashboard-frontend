'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Paper } from '@mui/material';
import axios from 'axios';
import Header from './header';
import { useCurriculum } from './curriculum-context';

const DataTableStudent = () => {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getCurriculumId } = useCurriculum();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchStudentReport = useCallback(async (curriculumId?: string) => {
    setIsLoading(true);
    try {
      const url = `${API_BASE_URL}/report/student${curriculumId ? `?curriculum=${curriculumId}` : ''}`;
      const response = await axios.get(url);
      setRows(response.data.map((item: any) => ({ ...item, id: item.student_id })));
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    const curriculumId = getCurriculumId();
    fetchStudentReport(curriculumId);
  }, [fetchStudentReport, getCurriculumId]);
  
  const handleRefresh = () => {
    const curriculumId = getCurriculumId();
    fetchStudentReport(curriculumId);
  };

  const columns: GridColDef[] = [
    { field: 'student_email', headerName: 'Email', flex: 2 },
    { field: 'student_name', headerName: 'Name', flex: 2 },
    { field: 'total_classrooms', headerName: 'Classrooms', flex: 1 },
    { field: 'total_homeworks_assigned', headerName: 'Homeworks Assigned', flex: 1 },
    { field: 'completed_homeworks', headerName: 'Completed', flex: 1 },
  ];

  return (
    <div className="space-y-6">
      <Header onRefresh={handleRefresh} isLoading={isLoading} />
      <Paper style={{ height: '75vh', width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={isLoading}
        />
      </Paper>
    </div>
  );
};

export default DataTableStudent;
