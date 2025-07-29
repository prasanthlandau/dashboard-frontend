"use client";
import React, { useState, useEffect, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  CheckCircle,
  Cancel,
  Person,
  School,
  AccountCircle,
} from "@mui/icons-material";
import { Tooltip } from "@mui/material";
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

const statusIconMap: Record<UserRow["status"], React.JSX.Element> = {
  Active: <CheckCircle className="text-green-500" />,
  "Not verified": <Cancel className="text-orange-500" />,
};

const onboardingIconMap: Record<UserRow["user_join"], React.JSX.Element> = {
  Manual: <Person className="text-blue-500" />,
  Self: <Person className="text-orange-500" />,
};

const userTypeIconMap: Record<UserRow["user_type"], React.JSX.Element> = {
  Student: <School className="text-green-500" />,
  Teacher: <AccountCircle className="text-blue-500" />,
};

const StatusAndOnboardingLegend = () => (
  <div className="flex items-center gap-x-6 gap-y-2 mb-4 flex-wrap p-4 bg-card rounded-lg border">
    <div className="flex items-center gap-2 text-sm">
      <CheckCircle className="h-4 w-4 text-green-500" />
      <span>Active</span>
    </div>
    <div className="flex items-center gap-2 text-sm">
      <Cancel className="h-4 w-4 text-orange-500" />
      <span>Not verified</span>
    </div>
    <div className="flex items-center gap-2 text-sm">
      <Person className="h-4 w-4 text-blue-500" />
      <span>Manual Onboard</span>
    </div>
    <div className="flex items-center gap-2 text-sm">
      <Person className="h-4 w-4 text-orange-500" />
      <span>Self Onboard</span>
    </div>
    <div className="flex items-center gap-2 text-sm">
      <School className="h-4 w-4 text-green-500" />
      <span>Student</span>
    </div>
    <div className="flex items-center gap-2 text-sm">
      <AccountCircle className="h-4 w-4 text-blue-500" />
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
  const [allRows, setAllRows] = React.useState<UserRow[]>([]);
  const [visibleRows, setVisibleRows] = React.useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [searchText, setSearchText] = React.useState("");
  const [localStartDate, setLocalStartDate] = React.useState("");
  const [localEndDate, setLocalEndDate] = React.useState("");

  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const { startDate: globalStartDate, endDate: globalEndDate } = useApp();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  const columns: ColumnDef<UserRow>[] = [
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "user_type",
      header: "User Type",
      cell: ({ row }) => {
        const userTypeValue = row.original.user_type;
        const icon = userTypeIconMap[userTypeValue];
        return (
          <TooltipProvider>
            <ShadcnTooltip>
              <TooltipTrigger asChild>
                <div>{icon}</div>
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
      cell: ({ row }) => {
        const statusValue = row.original.status;
        const icon = statusIconMap[statusValue];
        return (
          <TooltipProvider>
            <ShadcnTooltip>
              <TooltipTrigger asChild>
                <div>{icon}</div>
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
      cell: ({ row }) => {
        const value = row.original.created_at;
        return <span>{value ? dayjs(value).format("DD/MM/YYYY") : "N/A"}</span>;
      },
    },
    {
      accessorKey: "curriculum",
      header: "Curriculum",
    },
    {
      accessorKey: "user_join",
      header: "Onboarding",
      cell: ({ row }) => {
        const joinValue = row.original.user_join;
        const icon = onboardingIconMap[joinValue];
        return (
          <TooltipProvider>
            <ShadcnTooltip>
              <TooltipTrigger asChild>
                <div>{icon}</div>
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
      cell: ({ row }) => {
        return (
          <Button onClick={() => handleViewDetails(row.original.id)}>
            View
          </Button>
        );
      },
    },
  ];

  const fetchUsers = React.useCallback(async () => {
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
        setVisibleRows(formattedData);
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

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleViewDetails = (userId: string) => {
    setSelectedUserId(userId);
    setIsDialogOpen(true);
  };

  const handleFilter = () => {
    let filtered = allRows.filter((row) => {
      const emailMatch =
        !searchText ||
        (row.email ?? "").toLowerCase().includes(searchText.toLowerCase());

      let dateMatch = true;
      if (localStartDate && localEndDate && row.created_at) {
        const rowDate = dayjs(row.created_at);
        dateMatch =
          rowDate.isAfter(dayjs(localStartDate)) &&
          rowDate.isBefore(dayjs(localEndDate));
      }

      return emailMatch && dateMatch;
    });
    setVisibleRows(filtered);
  };

  const handleReset = () => {
    setSearchText("");
    setLocalStartDate("");
    setLocalEndDate("");
    setVisibleRows(allRows);
  };

  return (
    <div className="space-y-6">
      <Header onRefresh={fetchUsers} isLoading={isLoading} />
      <StatusAndOnboardingLegend />
      <DataSummary data={visibleRows} />

      <Card className="p-4 flex items-center gap-4">
        <Input
          placeholder="Search by email..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={handleFilter}>Filter</Button>
        <Button variant="outline" onClick={handleReset}>
          Reset
        </Button>
      </Card>
      <Card>
        <div className="p-4">
          <DataTable
            columns={columns}
            data={visibleRows}
            searchColumn="email"
            searchValue={searchText}
            isLoading={isLoading}
            pagination={{
              pageSize: 15,
              pageSizeOptions: [15, 25, 50],
            }}
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
