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
      <div className="w-full px-1 md:px-4 pt-2">
        <div className="w-full min-w-[320px] mt-4 overflow-x-auto">
          <DataPoint />
        </div>
      </div>
    </>
  );
};


export default Reports;
