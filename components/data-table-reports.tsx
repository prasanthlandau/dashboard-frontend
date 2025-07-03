'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { DataGrid, GridRowsProp, GridColDef } from '@mui/x-data-grid';
import { TextField, Button, Stack } from '@mui/material';
import axios from 'axios';
import dayjs from 'dayjs';

const DataSummary: React.FC<{ data: any[] }> = ({ data }) => {
  const stats = useMemo(() => {
    return data.reduce((acc, item) => {
      acc.totalClassrooms++;
      acc.totalStudents += Number(item.total_student) || 0;
      acc.totalTeachers += Number(item.total_teachers) || 0;
      acc.totalHomeworks += Number(item.total_homeworks) || 0;
      acc.totalLessons += Number(item.total_videos) || 0;
      return acc;
    }, { totalClassrooms: 0, totalStudents: 0, totalHomeworks: 0, totalLessons: 0 });
  }, [data]);

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="flex flex-col items-center justify-center bg-white p-4 rounded-md shadow">
          <div className="text-gray-500 text-sm mb-1">Total Classrooms</div>
          <div className="text-xl font-semibold text-blue-600">{stats.totalClassrooms}</div>
        </div>
        <div className="flex flex-col items-center justify-center bg-white p-4 rounded-md shadow">
          <div className="text-gray-500 text-sm mb-1">Total Students</div>
          <div className="text-xl font-semibold text-green-600">{stats.totalStudents}</div>
        </div>
        <div className="flex flex-col items-center justify-center bg-white p-4 rounded-md shadow">
          <div className="text-gray-500 text-sm mb-1">Total Homeworks</div>
          <div className="text-xl font-semibold text-purple-600">{stats.totalHomeworks}</div>
        </div>
        <div className="flex flex-col items-center justify-center bg-white p-4 rounded-md shadow">
          <div className="text-gray-500 text-sm mb-1">Total Lessons</div>
          <div className="text-xl font-semibold text-teal-600">{stats.totalLessons}</div>
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
  { field: 'class_id', headerName: 'Class ID', flex: 1, headerClassName: 'data-grid-header' },
  { field: 'classroom_name', headerName: 'Classroom Name', flex: 2, headerClassName: 'data-grid-header' },
  { field: 'teacher_email', headerName: 'Teacher Email', flex: 2, headerClassName: 'data-grid-header' },
  { field: 'total_student', headerName: 'Total Students', flex: 1, headerClassName: 'data-grid-header' },
  { field: 'total_homeworks', headerName: 'Total Homeworks', flex: 1, headerClassName: 'data-grid-header' },
  { field: 'total_videos', headerName: 'Total Lessons', flex: 1, headerClassName: 'data-grid-header' },,
  { 
    field: 'homework_completion_rate', 
    headerName: 'Rate of Completion', 
    flex: 1, 
    headerClassName: 'data-grid-header',
  }
];

const DataTableUserComponent = () => {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [searchText, setSearchText] = useState('');

  const getUsers = async () => {
    try {
      const response = await axios.get("http://localhost:3001/report/classroom");
      const data = response.data;

      const formattedData = data.map((item, index) => ({
        id: item.class_id || index,
        class_id: item.class_id,
        classroom_name: item.classroom_name,
        teacher_email: item.teacher_email,
        total_student: item.total_student,
        total_homeworks: item.total_homeworks,
        total_videos: item.total_videos,
        homework_completion_rate: item.homework_completion_rate+" %"
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
        row.classroom_name.toLowerCase().includes(searchText.toLowerCase()) ||
        row.course_name.toLowerCase().includes(searchText.toLowerCase()) ||
        row.teacher_email.toLowerCase().includes(searchText.toLowerCase())
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
