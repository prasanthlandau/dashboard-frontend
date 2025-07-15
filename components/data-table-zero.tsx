'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Header from './header';
import axios from 'axios';
import dayjs from 'dayjs';
import { useApp } from './app-context';

const DataTableZero = () => {
  const [allRows, setAllRows] = useState([]);
  const [visibleRows, setVisibleRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  const { startDate, endDate } = useApp();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const columns: GridColDef[] = useMemo(
    () => [
      { field: 'email', headerName: 'Email', flex: 3 },
      { field: 'name', headerName: 'Name', flex: 2 },
      { field: 'user_type', headerName: 'User Type', flex: 1 },
      {
        field: 'created_at',
        headerName: 'Join Date',
        flex: 1,
        renderCell: (params) =>
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
   * ✅ Fetches all zero activity users (with unique `id`)
   */
  const fetchZeroActivityUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ startDate, endDate });
      const url = `${API_BASE_URL}/zero?${params.toString()}`;
      const response = await axios.get(url);

      // ✅ Add fallback unique index to avoid duplicate keys
      const formattedData = response.data.map((item: any, index: number) => ({
        ...item,
        id: `${item.user_id}-${index}`, // ensures unique id
      }));

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

  // 🔁 Auto-fetch when date changes
  useEffect(() => {
    fetchZeroActivityUsers();
  }, [fetchZeroActivityUsers]);

  const handleFilter = () => {
    const filtered = allRows.filter((row) =>
      row.email?.toLowerCase().includes(searchText.toLowerCase())
    );
    setVisibleRows(filtered);
  };

  const handleReset = () => {
    setSearchText('');
    setVisibleRows(allRows);
  };

  return (
    <div className="space-y-6">
      <Header onRefresh={fetchZeroActivityUsers} isLoading={isLoading} />

      

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
