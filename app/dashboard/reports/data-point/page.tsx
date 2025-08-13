'use client';

import React, { useState, useMemo } from 'react';
import Header from '@/components/header';
import DataPoint from '@/components/data-point';
import Box from '@mui/material/Box';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';

/**
 * Generates weekly date range options for the last N weeks.
 * Each option is a string like "2025-07-21_2025-07-27"
 * @returns { {value: string, label: string}[] }
 */
const generateWeeklyOptions = () => {
  const options = [];
  const today = new Date();
  const dayOfWeek = today.getDay(); // Sunday=0, Monday=1, ...

  // Find the most recent Sunday
  const mostRecentSunday = new Date(today);
  mostRecentSunday.setDate(today.getDate() - dayOfWeek);
  mostRecentSunday.setHours(23, 59, 59, 999);


  for (let i = 0; i < 12; i++) { // Generate for the last 12 weeks
    const endDate = new Date(mostRecentSunday);
    endDate.setDate(mostRecentSunday.getDate() - (i * 7));
    
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    const formatDate = (date) => date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const formatValue = (date) => date.toISOString().split('T')[0];

    options.push({
      value: `${formatValue(startDate)}_${formatValue(endDate)}`,
      label: `${formatDate(startDate)} - ${formatDate(endDate)}`
    });
  }
  return options;
};


const Reports = () => {
  const weeklyOptions = useMemo(() => generateWeeklyOptions(), []);
  const [selectedWeek, setSelectedWeek] = useState(weeklyOptions[0]?.value || '');

  const handleRefresh = () => {
    console.log("Refresh triggered");
  };
  
  const handleWeekChange = (event) => {
    setSelectedWeek(event.target.value);
  };

  const selectedWeekLabel = weeklyOptions.find(opt => opt.value === selectedWeek)?.label || '';

  return (
    <>
      <Header onRefresh={handleRefresh} />
      <Box sx={{ width: '100%', px: { xs: 1, md: 4 }, pt: 2 }}>
        
        {/* Date Range Selector */}
        <Box sx={{ maxWidth: 300, mb: 4 }}>
            <FormControl fullWidth>
                <InputLabel id="week-select-label">Select Week</InputLabel>
                <Select
                    labelId="week-select-label"
                    id="week-select"
                    value={selectedWeek}
                    label="Select Week"
                    onChange={handleWeekChange}
                >
                    {weeklyOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>

        <Box sx={{ width: '100%', minWidth: 320, mt: 4, overflowX: 'auto' }}>
          <DataPoint selectedWeek={selectedWeek} selectedWeekLabel={selectedWeekLabel} />
        </Box>
      </Box>
    </>
  );
};

export default Reports;
