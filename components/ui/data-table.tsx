"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  OnChangeFn,
  Table,
} from "@tanstack/react-table";

import {
  Table as TableComponent,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

import { DataTablePagination } from "./data-table-pagination";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchColumn?: string;
  searchValue?: string;
  pagination?:
    | {
        pageSize?: number;
        pageSizeOptions?: number[];
      }
    | boolean;
  isLoading?: boolean;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchColumn,
  searchValue,
  pagination = true,
  isLoading = false,
  sorting: externalSorting,
  onSortingChange: setExternalSorting,
  columnFilters: externalColumnFilters,
  onColumnFiltersChange: setExternalColumnFilters,
  columnVisibility: externalColumnVisibility,
  onColumnVisibilityChange: setExternalColumnVisibility,
}: DataTableProps<TData, TValue>) {
  const [internalSorting, setInternalSorting] = React.useState<SortingState>(
    []
  );
  const [internalColumnFilters, setInternalColumnFilters] =
    React.useState<ColumnFiltersState>([]);
  const [internalColumnVisibility, setInternalColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const sorting = externalSorting ?? internalSorting;
  const setSorting = setExternalSorting ?? setInternalSorting;
  const columnFilters = externalColumnFilters ?? internalColumnFilters;
  const setColumnFilters = setExternalColumnFilters ?? setInternalColumnFilters;
  const columnVisibility = externalColumnVisibility ?? internalColumnVisibility;
  const setColumnVisibility =
    setExternalColumnVisibility ?? setInternalColumnVisibility;

  const isPaginationEnabled = pagination !== false;
  const pageSize =
    typeof pagination === "object" && pagination.pageSize
      ? pagination.pageSize
      : 10;

  React.useEffect(() => {
    if (searchColumn && searchValue) {
      const existingFilter = columnFilters.find((f) => f.id === searchColumn);
      if (!existingFilter || existingFilter.value !== searchValue) {
        setColumnFilters([
          ...columnFilters.filter((f) => f.id !== searchColumn),
          { id: searchColumn, value: searchValue },
        ]);
      }
    } else if (searchColumn && !searchValue) {
      setColumnFilters(columnFilters.filter((f) => f.id !== searchColumn));
    }
  }, [searchColumn, searchValue, columnFilters, setColumnFilters]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: isPaginationEnabled
      ? getPaginationRowModel()
      : undefined,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: pageSize,
      },
    },
  });

  return (
    <div className="space-y-4">
      <div className="rounded-md border relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          </div>
        )}
        <TableComponent>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="relative">
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center space-x-1">
                          <div className="flex-1">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </div>
                          {header.column.getCanSort() && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-muted"
                              onClick={() => {
                                const currentSort = header.column.getIsSorted();
                                if (currentSort === "asc") {
                                  header.column.toggleSorting(true);
                                } else if (currentSort === "desc") {
                                  header.column.clearSorting();
                                } else {
                                  header.column.toggleSorting(false);
                                }
                              }}
                            >
                              {header.column.getIsSorted() === "asc" ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : header.column.getIsSorted() === "desc" ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronsUpDown className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {isLoading ? "Loading data..." : "No results."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </TableComponent>
      </div>

      {isPaginationEnabled && <DataTablePagination table={table} />}
    </div>
  );
}
