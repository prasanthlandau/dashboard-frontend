'use client';
import React, { createContext, useState, useContext, ReactNode } from 'react';
import dayjs from 'dayjs';

interface AppContextType {
  // Curriculum state
  curriculum: string;
  setCurriculum: (value: string) => void;
  getCurriculumId: () => string | undefined;

  // Date range state
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
}

// Default start date and today's date for the end date
const defaultStartDate = '2024-08-25';
const defaultEndDate = dayjs().format('YYYY-MM-DD');

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [curriculum, setCurriculum] = useState('Default');
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);

  const getCurriculumId = () => {
    switch(curriculum) {
      case 'BP': return '2';
      case 'MoSE': return '1';
      default: return undefined;
    }
  };

  const value = {
    curriculum,
    setCurriculum,
    getCurriculumId,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
