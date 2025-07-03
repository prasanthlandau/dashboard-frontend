'use client'
import * as React from 'react';
import { DataGrid, GridRowsProp, GridColDef } from '@mui/x-data-grid';
import { LinearProgress, Box, Typography } from '@mui/material';

const rows: GridRowsProp = [
    { id: 1, classroom: 'A Science class', student: '1', homework: '0', completion: 0 },
    { id: 2, classroom: 'An english class', student: '0', homework: '0', completion: 0 },
    { id: 3, classroom: 'Maths YEar one', student: '8', homework: '18', completion: 20 },
];

const columns: GridColDef[] = [
  { field: 'classroom', headerName: 'Classroom', flex: 4 },
  { field: 'student', headerName: 'Student', flex: 2 },
  { field: 'homework', headerName: 'Homework', flex: 3 },
  {
    field: 'completion',
    headerName: 'Completion',
    flex: 2,
    cellClassName: 'flex items-center',
    renderCell: (params) => (
      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center' }}>
        <LinearProgress
          variant="determinate"
          value={params.value}
          sx={{ width: '100%', marginRight: 1, height: 8, borderRadius: 2 }}
        />
        <Typography variant="body2" color="textSecondary">{`${params.value}%`}</Typography>
      </Box>
    ),
  },
];


const DataTableComponent = () => {
  return (
    <div style={{ height: 320, width: '100%' }} className='bg-white flex grow max-md:!w-[700px]'>
      <DataGrid rows={rows} columns={columns} />
    </div>
  )
}

export default DataTableComponent;