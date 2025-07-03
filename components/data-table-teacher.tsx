'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import axios from 'axios';
import { Button } from '@mui/material';
import dayjs from 'dayjs';

const DataSummary = ({ data }) => {
  const stats = useMemo(() => ({
    totalTeachers: data.length,
    totalClassrooms: data.reduce((sum, teacher) => sum + teacher.total_classrooms, 0),
    totalStudents: data.reduce((sum, teacher) => sum + teacher.total_students, 0),
    totalHomeworks: data.reduce((sum, teacher) => sum + teacher.total_homeworks, 0),
    totalLessons: data.reduce((sum, teacher) => sum + teacher.total_lessons, 0),
    totalLessonAssignments: data.reduce((sum, teacher) => sum + teacher.total_lesson_assignments, 0),
    totalWatchTime: data.reduce((sum, teacher) => sum + teacher.total_watch_time, 0),
  }), [data]);

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="flex flex-col items-center justify-center bg-white p-4 rounded-md shadow">
          <div className="text-gray-600 text-sm mb-1">Total Teachers</div>
          <div className="text-xl font-semibold text-blue-600">{stats.totalTeachers}</div>
        </div>
        <div className="flex flex-col items-center justify-center bg-white p-4 rounded-md shadow">
          <div className="text-gray-600 text-sm mb-1">Total Classrooms</div>
          <div className="text-xl font-semibold text-green-600">{stats.totalClassrooms}</div>
        </div>
        <div className="flex flex-col items-center justify-center bg-white p-4 rounded-md shadow">
          <div className="text-gray-600 text-sm mb-1">Total Students</div>
          <div className="text-xl font-semibold text-purple-600">{stats.totalStudents}</div>
        </div>
        <div className="flex flex-col items-center justify-center bg-white p-4 rounded-md shadow">
          <div className="text-gray-600 text-sm mb-1">Total Homeworks</div>
          <div className="text-xl font-semibold text-teal-600">{stats.totalHomeworks}</div>
        </div>
        <div className="flex flex-col items-center justify-center bg-white p-4 rounded-md shadow">
          <div className="text-gray-600 text-sm mb-1">Total Lessons</div>
          <div className="text-xl font-semibold text-orange-500">{stats.totalLessons}</div>
        </div>
        <div className="flex flex-col items-center justify-center bg-white p-4 rounded-md shadow">
          <div className="text-gray-600 text-sm mb-1">Total Lesson Assignments</div>
          <div className="text-xl font-semibold text-indigo-600">{stats.totalLessonAssignments}</div>
        </div>
        <div className="flex flex-col items-center justify-center bg-white p-4 rounded-md shadow">
          <div className="text-gray-600 text-sm mb-1">Total Watch Time (minutes)</div>
          <div className="text-xl font-semibold text-red-600">{Math.round(stats.totalWatchTime)}</div>
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

const TeacherReportPage = () => {
  const [data, setData] = useState([]);

  const columns: GridColDef[] = [
    { field: 'teacher_name', headerName: 'Teacher Name', flex: 1, headerClassName: 'data-grid-header' },
    { field: 'teacher_email', headerName: 'Email', flex: 2, headerClassName: 'data-grid-header' },
    { field: 'total_classrooms', headerName: 'Total Classrooms', flex: 1, headerClassName: 'data-grid-header' },
    { field: 'total_students', headerName: 'Total Students', flex: 1, headerClassName: 'data-grid-header' },
    { field: 'total_homeworks', headerName: 'Total Homeworks', flex: 1, headerClassName: 'data-grid-header' },
    { field: 'total_lessons', headerName: 'Total Lessons', flex: 1, headerClassName: 'data-grid-header' },
    { field: 'total_lesson_assignments', headerName: 'Total Lesson Assignments', flex: 1, headerClassName: 'data-grid-header' },
    { 
      field: 'total_watch_time', 
      headerName: 'Total Watch Time (minutes)', 
      flex: 1, 
      headerClassName: 'data-grid-header',
    },
    { field: 'recent_homeworks_created', headerName: 'Recent Homeworks Created', flex: 1, headerClassName: 'data-grid-header' },
    { field: 'recent_student_activities', headerName: 'Recent Student Activities', flex: 1, headerClassName: 'data-grid-header' }
  ];

  const fetchTeacherData = async (curriculumId?: string) => {
    try {
      const url = `http://localhost:3001/report/teacher${
        curriculumId ? `?curriculum=${curriculumId}` : ''
      }`;
      const response = await axios.get(url);
      const formattedData = response.data.map((item: any) => ({
        id: item.teacher_id,
        ...item
      }));
      setData(formattedData);
    } catch (error) {
      console.error('Error fetching teacher data:', error);
    }
  };

  useEffect(() => {
    fetchTeacherData();
  }, []);

  return (
    <div className="flex flex-wrap w-full flex-col">
      <DataSummary data={data} />
      <div className="bg-white mt-4">
        <DataGrid 
          rows={data} 
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

export default TeacherReportPage;
