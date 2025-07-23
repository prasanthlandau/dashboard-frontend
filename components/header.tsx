'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Moon, Sun, RefreshCw, LogOut, UserCircle } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useApp } from './app-context';
import dayjs from 'dayjs';

interface HeaderProps {
  onRefresh: () => void;
  isLoading?: boolean;
}

const Header = ({ onRefresh, isLoading = false }: HeaderProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { startDate, setStartDate, endDate, setEndDate } = useApp();
  const router = useRouter();
  const minDate = "2024-08-25";
  const maxDate = dayjs().format("YYYY-MM-DD");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("isLoggedIn");
    router.push("/login");
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 p-4 border-b">
      <div className="flex-shrink-0 h-[40px] w-[100px]">
        {isMounted && (
          <Image
            src={theme === 'dark' ? '/aspire-logo-dark.svg' : '/aspire-logo-light.svg'}
            alt="Aspire Logo"
            width={100}
            height={40}
            priority
          />
        )}
      </div>
      <div className="flex-1 min-w-0 flex justify-center">
        <h1 className="text-xl md:text-2xl font-semibold truncate">Executive Dashboard v3</h1>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          min={minDate}
          max={maxDate}
          className="p-2 border rounded-md bg-transparent text-sm"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          min={minDate}
          max={maxDate}
          className="p-2 border rounded-md bg-transparent text-sm"
        />

        <Button variant="outline" size="icon" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
        
        {isMounted ? (
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        ) : (
          <div className="w-9 h-9" />
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <UserCircle className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {/* --- 2. PLACEMENT OF THE LOGOUT ACTION --- */}
            {/* The handleLogout function is called when this menu item is clicked. */}
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  );
};

export default Header;
