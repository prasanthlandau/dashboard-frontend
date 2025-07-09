'use client';
import React, { createContext, useState, useContext, ReactNode } from 'react';
import dayjs from 'dayjs';

interface AppContextType {
  // Date range state
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  
  // You can add other global state here in the future
}

// Default start date is fixed, end date is today
const defaultStartDate = '2024-08-25';
const defaultEndDate = dayjs().format('YYYY-MM-DD');

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);

  const value = {
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
