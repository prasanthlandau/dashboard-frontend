'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Moon, Sun, RefreshCw, Calendar as CalendarIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useApp } from './app-context';
import dayjs from 'dayjs';

interface HeaderProps {
  onRefresh: () => void;
  isLoading?: boolean;
}

const Header = ({ onRefresh, isLoading = false }: HeaderProps) => {
  const { theme, setTheme } = useTheme();
  const { startDate, setStartDate, endDate, setEndDate } = useApp();
  const minDate = "2024-08-25";
  const maxDate = dayjs().format("YYYY-MM-DD");

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b">
      <div className="flex-1">
        <h1 className="text-2xl font-semibold">Executive Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {/*<CalendarIcon className="h-4 w-4" />
          <span>
            {dayjs(startDate).format('DD MMM YYYY')} - {dayjs(endDate).format('DD MMM YYYY')}
          </span>*/}
        </div>

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          min={minDate}
          max={maxDate}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          min={minDate}
          max={maxDate}
        />


        <Button variant="outline" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
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
