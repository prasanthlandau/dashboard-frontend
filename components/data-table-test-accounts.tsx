"use client";
import { useState, useEffect } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, EyeOff } from "lucide-react";
import BulkUploadDialog from "@/components/bulk-upload-test-accounts-dialog";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

interface TestAccount {
  id: string;
  email: string;
  name: string;
  role: string;
  curriculum_id: number | null;
  created_at: string;
}

interface SearchedUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

const curriculumLabel: Record<number, string> = {
  1: "IGCSE",
  2: "Azerbaijani Curriculum",
  5: "Youth Courses (AZ)",
};

export default function TestAccountsTable() {
  const [accounts, setAccounts] = useState<TestAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Create dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createName, setCreateName] = useState("");
  const [createRole, setCreateRole] = useState("student");
  const [createCurriculum, setCreateCurriculum] = useState("1");
  const [createGrade, setCreateGrade] = useState("1");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createConfirm, setCreateConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  // Search / mark state
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResult, setSearchResult] = useState<SearchedUser | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);

  // Filter + pagination state
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [curriculumFilter, setCurriculumFilter] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    try {
      setLoading(true);
      const res = await axios.get<TestAccount[]>(
        `${API_BASE_URL}/test-accounts`,
      );
      setAccounts(res.data);
    } catch {
      setFetchError("Failed to load test accounts");
    } finally {
      setLoading(false);
    }
  }

  async function handleUnmark(account: TestAccount) {
    try {
      await axios.patch(`${API_BASE_URL}/test-accounts/${account.id}`, {
        is_testaccount: false,
      });
      setAccounts((prev) => prev.filter((a) => a.id !== account.id));
    } catch {
      alert("Failed to unmark account. Please try again.");
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    if (createPassword !== createConfirm) {
      setConfirmError("Passwords do not match");
      return;
    }
    setConfirmError(null);
    setCreateLoading(true);
    try {
      const res = await axios.post<TestAccount>(
        `${API_BASE_URL}/test-accounts`,
        {
          email: createEmail,
          password: createPassword,
          name: createName,
          role: createRole,
          curriculum: Number(createCurriculum),
          grade: createRole === "student" ? Number(createGrade) : undefined,
        },
      );
      setAccounts((prev) => [res.data, ...prev]);
      setCreateEmail("");
      setCreatePassword("");
      setCreateConfirm("");
      setCreateName("");
      setCreateRole("student");
      setCreateCurriculum("1");
      setCreateGrade("1");
      setShowPassword(false);
      setShowConfirm(false);
      setConfirmError(null);
      setCreateDialogOpen(false);
    } catch (err) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Failed to create test account";
      setCreateError(message);
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleSearch() {
    setSearchError(null);
    setSearchResult(null);
    setSearchLoading(true);
    try {
      const res = await axios.get<SearchedUser>(
        `${API_BASE_URL}/test-accounts/search?email=${encodeURIComponent(searchEmail)}`,
      );
      setSearchResult(res.data);
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      if (status === 404) {
        setSearchError("No user found with that email");
      } else {
        setSearchError("Search failed. Please try again.");
      }
    } finally {
      setSearchLoading(false);
    }
  }

  async function handleMarkAsTest(user: SearchedUser) {
    try {
      await axios.patch(`${API_BASE_URL}/test-accounts/${user.id}`, {
        is_testaccount: true,
      });
      setAccounts((prev) => [
        {
          id: user.id,
          email: user.email as string,
          name: user.name as string,
          role: user.role as string,
          curriculum_id: null,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      setSearchResult(null);
      setSearchEmail("");
    } catch {
      alert("Failed to mark user as test account. Please try again.");
    }
  }

  function handleGlobalFilterChange(value: string) {
    setGlobalFilter(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }

  function handleRoleFilterChange(value: string) {
    setRoleFilter(value);
    setColumnFilters((prev) => {
      const others = prev.filter((f) => f.id !== "role");
      return value ? [...others, { id: "role", value }] : others;
    });
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }

  function handleCurriculumFilterChange(value: string) {
    setCurriculumFilter(value);
    setColumnFilters((prev) => {
      const others = prev.filter((f) => f.id !== "curriculum_id");
      return value ? [...others, { id: "curriculum_id", value }] : others;
    });
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }

  const columns: ColumnDef<TestAccount>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <span>{String(row.original.name ?? "-")}</span>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <span>{String(row.original.email)}</span>,
    },
    {
      accessorKey: "role",
      header: "Role",
      filterFn: (row, _id, filterValue) =>
        String(row.original.role).toLowerCase() ===
        String(filterValue).toLowerCase(),
      cell: ({ row }) => (
        <span className="capitalize">{String(row.original.role ?? "-")}</span>
      ),
    },
    {
      accessorKey: "curriculum_id",
      header: "Curriculum",
      filterFn: (row, _id, filterValue) => {
        const label =
          row.original.curriculum_id != null
            ? (curriculumLabel[row.original.curriculum_id] ??
              String(row.original.curriculum_id))
            : "-";
        return label === String(filterValue);
      },
      cell: ({ row }) => (
        <span>
          {row.original.curriculum_id != null
            ? (curriculumLabel[row.original.curriculum_id] ??
              String(row.original.curriculum_id))
            : "-"}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => (
        <span>
          {row.original.created_at
            ? dayjs(String(row.original.created_at)).format("YYYY-MM-DD HH:mm")
            : "-"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm">
              Remove
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Convert to regular account?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to convert{" "}
                <strong>
                  {String(row.original.name ?? row.original.email)}
                </strong>{" "}
                back to a regular account? They will appear in all reports
                again.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleUnmark(row.original)}>
                Convert
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ),
    },
  ];

  const table = useReactTable({
    data: accounts,
    columns,
    state: { globalFilter, columnFilters, pagination },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = String(filterValue).toLowerCase();
      return (
        String(row.original.name ?? "")
          .toLowerCase()
          .includes(search) ||
        String(row.original.email).toLowerCase().includes(search)
      );
    },
  });

  return (
    <div className="p-6 space-y-6">
      {/* Section 1: Mark Existing User — now at top */}
      <Card>
        <CardHeader>
          <CardTitle>Mark Existing User as Test Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 max-w-md">
            <Input
              type="email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="user@example.com"
            />
            <Button
              onClick={handleSearch}
              disabled={searchLoading || !searchEmail}
            >
              {searchLoading ? "Searching..." : "Search"}
            </Button>
            <Button variant="outline" onClick={() => setBulkDialogOpen(true)}>
              Bulk Upload
            </Button>
          </div>
          {searchError && (
            <p className="text-destructive text-sm">{searchError}</p>
          )}
          {searchResult && (
            <div className="border rounded-md p-4 max-w-md space-y-2">
              <p className="font-medium">{String(searchResult.name)}</p>
              <p className="text-sm text-muted-foreground">
                {String(searchResult.email)}
              </p>
              <p className="text-sm capitalize">
                Role: {String(searchResult.role)}
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm">Mark as Test Account</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Mark as test account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to mark{" "}
                      <strong>{String(searchResult.name)}</strong> as a test
                      account? They will be excluded from all reports.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleMarkAsTest(searchResult!)}
                    >
                      Mark as Test Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 2: Test Accounts Table with filters + pagination */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Test Accounts</CardTitle>
          <Button onClick={() => setCreateDialogOpen(true)}>
            + Create Test Account
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <Input
              placeholder="Search name or email…"
              value={globalFilter}
              onChange={(e) => handleGlobalFilterChange(e.target.value)}
              className="max-w-xs"
            />
            <select
              value={roleFilter}
              onChange={(e) => handleRoleFilterChange(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm bg-background"
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
            <select
              value={curriculumFilter}
              onChange={(e) => handleCurriculumFilterChange(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm bg-background"
            >
              <option value="">All Curriculam</option>
              <option value="IGCSE">IGCSE</option>
              <option value="Azerbaijani Curriculum">
                Azerbaijani Curriculum
              </option>
              <option value="Youth Courses (AZ)">Youth Courses (AZ)</option>
            </select>
          </div>

          {/* Table */}
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : fetchError ? (
            <p className="text-destructive text-sm">{fetchError}</p>
          ) : (
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    {hg.headers.map((header) => (
                      <TableHead key={header.id}>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="text-center text-muted-foreground"
                    >
                      No test accounts found.
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              ← Prev
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {Math.max(table.getPageCount(), 1)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next →
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Create Test Account Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Test Account</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                placeholder="test@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={createPassword}
                  onChange={(e) => {
                    setCreatePassword(e.target.value);
                    setConfirmError(null);
                  }}
                  placeholder="Password"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  value={createConfirm}
                  onChange={(e) => {
                    setCreateConfirm(e.target.value);
                    setConfirmError(null);
                  }}
                  placeholder="Confirm password"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="Full name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                value={createRole}
                onChange={(e) => setCreateRole(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Curriculum
              </label>
              <select
                value={createCurriculum}
                onChange={(e) => setCreateCurriculum(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              >
                <option value="1">IGCSE</option>
                <option value="2">Azerbaijani Curriculum</option>
                <option value="5">Youth Courses (AZ)</option>
              </select>
            </div>
            {createRole === "student" && (
              <div>
                <label className="block text-sm font-medium mb-1">Grade</label>
                <select
                  value={createGrade}
                  onChange={(e) => setCreateGrade(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                >
                  {Array.from({ length: 11 }, (_, i) => i + 1).map((g) => (
                    <option key={g} value={String(g)}>
                      Grade {g}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {confirmError && (
              <p className="text-destructive text-sm">{confirmError}</p>
            )}
            {createError && (
              <p className="text-destructive text-sm">{createError}</p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createLoading}>
                {createLoading ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <BulkUploadDialog
        open={bulkDialogOpen}
        onOpenChange={setBulkDialogOpen}
        onComplete={fetchAccounts}
      />
    </div>
  );
}
