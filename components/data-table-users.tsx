"use client";
import { useState, useEffect, useMemo, JSX, useCallback } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  OnChangeFn,
} from "@tanstack/react-table";
import { FiCheck, FiX, FiUser, FiUsers, FiUserCheck } from "react-icons/fi";
import { FiFilter, FiColumns } from "react-icons/fi";
import UserDetailsDialog from "./user-details";
import Header from "./header";
import axios from "axios";
import dayjs from "dayjs";
import { useApp } from "./app-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

interface UserRow {
  id: string;
  email: string;
  name: string;
  user_type: "Student" | "Teacher";
  status: "Active" | "Not verified";
  created_at: string;
  curriculum: string;
  user_join: "Manual" | "Self";
}

const statusIconMap: Record<UserRow["status"], JSX.Element> = {
  Active: <FiCheck className="text-green-500" />,
  "Not verified": <FiX className="text-orange-500" />,
};

const onboardingIconMap: Record<UserRow["user_join"], JSX.Element> = {
  Manual: <FiUser className="text-blue-500" />,
  Self: <FiUser className="text-orange-500" />,
};

const userTypeIconMap: Record<UserRow["user_type"], JSX.Element> = {
  Student: <FiUsers className="text-green-500" />,
  Teacher: <FiUserCheck className="text-blue-500" />,
};

const StatusAndOnboardingLegend = () => (
  <div className="flex items-center gap-x-6 gap-y-2 mb-4 flex-wrap p-4 bg-card rounded-lg border">
    <div className="flex items-center gap-2 text-sm">
      <FiCheck className="h-4 w-4 text-green-500" />
      <span>Active</span>
    </div>
    <div className="flex items-center gap-2 text-sm">
      <FiX className="h-4 w-4 text-orange-500" />
      <span>Not verified</span>
    </div>
    <div className="flex items-center gap-2 text-sm">
      <FiUser className="h-4 w-4 text-blue-500" />
      <span>Manual Onboard</span>
    </div>
    <div className="flex items-center gap-2 text-sm">
      <FiUser className="h-4 w-4 text-orange-500" />
      <span>Self Onboard</span>
    </div>
    <div className="flex items-center gap-2 text-sm">
      <FiUsers className="h-4 w-4 text-green-500" />
      <span>Student</span>
    </div>
    <div className="flex items-center gap-2 text-sm">
      <FiUserCheck className="h-4 w-4 text-blue-500" />
      <span>Teacher</span>
    </div>
  </div>
);

const DataSummary = ({ data }: { data: UserRow[] }) => {
  const stats = useMemo(
    () => ({
      totalUsers: data.length,
      students: data.filter((user) => user.user_type === "Student").length,
      teachers: data.filter((user) => user.user_type === "Teacher").length,
      activeUsers: data.filter((user) => user.status === "Active").length,
      pendingUsers: data.filter((user) => user.status === "Not verified")
        .length,
      manualUsers: data.filter((user) => user.user_join === "Manual").length,
    }),
    [data]
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      <MetricCard title="Total Users" value={stats.totalUsers} />
      <MetricCard title="Students" value={stats.students} />
      <MetricCard title="Teachers" value={stats.teachers} />
      <MetricCard title="Active Users" value={stats.activeUsers} />
      <MetricCard title="Manual Onboard" value={stats.manualUsers} />
      <MetricCard title="Not Verified" value={stats.pendingUsers} />
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

const DataTableUsers = () => {
  const [allRows, setAllRows] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const { startDate: globalStartDate, endDate: globalEndDate } = useApp();
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

  const columns: ColumnDef<UserRow>[] = [
    {
      accessorKey: "email",
      header: "Email",
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "name",
      header: "Name",
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
      accessorKey: "status",
      header: "Status",
      enableSorting: true,
      enableHiding: true,
      filterFn: "equals",
      cell: ({ row }) => {
        const statusValue = row.original.status;
        const icon = statusIconMap[statusValue];
        return (
          <TooltipProvider>
            <ShadcnTooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center">{icon}</div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{statusValue}</p>
              </TooltipContent>
            </ShadcnTooltip>
          </TooltipProvider>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Join Date",
      enableSorting: true,
      enableHiding: true,
      sortingFn: "datetime",
      cell: ({ row }) => {
        const value = row.original.created_at;
        return <span>{value ? dayjs(value).format("DD/MM/YYYY") : "N/A"}</span>;
      },
    },
    {
      accessorKey: "curriculum",
      header: "Curriculum",
      enableSorting: true,
      enableHiding: true,
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
      id: "action",
      header: "Action",
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <Button onClick={() => handleViewDetails(row.original.id)} size="sm">
            View
          </Button>
        );
      },
    },
  ];

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        startDate: globalStartDate ?? "",
        endDate: globalEndDate ?? "",
      });
      const url = `${API_BASE_URL}/users?${params.toString()}`;

      const response = await axios.get(url);
      if (response.data.success) {
        const formattedData = response.data.users.map((user: any) => ({
          ...user,
          id: user.id.toString(),
        }));
        setAllRows(formattedData);
      } else {
        throw new Error(response.data.error || "Failed to fetch users");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load user data.");
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, globalStartDate, globalEndDate]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleViewDetails = (userId: string) => {
    setSelectedUserId(userId);
    setIsDialogOpen(true);
  };

  const filteredData = useMemo(() => {
    if (columnFilters.length === 0) return allRows;

    return allRows.filter((row) => {
      return columnFilters.every((filter) => {
        const value = row[filter.id as keyof UserRow];
        if (!value) return false;

        if (
          filter.id === "email" ||
          filter.id === "name" ||
          filter.id === "curriculum"
        ) {
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
      <Header onRefresh={fetchUsers} isLoading={isLoading} />
      <StatusAndOnboardingLegend />
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
                        <p className="text-sm font-medium mb-1">Status</p>
                        <select
                          className="w-full p-2 rounded-md border text-sm"
                          value={
                            (columnFilters.find((f) => f.id === "status")
                              ?.value as string) || ""
                          }
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value) {
                              setColumnFilters([
                                ...columnFilters.filter(
                                  (f) => f.id !== "status"
                                ),
                                { id: "status", value },
                              ]);
                            } else {
                              setColumnFilters(
                                columnFilters.filter((f) => f.id !== "status")
                              );
                            }
                          }}
                        >
                          <option value="">All</option>
                          <option value="Active">Active</option>
                          <option value="Not verified">Not verified</option>
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
                      if (column.id === "action") return null;

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
                        : filter.id === "status"
                        ? "Status"
                        : filter.id === "user_join"
                        ? "Onboarding"
                        : filter.id === "name"
                        ? "Name"
                        : filter.id === "curriculum"
                        ? "Curriculum"
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

      {isDialogOpen && (
        <UserDetailsDialog
          open={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          userId={selectedUserId}
        />
      )}
    </div>
  );
};

export default DataTableUsers;
