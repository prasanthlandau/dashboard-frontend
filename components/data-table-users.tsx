'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { CheckCircle, Cancel, Person, School, AccountCircle } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import UserDetailsDialog from './user-details';
import Header from './header';
import axios from 'axios';
import dayjs from 'dayjs';
import { useApp } from './app-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Icon mappings for different statuses
const statusIconMap = {
  'Active': <CheckCircle className="text-green-500" />,
  'Not verified': <Cancel className="text-orange-500" />,
};

const onboardingIconMap = {
  'Manual': <Person className="text-blue-500" />,
  'Self': <Person className="text-orange-500" />,
};

const userTypeIconMap = {
  'Student': <School className="text-green-500" />,
  'Teacher': <AccountCircle className="text-blue-500" />,
};

// Legend component
const StatusAndOnboardingLegend = () => (
    <div className="flex items-center gap-x-6 gap-y-2 mb-4 flex-wrap p-4 bg-card rounded-lg border">
        <div className="flex items-center gap-2 text-sm"><CheckCircle className="h-4 w-4 text-green-500" /><span>Active</span></div>
        <div className="flex items-center gap-2 text-sm"><Cancel className="h-4 w-4 text-orange-500" /><span>Not verified</span></div>
        <div className="flex items-center gap-2 text-sm"><Person className="h-4 w-4 text-blue-500" /><span>Manual Onboard</span></div>
        <div className="flex items-center gap-2 text-sm"><Person className="h-4 w-4 text-orange-500" /><span>Self Onboard</span></div>
        <div className="flex items-center gap-2 text-sm"><School className="h-4 w-4 text-green-500" /><span>Student</span></div>
        <div className="flex items-center gap-2 text-sm"><AccountCircle className="h-4 w-4 text-blue-500" /><span>Teacher</span></div>
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
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);


const DataTableUsers = () => {
  const [allRows, setAllRows] = useState([]);
  const [visibleRows, setVisibleRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Local state for the filter controls
  const [searchText, setSearchText] = useState('');
  const [localStartDate, setLocalStartDate] = useState('');
  const [localEndDate, setLocalEndDate] = useState('');

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Global state from context
  const { startDate: globalStartDate, endDate: globalEndDate } = useApp();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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
        <Button onClick={() => handleViewDetails(params.row.id)}>
          View
        </Button>
      ),
    },
  ], []);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ startDate: globalStartDate, endDate: globalEndDate });
      const url = `${API_BASE_URL}/users?${params.toString()}`;
      
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
  }, [API_BASE_URL, globalStartDate, globalEndDate]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  const handleViewDetails = (userId: string) => {
    setSelectedUserId(userId);
    setIsDialogOpen(true);
  };

  const handleFilter = () => {
    let filtered = allRows.filter((row) => {
      const emailMatch = !searchText || row.email.toLowerCase().includes(searchText.toLowerCase());
      
      let dateMatch = true;
      if (localStartDate && localEndDate && row.created_at) {
        const rowDate = dayjs(row.created_at);
        dateMatch = rowDate.isAfter(dayjs(localStartDate)) && rowDate.isBefore(dayjs(localEndDate));
      }
      
      return emailMatch && dateMatch;
    });
    setVisibleRows(filtered);
  };

  const handleReset = () => {
    setSearchText('');
    setLocalStartDate('');
    setLocalEndDate('');
    setVisibleRows(allRows);
  };

  return (
    <div className="space-y-6">
      <Header onRefresh={fetchUsers} isLoading={isLoading} />
      <StatusAndOnboardingLegend />
      <DataSummary data={visibleRows} />
      {/*
      <Card className="p-4 flex items-center gap-4">
        <Input
          placeholder="Search by email..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="max-w-sm"
        />
        <Input
          type="date"
          value={localStartDate}
          onChange={(e) => setLocalStartDate(e.target.value)}
          className="max-w-sm"
        />
        <Input
          type="date"
          value={localEndDate}
          onChange={(e) => setLocalEndDate(e.target.value)}
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
              initialState={{ pagination: { paginationModel: { pageSize: 15 } } }}
              pageSizeOptions={[15, 25, 50]}
              sx={{
                border: 'none',
                // Corrected: Use theme variables for styling
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: 'hsl(var(--muted))',
                  color: 'hsl(var(--muted-foreground))',
                },
                '& .MuiDataGrid-cell': {
                    borderBottom: '1px solid hsl(var(--border))',
                    color: 'hsl(var(--foreground))', 
                },
                '& .MuiDataGrid-footerContainer': {
                    borderTop: '1px solid hsl(var(--border))',
                    color: 'hsl(var(--muted-foreground))',
                },
                 '& .MuiDataGrid-iconButton': {
                    color: 'hsl(var(--muted-foreground))',
                },
                '& .MuiTablePagination-root': {
                    color: 'hsl(var(--muted-foreground))',
                },
              }}
            />
        </div>
      </Card>
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
