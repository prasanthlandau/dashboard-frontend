import Header from '@/components/header'
import React from 'react'
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import ClassIcon from '@mui/icons-material/Class';
import SchoolIcon from '@mui/icons-material/School';
import ScheduleIcon from '@mui/icons-material/Schedule';
import BarChartComponent from '@/components/bar-chart';
import LineChartComponent from '@/components/line-chart';
import PieChartComponent from '@/components/pie-chart';

import Box from '@mui/material/Box';
import DataTableComponent from '@/components/data-table';
import DataTableReportComponent from '@/components/data-table-teacher';

const Reports = () => {
  return (
    <div className="flex flex-wrap w-full">
      <Header />
      <div className="w-full mt-30 overflow-x-scroll">
        <DataTableReportComponent />
      </div>
    </div>
  )
}

export default Reports