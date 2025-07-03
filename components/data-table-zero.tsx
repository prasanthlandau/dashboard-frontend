'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { CheckCircle, Cancel, Person, School, AccountCircle } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import axios from 'axios';
import dayjs from 'dayjs';


const onboardingIconMap = {
  Manual: <Person style={{ color: 'blue' }} />,
  Self: <Person style={{ color: 'purple' }} />,
};

const userTypeIconMap = {
  Student: <School style={{ color: 'green' }} />,
  Teacher: <AccountCircle style={{ color: 'blue' }} />,
};


const StatusAndOnboardingLegend = () => (
  <div className="flex items-center gap-8 mb-4 flex-wrap">
    <div className="flex items-center gap-8 border-r pr-8">
      <div className="flex items-center gap-2">
        <Person style={{ color: 'blue' }} />
        <span>Manual Onboarding</span>
      </div>
      <div className="flex items-center gap-2">
        <Person style={{ color: 'purple' }} />
        <span>Normal Onboarding</span>
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

const DataSummary = ({ data }) => {
  const stats = useMemo(() => ({
    totalUsers: data.length,
    teachers: data.filter(user => user.user_type === 'Teacher').length,
    students: data.filter(user => user.user_type === 'Student').length,
    selfOnboarded: data.filter(user => user.user_join === 'Self').length,
    manualOnboarded: data.filter(user => user.user_join === 'Manual').length,
  }), [data]);

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-6">
      
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-md shadow text-center">
          <div className="text-xl font-semibold text-blue-600">{stats.totalUsers}</div>
          <div className="text-sm text-gray-600">Total Users</div>
        </div>
        <div className="bg-white p-4 rounded-md shadow text-center">
          <div className="text-xl font-semibold text-green-600">{stats.teachers}</div>
          <div className="text-sm text-gray-600">Teachers</div>
        </div>
        <div className="bg-white p-4 rounded-md shadow text-center">
          <div className="text-xl font-semibold text-purple-600">{stats.students}</div>
          <div className="text-sm text-gray-600">Students</div>
        </div>
        <div className="bg-white p-4 rounded-md shadow text-center">
          <div className="text-xl font-semibold text-orange-500">{stats.selfOnboarded}</div>
          <div className="text-sm text-gray-600">Self Onboarded</div>
        </div>
        <div className="bg-white p-4 rounded-md shadow text-center">
          <div className="text-xl font-semibold text-teal-600">{stats.manualOnboarded}</div>
          <div className="text-sm text-gray-600">Manual Onboarded</div>
        </div>
      </div>
      <div className="mt-4 text-center">
        <span className="text-gray-500 text-sm">Current Date:</span>{' '}
        <span className="font-medium text-gray-800">
          {dayjs().format('dddd, MMMM D, YYYY, h:mm A [IST]')}
        </span>
      </div>
    </div>
  );
};

const columns: GridColDef[] = [
  { field: 'email', headerName: 'Email', flex: 3, headerClassName: 'data-grid-header' },
  { field: 'name', headerName: 'Name', flex: 2, headerClassName: 'data-grid-header' },
  { 
    field: 'created_at', 
    headerName: 'Join Date', 
    flex: 1, 
    headerClassName: 'data-grid-header',
  },
  { 
    field: 'verified_at', 
    headerName: 'Verified At', 
    flex: 1, 
    headerClassName: 'data-grid-header',
  },
  {
    field: 'user_type',
    headerName: 'User Type',
    flex: 1,
    headerClassName: 'data-grid-header',
    renderCell: (params) => (
      <div className="flex items-center justify-start gap-2 w-full">
        <Tooltip title={params.value} arrow placement="top">
          <div className="mt-1">{userTypeIconMap[params.value]}</div>
        </Tooltip>
        
      </div>
    ),
  },
  {
    field: 'user_join',
    headerName: 'Onboarding',
    flex: 1,
    headerClassName: 'data-grid-header',
    renderCell: (params) => (
      <div className="flex items-center justify-start gap-2 w-full">
        <Tooltip title={params.value} arrow placement="top">
          <div className="mt-1">{onboardingIconMap[params.value]}</div>
        </Tooltip>
        
      </div>
    ),
  },
];

const DataTableZeroComponent = () => {
  const [rows, setRows] = useState([]);

  const getZeroActivityUsers = async () => {
    try {
      const response = await axios.get("http://localhost:3001/zero");
      const formattedData = response.data.map((item, index) => ({
        id: index,
        ...item,
        user_id: item.user_id.toString()
      }));
      setRows(formattedData);
    } catch (error) {
      console.error('Error fetching zero activity user data:', error);
    }
  };

  useEffect(() => {
    getZeroActivityUsers();
  }, []);

  return (
    <div className="flex flex-col w-full">
      <StatusAndOnboardingLegend />
      <DataSummary data={rows} />
      <div  className='bg-white'>
        <DataGrid 
          rows={rows} 
          columns={columns} 
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          pageSizeOptions={[10, 25, 50]}
          sx={{
            '& .data-grid-header': {
              backgroundColor: '#f5f5f5',
            },
            '& .MuiDataGrid-row:nth-of-type(even)': {
              backgroundColor: '#f8f9fa',
            }
          }}
        />
      </div>
    </div>
  );
};

export default DataTableZeroComponent;
