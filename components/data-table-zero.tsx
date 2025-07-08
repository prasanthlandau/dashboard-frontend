'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Paper } from '@mui/material';
import axios from 'axios';
import Header from './header';
import dayjs from 'dayjs';
import { useCurriculum } from './curriculum-context';

const DataTableZero = () => {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getCurriculumId } = useCurriculum();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchZeroActivityUsers = useCallback(async (curriculumId?: string) => {
    setIsLoading(true);
    try {
      const url = `${API_BASE_URL}/zero${curriculumId ? `?curriculum=${curriculumId}` : ''}`;
      const response = await axios.get(url);
      setRows(response.data.map((item: any) => ({ ...item, id: item.user_id })));
    } catch (error) {
      console.error('Error fetching zero activity user data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    const curriculumId = getCurriculumId();
    fetchZeroActivityUsers(curriculumId);
  }, [fetchZeroActivityUsers, getCurriculumId]);

  const handleRefresh = () => {
    const curriculumId = getCurriculumId();
    fetchZeroActivityUsers(curriculumId);
  };

  const columns: GridColDef[] = [
    { field: 'email', headerName: 'Email', flex: 3 },
    { field: 'name', headerName: 'Name', flex: 2 },
    { field: 'user_type', headerName: 'User Type', flex: 1 },
    { field: 'created_at', headerName: 'Join Date', flex: 1, valueFormatter: (params) => dayjs(params.value).format('DD-MM-YYYY')},
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

export default DataTableZero;
