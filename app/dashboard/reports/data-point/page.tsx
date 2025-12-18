'use client';

import React from 'react';
import Header from '@/components/header';
import { FiUserPlus, FiBook, FiUsers, FiClock } from 'react-icons/fi';
import BarChartComponent from '@/components/bar-chart';
import LineChartComponent from '@/components/line-chart';
import PieChartComponent from '@/components/pie-chart';
import DataPoint from '@/components/data-point';

const Reports = () => {
  const handleRefresh = () => {
    console.log("Refresh triggered");
  };

  return (
    <>
      <Header onRefresh={handleRefresh} />
      <Box sx={{ width: '100%', px: { xs: 1, md: 4 }, pt: 2 }}>
        <Box sx={{ width: '100%', minWidth: 320, mt: 4, overflowX: 'auto' }}>
          <DataPoint />
        </Box>
      </Box>
    </>
  );
};


export default Reports;
