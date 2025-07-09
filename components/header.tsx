'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Moon, Sun, User, RefreshCw } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useApp } from './curriculum-context';
import dayjs from 'dayjs';
import { TextField } from '@mui/material';

interface HeaderProps {
  onRefresh: () => void;
  isLoading?: boolean;
}

const Header = ({ onRefresh, isLoading = false }: HeaderProps) => {
  const { theme, setTheme } = useTheme();
  const { startDate, setStartDate, endDate, setEndDate } = useApp();
  const minDate = "2024-08-25";

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b">
      {/* Breadcrumb can go here if needed */}
      <div className="flex-1">
        <h1 className="text-2xl font-semibold">Executive Dashboard</h1>
      </div>

      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Data from: {dayjs(startDate).format('DD MMM YYYY')} to {dayjs(endDate).format('DD MMM YYYY')}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <TextField
          label="Start Date"
          type="date"
          size="small"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: minDate }}
        />
        <TextField
          label="End Date"
          type="date"
          size="small"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: minDate }}
        />
        <Button variant="outline" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="ml-2">Refresh</span>
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
