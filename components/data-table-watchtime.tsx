'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { DataGrid, GridRowsProp, GridColDef, GridValueFormatterParams } from '@mui/x-data-grid';
import axios from 'axios';
import dayjs from 'dayjs';

const DataSummary: React.FC<{ data: any[] }> = ({ data }) => {
  const stats = useMemo(() => {
    return data.reduce((acc, item) => {
      acc.totalUsers++;
      acc.totalHomeworkWT += Number(item.total_watched_lesson_duration_in_minutes) || 0;
      acc.totalCourseWT += Number(item.total_watched_minutes_q1) || 0;
      acc.totalWT += Number(item.total_watch_minutes) || 0;
      return acc;
    }, { totalUsers: 0, totalHomeworkWT: 0, totalCourseWT: 0, totalWT: 0 });
  }, [data]);

    return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="flex flex-col items-center justify-center bg-white p-4 rounded-md shadow">
          <div className="text-gray-600 text-sm mb-1">Total Users</div>
          <div className="text-xl font-semibold text-blue-600">{stats.totalUsers}</div>
        </div>
        <div className="flex flex-col items-center justify-center bg-white p-4 rounded-md shadow">
          <div className="text-gray-600 text-sm mb-1">Total Homework WT</div>
          <div className="text-xl font-semibold text-green-600">{Math.floor(stats.totalHomeworkWT)} Min</div>
        </div>
        <div className="flex flex-col items-center justify-center bg-white p-4 rounded-md shadow">
          <div className="text-gray-600 text-sm mb-1">Total Course WT</div>
          <div className="text-xl font-semibold text-purple-600">{Math.floor(stats.totalCourseWT)} Min</div>
        </div>
        <div className="flex flex-col items-center justify-center bg-white p-4 rounded-md shadow">
          <div className="text-gray-600 text-sm mb-1">Total Watch Time</div>
          <div className="text-xl font-semibold text-teal-600">{Math.floor(stats.totalWT)} Min</div>
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
  { field: 'email', headerName: 'Email', flex: 3, headerClassName: 'data-grid-header' },
  { field: 'profile_count', headerName: 'Profile Count', flex: 1, headerClassName: 'data-grid-header' },
  { 
    field: 'total_watched_minutes_q1', 
    headerName: 'Watch Minutes (Course)', 
    flex: 1, 
    headerClassName: 'data-grid-header',
    
  },
  { 
    field: 'total_watched_lesson_duration_in_minutes', 
    headerName: 'Watch Minutes (HW)', 
    flex: 1, 
    headerClassName: 'data-grid-header',
    
  },
  { 
    field: 'total_watch_minutes', 
    headerName: 'Total Watch Minutes', 
    flex: 1, 
    headerClassName: 'data-grid-header',
    
  }
];

const DataTableUserComponent: React.FC = () => {
  const [rows, setRows] = useState<GridRowsProp>([]);

  const getUsers = async () => {
    try {
      const response = await axios.get("http://localhost:3001/watchtime");
      const data = response.data;
      
      const formattedData = data.map((item: any, index: number) => ({
        id: index,
        ...item,
        total_watch_minutes: Number(((item.total_watched_minutes_q1 || 0) + (item.total_watched_lesson_duration_in_minutes || 0)).toFixed(2))
      }));
      
      setRows(formattedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div className="flex flex-col">
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

export default DataTableUserComponent;
