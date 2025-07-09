'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { CheckCircle, Cancel, Person, School, AccountCircle } from '@mui/icons-material';
import { Tooltip, Button, Paper, CircularProgress, Typography, TextField } from '@mui/material';
import UserDetailsDialog from './user-details';
import Header from './header';
import axios from 'axios';
import dayjs from 'dayjs';
import { useCurriculum } from './curriculum-context';

// Icon mappings for different statuses
const statusIconMap = {
  Active: <CheckCircle style={{ color: 'green' }} />,
  'Not verified': <Cancel style={{ color: 'orange' }} />,
};

const onboardingIconMap = {
  Manual: <Person style={{ color: 'blue' }} />,
  Self: <Person style={{ color: 'orange' }} />,
};

const userTypeIconMap = {
  Student: <School style={{ color: 'green' }} />,
  Teacher: <AccountCircle style={{ color: 'blue' }} />,
};

// Legend component
const StatusAndOnboardingLegend = () => (
    <div className="flex items-center gap-8 mb-4 flex-wrap p-4 bg-card rounded-lg border">
        <div className="flex items-center gap-2"><CheckCircle className="text-green-500" /><span>Active</span></div>
        <div className="flex items-center gap-2"><Cancel className="text-orange-500" /><span>Not verified</span></div>
        <div className="flex items-center gap-2"><Person className="text-blue-500" /><span>Manual Onboard</span></div>
        <div className="flex items-center gap-2"><Person className="text-orange-500" /><span>Self Onboard</span></div>
        <div className="flex items-center gap-2"><School className="text-green-500" /><span>Student</span></div>
        <div className="flex items-center gap-2"><AccountCircle className="text-blue-500" /><span>Teacher</span></div>
    </div>
);

// Summary component
const DataSummary = ({ data }: { data: any[] }) => {
  const stats = useMemo(() => ({
    totalUsers: data.length,
    students: data.filter(user => user.user_type === 'Student').length,
    teachers: data.filter(user => user.user_type === 'Teacher').length,
    activeUsers: data.filter(user => user.status === 'Active').length,
    pendingUsers: data.filter(user => user.status === 'Not verified').length,
    manualUsers: data.filter(user => user.user_join === 'Manual').length
  }), [data]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <MetricCard title="Total Users" value={stats.totalUsers} />
        <MetricCard title="Students" value={stats.students} />
        <MetricCard title="Teachers" value={stats.teachers} />
        <MetricCard title="Active Users" value={stats.activeUsers} />
        <MetricCard title="Manual Onboard" value={stats.manualUsers} />
        <MetricCard title="Pending" value={stats.pendingUsers} />
    </div>
  );
};

const MetricCard = ({ title, value }: { title: string, value: number }) => (
    <Paper className="p-4 text-center rounded-lg shadow-sm">
        <Typography variant="h6" className="font-semibold">{value}</Typography>
        <Typography variant="body2" color="text.secondary">{title}</Typography>
    </Paper>
);


const DataTableUsers = () => {
  const [allRows, setAllRows] = useState([]);
  const [visibleRows, setVisibleRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for filters
  const [searchText, setSearchText] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { getCurriculumId } = useCurriculum();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const minDate = "2024-08-26";

  const columns: GridColDef[] = useMemo(() => [
    { field: 'email', headerName: 'Email', flex: 3 },
    { field: 'name', headerName: 'Name', flex: 2 },
    { field: 'user_type', headerName: 'User Type', flex: 1, renderCell: (params) => <Tooltip title={params.value}>{userTypeIconMap[params.value]}</Tooltip> },
    { field: 'status', headerName: 'Status', flex: 1, renderCell: (params) => <Tooltip title={params.value}>{statusIconMap[params.value]}</Tooltip> },
    { 
      field: 'created_at', 
      headerName: 'Join Date', 
      flex: 1, 
      renderCell: (params) => (
        <span>{params.value ? dayjs(params.value).format('DD/MM/YYYY') : 'N/A'}</span>
      )
    },
    { field: 'curriculum', headerName: 'Curriculum', flex: 1 },
    { field: 'user_join', headerName: 'Onboarding', flex: 1, renderCell: (params) => <Tooltip title={params.value}>{onboardingIconMap[params.value]}</Tooltip> },
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
        setAllRows(formattedData);
        setVisibleRows(formattedData);
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

  const handleFilter = () => {
    let filtered = allRows.filter((row) => {
      const emailMatch = row.email.toLowerCase().includes(searchText.toLowerCase());
      const rowDate = dayjs(row.created_at);
      const isAfterMinDate = rowDate.isAfter(dayjs(minDate));
      const isInRange = (!startDate || !endDate) ? true : rowDate.isAfter(dayjs(startDate)) && rowDate.isBefore(dayjs(endDate));
      return emailMatch && isAfterMinDate && isInRange;
    });
    setVisibleRows(filtered);
  };

  const handleReset = () => {
    setSearchText('');
    setStartDate('');
    setEndDate('');
    setVisibleRows(allRows);
  };

  return (
    <div className="space-y-6">
      <Header onRefresh={handleRefresh} isLoading={isLoading} />
      <StatusAndOnboardingLegend />
      <DataSummary data={visibleRows} />
      
      <Paper className="p-4 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
        <TextField
          label="Search by email"
          variant="outlined"
          size="small"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full md:w-auto"
        />
        <TextField
          label="Start Date"
          type="date"
          variant="outlined"
          size="small"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: minDate }}
          className="w-full md:w-auto"
        />
        <TextField
          label="End Date"
          type="date"
          variant="outlined"
          size="small"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: minDate }}
          className="w-full md:w-auto"
        />
        <Button variant="contained" onClick={handleFilter}>Filter</Button>
        <Button variant="outlined" onClick={handleReset}>Reset</Button>
      </Paper>

      <Paper style={{ height: '70vh', width: '100%' }}>
        <DataGrid
          rows={visibleRows}
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
  );
};

export default DataTableUsers;
