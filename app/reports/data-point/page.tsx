'use client';

import React from 'react';
import Header from '@/components/header';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import ClassIcon from '@mui/icons-material/Class';
import SchoolIcon from '@mui/icons-material/School';
import ScheduleIcon from '@mui/icons-material/Schedule';
import BarChartComponent from '@/components/bar-chart';
import LineChartComponent from '@/components/line-chart';
import PieChartComponent from '@/components/pie-chart';
import DataPoint from '@/components/data-point';
import Box from '@mui/material/Box';

// Optional: style fixes for padding/margin and scroll
const Reports = () => (
  <>
    <Header />
    <Box sx={{ width: '100%', px: { xs: 1, md: 4 }, pt: 2 }}>
      <Box sx={{ width: '100%', minWidth: 320, mt: 4, overflowX: 'auto' }}>
        <DataPoint />
      </Box>
    </Box>
  </>
);

export default Reports;
