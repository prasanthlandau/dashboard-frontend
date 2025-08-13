"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  OnChangeFn,
} from "@tanstack/react-table";
import { FiFilter, FiColumns } from "react-icons/fi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Header from "./header";
import axios from "axios";
import { useApp } from "./app-context";
import { DataTable } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TeacherRow {
  id: string | number;
  teacher_name: string;
  teacher_email: string;
  total_classrooms: number;
  total_homeworks: number;
  total_lessons: number;
  total_students: number;
  total_watch_time: number;
}

const DataSummary = ({ data }: { data: TeacherRow[] }) => {
  const stats = useMemo(
    () => ({
      totalTeachers: data.length,
      totalClassrooms: data.reduce(
        (sum, item) => sum + Number(item.total_classrooms || 0),
        0
      ),
      totalStudents: data.reduce(
        (sum, item) => sum + Number(item.total_students || 0),
        0
      ),
      totalHomeworks: data.reduce(
        (sum, item) => sum + Number(item.total_homeworks || 0),
        0
      ),
    }),
    [data]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <MetricCard title="Total Classrooms" value={stats.totalClassrooms} />
      <MetricCard title="Total Students" value={stats.totalStudents} />
      <MetricCard title="Total Homeworks" value={stats.totalHomeworks} />
    </div>
  );
};

const MetricCard = ({ title, value }: { title: string; value: number }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const DataTableTeacher: React.FC = () => {
  const [allRows, setAllRows] = useState<TeacherRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const { startDate, endDate } = useApp();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

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

  const columns: ColumnDef<TeacherRow>[] = [
    {
      accessorKey: "teacher_name",
      header: "Teacher Name",
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "teacher_email",
      header: "Email",
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "total_classrooms",
      header: "Classrooms",
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "total_homeworks",
      header: "Homeworks",
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "total_lessons",
      header: "Lessons",
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "total_students",
      header: "Students",
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "total_watch_time",
      header: "H/W Watch Time (min)",
      enableSorting: true,
      enableHiding: true,
    },
  ];

  const fetchTeacherReport = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const url = `${API_BASE_URL}/report/teacher?${params.toString()}`;
      const response = await axios.get(url);
      const formattedData: TeacherRow[] = response.data.map((item: any) => ({
        ...item,
        id: item.teacher_id,
      }));
      setAllRows(formattedData);
    } catch (err) {
      console.error("Error fetching teacher report:", err);
      setError("Failed to load teacher data.");
      setAllRows([]);
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, startDate, endDate]);

  useEffect(() => {
    fetchTeacherReport();
  }, [fetchTeacherReport]);

  const filteredData = useMemo(() => {
    if (columnFilters.length === 0) return allRows;

    return allRows.filter((row) => {
      return columnFilters.every((filter) => {
        const value = row[filter.id as keyof TeacherRow];
        if (!value) return false;

        if (filter.id === "teacher_name" || filter.id === "teacher_email") {
          return String(value)
            .toLowerCase()
            .includes(String(filter.value).toLowerCase());
        } else {
          return String(value) === String(filter.value);
        }
      });
    });
  }, [allRows, columnFilters]);

  return (
    <div className="space-y-6">
      <Header onRefresh={fetchTeacherReport} isLoading={isLoading} />
      <DataSummary data={filteredData} />

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
                        <p className="text-sm font-medium mb-1">Email</p>
                        <Input
                          placeholder="Filter by email"
                          value={
                            (columnFilters.find((f) => f.id === "teacher_email")
                              ?.value as string) || ""
                          }
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value) {
                              setColumnFilters([
                                ...columnFilters.filter(
                                  (f) => f.id !== "teacher_email"
                                ),
                                { id: "teacher_email", value },
                              ]);
                            } else {
                              setColumnFilters(
                                columnFilters.filter(
                                  (f) => f.id !== "teacher_email"
                                )
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
                        : filter.id === "teacher_email"
                        ? "Email"
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
              pageSize: 15,
              pageSizeOptions: [15, 25, 50],
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

export default DataTableTeacher;
