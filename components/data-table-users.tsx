'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { CheckCircle, Cancel, Person, School, AccountCircle } from '@mui/icons-material';
import { Tooltip, Button } from '@mui/material';
import UserDetailsDialog from './user-details';
import Header from './header';
import axios from 'axios';
import dayjs from 'dayjs';

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

// Legend component showing all icons and their meanings
const StatusAndOnboardingLegend = () => (
  <div className="flex items-center gap-8 mb-4 flex-wrap">
    <div className="flex items-center gap-8 border-r pr-8">
      <div className="flex items-center gap-2">
        <CheckCircle style={{ color: 'green' }} />
        <span>Active</span>
      </div>
      <div className="flex items-center gap-2">
        <Cancel style={{ color: 'orange' }} />
        <span>Not verified</span>
      </div>
    </div>
    <div className="flex items-center gap-8 border-r pr-8">
      <div className="flex items-center gap-2">
        <Person style={{ color: 'blue' }} />
        <span>Manual Onboard</span>
      </div>
      <div className="flex items-center gap-2">
        <Person style={{ color: 'orange' }} />
        <span>Self Onboard</span>
      </div>
    </div>
    <div className="flex items-center gap-8">
      <div className="flex items-center gap-2">
        <School style={{ color: 'green' }} />
        <span>Student</span>
      </div>
      <div className="flex items-center gap-2">
        <AccountCircle style={{ color: 'blue' }} />
        <span>Teacher</span>
      </div>
    </div>
  </div>
);

// Summary component showing user statistics
const DataSummary = ({ data }) => {
  const stats = useMemo(() => ({
    totalUsers: data.length,
    students: data.filter(user => user.user_type === 'Student').length,
    teachers: data.filter(user => user.user_type === 'Teacher').length,
    activeUsers: data.filter(user => user.status === 'Active').length,
    pendingUsers: data.filter(user => user.status === 'Not verified').length,
    manualUsers: data.filter(user => user.user_join === 'Manual').length
  }), [data]);

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-6 gap-4">
        <div className="flex flex-col items-center justify-center bg-white p-4 rounded-md shadow">
          <div className="text-gray-600 text-sm mb-1">Total Users</div>
          <div className="text-xl font-semibold text-blue-600">{stats.totalUsers}</div>
        </div>
        <div className="flex flex-col items-center justify-center bg-white p-4 rounded-md shadow">
          <div className="text-gray-600 text-sm mb-1">Students</div>
          <div className="text-xl font-semibold text-green-600">{stats.students}</div>
        </div>
        <div className="flex flex-col items-center justify-center bg-white p-4 rounded-md shadow">
          <div className="text-gray-600 text-sm mb-1">Teachers</div>
          <div className="text-xl font-semibold text-purple-600">{stats.teachers}</div>
        </div>
        <div className="flex flex-col items-center justify-center bg-white p-4 rounded-md shadow">
          <div className="text-gray-600 text-sm mb-1">Active Users</div>
          <div className="text-xl font-semibold text-teal-600">{stats.activeUsers}</div>
        </div>
        <div className="flex flex-col items-center justify-center bg-white p-4 rounded-md shadow">
          <div className="text-gray-600 text-sm mb-1">Manual Onboarded</div>
          <div className="text-xl font-semibold text-orange-500">{stats.manualUsers}</div>
        </div>
        <div className="flex flex-col items-center justify-center bg-white p-4 rounded-md shadow">
          <div className="text-gray-600 text-sm mb-1">Pending Verification</div>
          <div className="text-xl font-semibold text-red-500">{stats.pendingUsers}</div>
        </div>
      </div>
      <div className="mt-6 text-center">
        <span className="text-gray-500 text-sm">Current Date:</span>{' '}
        <span className="font-medium text-gray-800">
          {dayjs().format('dddd, MMMM D, YYYY, h:mm A [IST]')}
        </span>
      </div>
    </div>
  );
};

// Main DataTableUsers component
const DataTableUsers = () => {
  const [rows, setRows] = useState([]);
  const [visibleRows, setVisibleRows] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const minDate = "2024-08-26";

  const columns = useMemo(() => [
    { field: 'email', headerName: 'Email', flex: 3 },
    { field: 'name', headerName: 'Name', flex: 2 },
    {
      field: 'user_type',
      headerName: 'User Type',
      flex: 1,
      renderCell: (params) => (
        <div className="flex items-center justify-start gap-2 w-full">
          <Tooltip title={params.value} arrow placement="top">
            <div className="mt-1">{userTypeIconMap[params.value]}</div>
          </Tooltip>
        </div>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => (
        <div className="flex items-center justify-center w-full">
          <Tooltip title={params.value} arrow placement="top">
            <div className="mt-1">{statusIconMap[params.value]}</div>
          </Tooltip>
        </div>
      ),
    },
    {
      field: 'created_at',
      headerName: 'Join Date',
      flex: 1,
      valueFormatter: (params) => dayjs(params.value).format('DD-MM-YYYY'),
    },
    {
      field: 'updated_at',
      headerName: 'Last Login',
      flex: 1,
      valueFormatter: (params) => dayjs(params.value).format('DD-MM-YYYY'),
    },
    { field: 'curriculum', headerName: 'Curriculum', flex: 1 },
    {
      field: 'user_join',
      headerName: 'Onboarding',
      flex: 1,
      renderCell: (params) => (
        <div className="flex items-center justify-center w-full">
          <Tooltip title={params.value} arrow placement="top">
            <div className="mt-1">{onboardingIconMap[params.value]}</div>
          </Tooltip>
        </div>
      ),
    },
    {
      field: 'action',
      headerName: 'Action',
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => handleViewDetails(params.row.id)}
        >
          View
        </Button>
      ),
    },
  ], []);

    const getUsers = async (curriculumId?: string) => {
    setIsLoading(true);
    try {
      const url = curriculumId 
        ? `http://localhost:3001/users?curriculum=${curriculumId}`
        : 'http://localhost:3001/users';
      
      const response = await axios.get(url);
      if (response.data.success) {
        const formattedData = response.data.users.map((user) => ({
          id: user.id,
          email: user.email,
          name: user.name || '',
          user_type: user.user_type,
          status: user.status,
          created_at: user.created_at,
          updated_at: user.updated_at,
          curriculum: user.curriculum,
          user_join: user.user_join,
        }));
        setRows(formattedData);
        setVisibleRows(formattedData);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };



useEffect(() => {
    getUsers();
  }, []);

  const handleRefresh = async (curriculumId?: string) => {
    await getUsers(curriculumId);
  };

  const handleViewDetails = (userId) => {
    setSelectedUserId(userId);
    setIsDialogOpen(true);
  };

  const handleFilter = () => {
    const filteredRows = rows.filter((row) => {
      const emailMatch = row.email.toLowerCase().includes(searchText.toLowerCase());
      const rowDate = dayjs(row.created_at);
      const minAllowedDate = dayjs(minDate);
      
      const isAfterMinDate = rowDate.isAfter(minAllowedDate);
      const isInRange = (!startDate || !endDate) ? true : 
        rowDate.isAfter(dayjs(startDate)) && 
        rowDate.isBefore(dayjs(endDate));

      return emailMatch && isAfterMinDate && isInRange;
    });
    setVisibleRows(filteredRows);
  };

  const handleReset = () => {
    setSearchText('');
    setStartDate('');
    setEndDate('');
    setVisibleRows(rows);
  };


  return (
    <>
      <Header onRefresh={handleRefresh} />
      <div className="flex flex-col gap-4">
        <StatusAndOnboardingLegend />
        <DataSummary data={visibleRows} />
        <div className="flex flex-wrap gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by email..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="border p-2 rounded-md"
          />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-2 rounded-md"
            min={minDate}
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2 rounded-md"
            min={minDate}
          />
          <Button 
            variant="contained" 
            onClick={handleFilter}
            className="bg-blue-600"
          >
            Filter
          </Button>
          <Button 
            variant="outlined" 
            onClick={handleReset}
          >
            Reset
          </Button>
        </div>
        <DataGrid
          rows={visibleRows}
          columns={columns}
          loading={isLoading}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          pageSizeOptions={[10, 25, 50]}
          sx={{
            '& .MuiDataGrid-columnHeader': {
              backgroundColor: '#f5f5f5',
              fontWeight: 'bold',
            },
            '& .MuiDataGrid-row:nth-of-type(even)': {
              backgroundColor: '#f8f9fa',
            },
          }}
          style={{ height: 'calc(100vh - 250px)' }}
        />
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
