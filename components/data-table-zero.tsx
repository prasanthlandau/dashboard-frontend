'use client';
import * as React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Header from './header';
import axios from 'axios';
import dayjs from 'dayjs';
import { useApp } from './app-context';

// Define the interface for zero activity user
interface ZeroActivityUser {
  id: string;       // Unique ID with index suffix
  user_id: string;  // Original user_id from API (optional)
  email: string;
  name: string;
  user_type: string;
  created_at?: string | null;
}

const DataTableZero: React.FC = () => {
  const [allRows, setAllRows] = useState<ZeroActivityUser[]>([]);
  const [visibleRows, setVisibleRows] = useState<ZeroActivityUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  const { startDate, endDate } = useApp();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

  const columns: GridColDef[] = useMemo(
    () => [
      { field: 'email', headerName: 'Email', flex: 3 },
      { field: 'name', headerName: 'Name', flex: 2 },
      { field: 'user_type', headerName: 'User Type', flex: 1 },
      {
        field: 'created_at',
        headerName: 'Join Date',
        flex: 1,
        renderCell: (params: GridRenderCellParams<ZeroActivityUser>) =>
          params.value ? (
            <span>{dayjs(params.value).format('DD/MM/YYYY')}</span>
          ) : (
            'N/A'
          ),
      },
    ],
    []
  );

  /**
   * Fetch zero activity users with unique id containing index
   */
  const fetchZeroActivityUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const url = `${API_BASE_URL}/zero?${params.toString()}`;
      const response = await axios.get(url);

      const formattedData: ZeroActivityUser[] = response.data.map(
        (item: any, index: number) => ({
          ...item,
          id: `${item.user_id}-${index}`, // Ensure unique id
        })
      );

      setAllRows(formattedData);
      setVisibleRows(formattedData);
    } catch (error) {
      console.error('Error fetching zero activity user data:', error);
      setAllRows([]);
      setVisibleRows([]);
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, startDate, endDate]);

  // Fetch data on load and date changes
  useEffect(() => {
    fetchZeroActivityUsers();
  }, [fetchZeroActivityUsers]);

  // Filter visible rows by email search text
  const handleFilter = () => {
    const filtered = allRows.filter((row) =>
      row.email?.toLowerCase().includes(searchText.toLowerCase())
    );
    setVisibleRows(filtered);
  };

  // Reset search and show all rows
  const handleReset = () => {
    setSearchText('');
    setVisibleRows(allRows);
  };

  return (
    <div className="space-y-6">
      <Header onRefresh={fetchZeroActivityUsers} isLoading={isLoading} />

      {/* Uncomment below block to add search UI */}
      {/*
      <Card className="p-4 flex items-center gap-4">
        <Input
          placeholder="Search by email..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={handleFilter}>Filter</Button>
        <Button variant="outline" onClick={handleReset}>Reset</Button>
      </Card>
      */}

      <Card>
        <div style={{ height: '70vh', width: '100%' }}>
          <DataGrid
            rows={visibleRows}
            columns={columns}
            loading={isLoading}
            pageSizeOptions={[15, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 15 } },
            }}
            sx={{
              border: 'none',
              color: 'hsl(var(--foreground))',
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'hsl(var(--muted))',
                color: 'hsl(var(--muted-foreground))',
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid hsl(var(--border))',
              },
              '& .MuiDataGrid-footerContainer': {
                borderTop: '1px solid hsl(var(--border))',
                color: 'hsl(var(--muted-foreground))',
              },
              '& .MuiDataGrid-iconButton, & .MuiSelect-icon': {
                color: 'hsl(var(--muted-foreground))',
              },
              '& .MuiTablePagination-root': {
                color: 'hsl(var(--muted-foreground))',
              },
            }}
          />
        </div>
      </Card>
    </div>
  );
};

export default DataTableZero;
