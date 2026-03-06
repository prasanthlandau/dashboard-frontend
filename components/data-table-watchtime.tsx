"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  OnChangeFn,
} from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FiFilter,
  FiColumns,
  FiUser,
  FiUsers,
  FiUserCheck
} from "react-icons/fi";
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
import {
  TooltipProvider,
  Tooltip as ShadcnTooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WatchtimeRow {
  id: string | number;
  email: string;
  user_type: "Student" | "Teacher";
  user_join: "Manual" | "Self";
  total_watched_minutes_q1: number;
  total_watched_lesson_duration_in_minutes: number;
  total_watch_minutes: number;
}

const onboardingIconMap: Record<WatchtimeRow["user_join"], React.JSX.Element> =
  {
    Manual: <FiUser className="text-blue-500" />,
    Self: <FiUser className="text-orange-500" />,
  };

const userTypeIconMap: Record<WatchtimeRow["user_type"], React.JSX.Element> = {
  Student: <FiUsers className="text-green-500" />,
  Teacher: <FiUserCheck className="text-blue-500" />,
};

const StatusAndOnboardingLegend = () => (
  <div className="flex items-center gap-x-6 gap-y-2 mb-4 flex-wrap p-4 bg-card rounded-lg border">
    <div className="flex items-center gap-2 text-sm">
      <FiUser className="h-4 w-4 text-blue-500" /> <span>Manual Onboard</span>
    </div>
    <div className="flex items-center gap-2 text-sm">
      <FiUser className="h-4 w-4 text-orange-500" /> <span>Self Onboard</span>
    </div>
    <div className="flex items-center gap-2 text-sm">
      <FiUsers className="h-4 w-4 text-green-500" /> <span>Student</span>
    </div>
    <div className="flex items-center gap-2 text-sm">
      <FiUserCheck className="h-4 w-4 text-blue-500" /> <span>Teacher</span>
    </div>
  </div>
);

const DataSummary = ({ data }: { data: WatchtimeRow[] }) => {
  const stats = useMemo(
    () => ({
      totalUsers: data.length,
      totalCourseWT: data.reduce(
        (sum, item) => sum + (item.total_watched_minutes_q1 || 0),
        0
      ),
      totalHomeworkWT: data.reduce(
        (sum, item) =>
          sum + (item.total_watched_lesson_duration_in_minutes || 0),
        0
      ),
    }),
    [data]
  );

  const minutesToHours = (mins: number) => Math.round(mins / 60);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <MetricCard title="Total Users" value={stats.totalUsers} />
      <MetricCard
        title="Total Course WatchTime"
        value={`${Math.round(stats.totalCourseWT)} min (${minutesToHours(
          stats.totalCourseWT
        )} hr)`}
      />
      <MetricCard
        title="Total Homework WatchTime"
        value={`${Math.round(stats.totalHomeworkWT)} min (${minutesToHours(
          stats.totalHomeworkWT
        )} hr)`}
      />
    </div>
  );
};

const MetricCard = ({
  title,
  value,
}: {
  title: string;
  value: React.ReactNode;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const DataTableWatchtime = () => {
  const [allRows, setAllRows] = useState<WatchtimeRow[]>([]);
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

  const columns: ColumnDef<WatchtimeRow>[] = [
    {
      accessorKey: "email",
      header: "Email",
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "user_type",
      header: "User Type",
      enableSorting: true,
      enableHiding: true,
      filterFn: "equals",
      cell: ({ row }) => {
        const userTypeValue = row.original.user_type;
        const icon = userTypeIconMap[userTypeValue];
        return (
          <TooltipProvider>
            <ShadcnTooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center">{icon}</div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{userTypeValue}</p>
              </TooltipContent>
            </ShadcnTooltip>
          </TooltipProvider>
        );
      },
    },
    {
      accessorKey: "user_join",
      header: "Onboarding",
      enableSorting: true,
      enableHiding: true,
      filterFn: "equals",
      cell: ({ row }) => {
        const joinValue = row.original.user_join;
        const icon = onboardingIconMap[joinValue];
        return (
          <TooltipProvider>
            <ShadcnTooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center">{icon}</div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{joinValue}</p>
              </TooltipContent>
            </ShadcnTooltip>
          </TooltipProvider>
        );
      },
    },
    {
      accessorKey: "total_watched_minutes_q1",
      header: "Course Watch (min)",
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "total_watched_lesson_duration_in_minutes",
      header: "Homework Watch (min)",
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "total_watch_minutes",
      header: "Total Watch (min)",
      enableSorting: true,
      enableHiding: true,
    },
  ];

  const fetchWatchtimeReport = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const url = `${API_BASE_URL}/watchtime?${params.toString()}`;
      const response = await axios.get(url);
      const formattedData: WatchtimeRow[] = response.data.map((item: any) => ({
        ...item,
        id: item.user_id,
        total_watch_minutes: Number(
          (
            (item.total_watched_minutes_q1 || 0) +
            (item.total_watched_lesson_duration_in_minutes || 0)
          ).toFixed(2)
        ),
      }));
      setAllRows(formattedData);
    } catch (err) {
      console.error("Error fetching watch time data:", err);
      setError("Failed to load watchtime data.");
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, startDate, endDate]);

  useEffect(() => {
    fetchWatchtimeReport();
  }, [fetchWatchtimeReport]);

  const filteredData = useMemo(() => {
    if (columnFilters.length === 0) return allRows;

    return allRows.filter((row) => {
      return columnFilters.every((filter) => {
        const value = row[filter.id as keyof WatchtimeRow];
        if (!value) return false;

        if (filter.id === "email") {
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
      <Header onRefresh={fetchWatchtimeReport} isLoading={isLoading} />
      <DataSummary data={filteredData} />

      <Card>
        <div className="p-4">
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Filter emails..."
                  value={
                    (columnFilters.find((f) => f.id === "email")
                      ?.value as string) || ""
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value) {
                      setColumnFilters([
                        ...columnFilters.filter((f) => f.id !== "email"),
                        { id: "email", value },
                      ]);
                    } else {
                      setColumnFilters(
                        columnFilters.filter((f) => f.id !== "email")
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
                        <p className="text-sm font-medium mb-1">User Type</p>
                        <select
                          className="w-full p-2 rounded-md border text-sm"
                          value={
                            (columnFilters.find((f) => f.id === "user_type")
                              ?.value as string) || ""
                          }
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value) {
                              setColumnFilters([
                                ...columnFilters.filter(
                                  (f) => f.id !== "user_type"
                                ),
                                { id: "user_type", value },
                              ]);
                            } else {
                              setColumnFilters(
                                columnFilters.filter(
                                  (f) => f.id !== "user_type"
                                )
                              );
                            }
                          }}
                        >
                          <option value="">All</option>
                          <option value="Student">Student</option>
                          <option value="Teacher">Teacher</option>
                        </select>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-1">Onboarding</p>
                        <select
                          className="w-full p-2 rounded-md border text-sm"
                          value={
                            (columnFilters.find((f) => f.id === "user_join")
                              ?.value as string) || ""
                          }
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value) {
                              setColumnFilters([
                                ...columnFilters.filter(
                                  (f) => f.id !== "user_join"
                                ),
                                { id: "user_join", value },
                              ]);
                            } else {
                              setColumnFilters(
                                columnFilters.filter(
                                  (f) => f.id !== "user_join"
                                )
                              );
                            }
                          }}
                        >
                          <option value="">All</option>
                          <option value="Manual">Manual</option>
                          <option value="Self">Self</option>
                        </select>
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
                      {filter.id === "email"
                        ? "Email"
                        : filter.id === "user_type"
                        ? "User Type"
                        : filter.id === "user_join"
                        ? "Onboarding"
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

          <StatusAndOnboardingLegend />
          <DataTable
            columns={columns}
            data={filteredData}
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

export default DataTableWatchtime;
