'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Paper } from '@mui/material';
import axios from 'axios';
import Header from './header';
import { useCurriculum } from './curriculum-context';

const DataTableWatchtime = () => {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getCurriculumId } = useCurriculum();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchWatchtimeReport = useCallback(async (curriculumId?: string) => {
    setIsLoading(true);
    try {
      const url = `${API_BASE_URL}/watchtime${curriculumId ? `?curriculum=${curriculumId}` : ''}`;
      const response = await axios.get(url);
      const formattedData = response.data.map((item: any) => ({
        ...item,
        id: item.user_id,
        total_watch_minutes: Number(((item.total_watched_minutes_q1 || 0) + (item.total_watched_lesson_duration_in_minutes || 0)).toFixed(2))
      }));
      setRows(formattedData);
    } catch (error) {
      console.error('Error fetching watch time data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL]);
  
  useEffect(() => {
    const curriculumId = getCurriculumId();
    fetchWatchtimeReport(curriculumId);
  }, [fetchWatchtimeReport, getCurriculumId]);

  const handleRefresh = () => {
    const curriculumId = getCurriculumId();
    fetchWatchtimeReport(curriculumId);
  };

  const columns: GridColDef[] = [
    { field: 'email', headerName: 'Email', flex: 3 },
    { field: 'total_watched_minutes_q1', headerName: 'Course Watch (min)', flex: 1 },
    { field: 'total_watched_lesson_duration_in_minutes', headerName: 'Homework Watch (min)', flex: 1 },
    { field: 'total_watch_minutes', headerName: 'Total Watch (min)', flex: 1 },
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

export default DataTableWatchtime;
