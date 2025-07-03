'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { DataGrid, GridRowsProp, GridColDef } from '@mui/x-data-grid';
import { TextField, Button, Stack } from '@mui/material';
import axios from 'axios';
import dayjs from 'dayjs';

const DataSummary: React.FC<{ data: any[] }> = ({ data }) => {
  const stats = useMemo(() => {
    return data.reduce((acc, item) => {
      acc.totalStudents++;
      acc.totalClassrooms += Number(item.total_classrooms) || 0;
      acc.totalHomeworks += Number(item.total_homeworks_assigned) || 0;
      acc.completedHomeworks += Number(item.completed_homeworks) || 0;
      acc.totalVideos += Number(item.total_videos) || 0;
      return acc;
    }, { totalStudents: 0, totalClassrooms: 0, totalHomeworks: 0, completedHomeworks: 0, totalVideos: 0 });
  }, [data]);

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-5 gap-4">
        <div className="flex flex-col items-center justify-center bg-white p-4 rounded-md shadow">
          <div className="text-gray-600 text-sm mb-1">Total Students</div>
          <div className="text-xl font-semibold text-blue-600">{stats.totalStudents}</div>
        </div>
        <div className="flex flex-col items-center justify-center bg-white p-4 rounded-md shadow">
          <div className="text-gray-600 text-sm mb-1">Total Classrooms</div>
          <div className="text-xl font-semibold text-green-600">{stats.totalClassrooms}</div>
        </div>
        <div className="flex flex-col items-center justify-center bg-white p-4 rounded-md shadow">
          <div className="text-gray-600 text-sm mb-1">Total Homeworks</div>
          <div className="text-xl font-semibold text-purple-600">{stats.totalHomeworks}</div>
        </div>
        <div className="flex flex-col items-center justify-center bg-white p-4 rounded-md shadow">
          <div className="text-gray-600 text-sm mb-1">Completed Homeworks</div>
          <div className="text-xl font-semibold text-teal-600">{stats.completedHomeworks}</div>
        </div>
        <div className="flex flex-col items-center justify-center bg-white p-4 rounded-md shadow">
          <div className="text-gray-600 text-sm mb-1">Total Videos</div>
          <div className="text-xl font-semibold text-orange-600">{stats.totalVideos}</div>
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

const columns: GridColDef[] = [
  { field: 'student_email', headerName: 'Email', flex: 2, headerClassName: 'data-grid-header' },
  { field: 'student_name', headerName: 'Name', flex: 2, headerClassName: 'data-grid-header' },
  { field: 'total_classrooms', headerName: 'Total Classrooms', flex: 1, headerClassName: 'data-grid-header' },
  { field: 'total_homeworks_assigned', headerName: 'Total Homeworks', flex: 1, headerClassName: 'data-grid-header' },
  { field: 'completed_homeworks', headerName: 'Completed Homeworks', flex: 1, headerClassName: 'data-grid-header' },
  { field: 'total_videos', headerName: 'Total Videos', flex: 1, headerClassName: 'data-grid-header' },
];

const DataTableUserComponent = () => {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [searchText, setSearchText] = useState('');

  const getUsers = async () => {
    try {
      const response = await axios.get("http://localhost:3001/report/student");
      const data = response.data;

      const formattedData = data.map((item, index) => ({
        id: item.student_id || index,
        student_email: item.student_email,
        student_name: item.student_name,
        total_classrooms: item.total_classrooms,
        total_homeworks_assigned: item.total_homeworks_assigned,
        completed_homeworks: item.completed_homeworks,
        total_videos: item.total_videos
      }));
      
      setRows(formattedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const handleFilter = () => {
    let filteredRows = [...rows];

    if (searchText) {
      filteredRows = filteredRows.filter((row) => 
        row.student_email.toLowerCase().includes(searchText.toLowerCase()) ||
        row.student_name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setRows(filteredRows);
  };

  const handleReset = () => {
    getUsers();
    setSearchText('');
  };

  return (
    <div className="flex flex-col w-full">
    

      <div className='bg-white' >
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

export default DataTableUserComponent;
