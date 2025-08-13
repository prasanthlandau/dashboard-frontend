"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  OnChangeFn,
} from "@tanstack/react-table";
import { FiFilter, FiColumns } from "react-icons/fi";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Header from "./header";
import axios from "axios";
import { DataTable } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LeaderboardRow {
  id: string | number;
  rank: number;
  teacher_name: string;
  region: string;
  country: string;
  points: number | string;
  homework_count: number;
  student_count: number;
  completed_homework_count: number;
  average_completion_rate: string;
}

const DataTableLeaderboard = () => {
  const [allRows, setAllRows] = useState<LeaderboardRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleSortingChange: OnChangeFn<SortingState> = (updaterOrValue) => {
    setSorting(
      typeof updaterOrValue === "function"
        ? updaterOrValue(sorting)
        : updaterOrValue
    );
  };

  const handleColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (
    updaterOrValue
  ) => {
    setColumnFilters(
      typeof updaterOrValue === "function"
        ? updaterOrValue(columnFilters)
        : updaterOrValue
    );
  };

  const handleColumnVisibilityChange: OnChangeFn<VisibilityState> = (
    updaterOrValue
  ) => {
    setColumnVisibility(
      typeof updaterOrValue === "function"
        ? updaterOrValue(columnVisibility)
        : updaterOrValue
    );
  };

  const columns: ColumnDef<LeaderboardRow>[] = [
    {
      accessorKey: "rank",
      header: "Rank",
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "teacher_name",
      header: "Teacher",
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "region",
      header: "Region",
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "country",
      header: "Country",
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "points",
      header: "Points",
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "homework_count",
      header: "Homeworks",
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "student_count",
      header: "Students",
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "completed_homework_count",
      header: "Completed HW",
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "average_completion_rate",
      header: "Avg. Completion",
      enableSorting: true,
      enableHiding: true,
    },
  ];

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url = `${API_BASE_URL}/leaderboard`;
      const response = await axios.get(url);
      const formattedData = response.data.data.map(
        (item: any, index: number) => ({
          ...item,
          id: item.id || item.teacher_id || index,
        })
      );
      setAllRows(formattedData);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setError("Failed to load leaderboard data.");
      setAllRows([]);
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return (
    <div className="space-y-6">
      <Header onRefresh={fetchLeaderboard} isLoading={isLoading} />
      <Card>
        <div className="p-4">
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Filter teachers..."
                  value={
                    (columnFilters.find((f) => f.id === "teacher_name")
                      ?.value as string) || ""
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value) {
                      setColumnFilters([
                        ...columnFilters.filter((f) => f.id !== "teacher_name"),
                        { id: "teacher_name", value },
                      ]);
                    } else {
                      setColumnFilters(
                        columnFilters.filter((f) => f.id !== "teacher_name")
                      );
                    }
                  }}
                  className="max-w-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <FiFilter className="mr-2 h-4 w-4" />
                      Filters
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <div className="p-2 space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-1">Region</p>
                        <Input
                          placeholder="Filter by region"
                          value={
                            (columnFilters.find((f) => f.id === "region")
                              ?.value as string) || ""
                          }
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value) {
                              setColumnFilters([
                                ...columnFilters.filter(
                                  (f) => f.id !== "region"
                                ),
                                { id: "region", value },
                              ]);
                            } else {
                              setColumnFilters(
                                columnFilters.filter((f) => f.id !== "region")
                              );
                            }
                          }}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-1">Country</p>
                        <Input
                          placeholder="Filter by country"
                          value={
                            (columnFilters.find((f) => f.id === "country")
                              ?.value as string) || ""
                          }
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value) {
                              setColumnFilters([
                                ...columnFilters.filter(
                                  (f) => f.id !== "country"
                                ),
                                { id: "country", value },
                              ]);
                            } else {
                              setColumnFilters(
                                columnFilters.filter((f) => f.id !== "country")
                              );
                            }
                          }}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <FiColumns className="mr-2 h-4 w-4" />
                      Columns
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {columns.map((column, index) => {
                      const columnKey =
                        (column as any).accessorKey ||
                        column.id ||
                        `column-${index}`;

                      return (
                        <DropdownMenuCheckboxItem
                          key={columnKey}
                          className="capitalize"
                          checked={columnVisibility[columnKey] !== false}
                          onCheckedChange={(value) =>
                            setColumnVisibility({
                              ...columnVisibility,
                              [columnKey]: value,
                            })
                          }
                        >
                          {column.header as string}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {columnFilters.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {columnFilters.map((filter) => (
                  <div
                    key={filter.id}
                    className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-sm"
                  >
                    <span className="capitalize">
                      {filter.id === "teacher_name"
                        ? "Teacher"
                        : filter.id === "region"
                        ? "Region"
                        : filter.id === "country"
                        ? "Country"
                        : filter.id}
                      :
                    </span>
                    <span className="font-medium">
                      {filter.value as string}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 px-1 hover:bg-muted-foreground/20"
                      onClick={() =>
                        setColumnFilters(
                          columnFilters.filter((f) => f.id !== filter.id)
                        )
                      }
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm h-auto py-1"
                  onClick={() => setColumnFilters([])}
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>

          <DataTable
            columns={columns}
            data={allRows}
            isLoading={isLoading}
            pagination={{
              pageSize: 10,
              pageSizeOptions: [10, 20, 25, 30, 40, 50],
            }}
            sorting={sorting}
            onSortingChange={handleSortingChange}
            columnFilters={columnFilters}
            onColumnFiltersChange={handleColumnFiltersChange}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={handleColumnVisibilityChange}
          />
        </div>
      </Card>
    </div>
  );
};

export default DataTableLeaderboard;
