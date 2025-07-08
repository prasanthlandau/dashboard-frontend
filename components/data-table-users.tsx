'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { CheckCircle, Cancel, Person, School, AccountCircle } from '@mui/icons-material';
import { Tooltip, Button, Paper, CircularProgress, Typography } from '@mui/material';
import UserDetailsDialog from './user-details';
import Header from './header';
import axios from 'axios';
import dayjs from 'dayjs';
import { useCurriculum } from './curriculum-context';

// ... (Icon maps and Legend components can remain the same)

const DataTableUsers = () => {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { getCurriculumId } = useCurriculum();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const columns: GridColDef[] = useMemo(() => [
    { field: 'email', headerName: 'Email', flex: 3 },
    { field: 'name', headerName: 'Name', flex: 2 },
    { field: 'user_type', headerName: 'User Type', flex: 1, /* ... renderCell */ },
    { field: 'status', headerName: 'Status', flex: 1, /* ... renderCell */ },
    { field: 'created_at', headerName: 'Join Date', flex: 1, valueFormatter: (params) => dayjs(params.value).format('DD-MM-YYYY') },
    { field: 'curriculum', headerName: 'Curriculum', flex: 1 },
    {
      field: 'action',
      headerName: 'Action',
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Button variant="contained" size="small" onClick={() => handleViewDetails(params.row.id)}>
          View
        </Button>
      ),
    },
  ], []);

  const fetchUsers = useCallback(async (curriculumId?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = `${API_BASE_URL}/users${curriculumId ? `?curriculum=${curriculumId}` : ''}`;
      const response = await axios.get(url);
      if (response.data.success) {
        const formattedData = response.data.users.map((user: any) => ({ ...user, id: user.id.toString() }));
        setRows(formattedData);
      } else {
        throw new Error(response.data.error || 'Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load user data.');
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    const curriculumId = getCurriculumId();
    fetchUsers(curriculumId);
  }, [fetchUsers, getCurriculumId]);

  const handleRefresh = () => {
      const curriculumId = getCurriculumId();
      fetchUsers(curriculumId);
  };
  
  const handleViewDetails = (userId: string) => {
    setSelectedUserId(userId);
    setIsDialogOpen(true);
  };

  return (
    <>
      <Header onRefresh={handleRefresh} isLoading={isLoading} />
      <div className="mt-6 space-y-6">
        {/* ... (StatusAndOnboardingLegend and DataSummary components) ... */}
        <Paper style={{ height: '70vh', width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={isLoading}
            initialState={{ pagination: { paginationModel: { pageSize: 15 } } }}
            pageSizeOptions={[15, 25, 50]}
          />
        </Paper>
        {isDialogOpen && (
          <UserDetailsDialog
            open={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            userId={selectedUserId}
          />
        )}
      </div>
    </>
  );
};

export default DataTableUsers;
