"use client";
import { useState, useEffect } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
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

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

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
  2: "NC",
  3: "REB",
  4: "DRC",
  5: "YOUTH",
};

export default function TestAccountsTable() {
  const [accounts, setAccounts] = useState<TestAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Create form state
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createName, setCreateName] = useState("");
  const [createRole, setCreateRole] = useState("student");
  const [createCurriculum, setCreateCurriculum] = useState("1");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Search state
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResult, setSearchResult] = useState<SearchedUser | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    try {
      setLoading(true);
      const res = await axios.get<TestAccount[]>(`${API_URL}/api/test-accounts`);
      setAccounts(res.data);
    } catch {
      setFetchError("Failed to load test accounts");
    } finally {
      setLoading(false);
    }
  }

  async function handleUnmark(account: TestAccount) {
    try {
      await axios.patch(`${API_URL}/api/test-accounts/${account.id}`, {
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
    setCreateLoading(true);
    try {
      const res = await axios.post<TestAccount>(`${API_URL}/api/test-accounts`, {
        email: createEmail,
        password: createPassword,
        name: createName,
        role: createRole,
        curriculum: Number(createCurriculum),
      });
      setAccounts((prev) => [res.data, ...prev]);
      setCreateEmail("");
      setCreatePassword("");
      setCreateName("");
      setCreateRole("student");
      setCreateCurriculum("1");
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
        `${API_URL}/api/test-accounts/search?email=${encodeURIComponent(searchEmail)}`
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
      await axios.patch(`${API_URL}/api/test-accounts/${user.id}`, {
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
      cell: ({ row }) => (
        <span className="capitalize">{String(row.original.role ?? "-")}</span>
      ),
    },
    {
      accessorKey: "curriculum_id",
      header: "Curriculum",
      cell: ({ row }) => (
        <span>
          {row.original.curriculum_id != null
            ? curriculumLabel[row.original.curriculum_id] ?? String(row.original.curriculum_id)
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
              Unmark
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Convert to regular account?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to convert{" "}
                <strong>{String(row.original.name ?? row.original.email)}</strong> back to a
                regular account? They will appear in all reports again.
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
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-6 space-y-10">
      {/* Section 1: Test Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Test Accounts</CardTitle>
        </CardHeader>
        <CardContent>
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
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center text-muted-foreground">
                      No test accounts found.
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Section 2: Create Test Account */}
      <Card>
        <CardHeader>
          <CardTitle>Create Test Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4 max-w-md">
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
              <Input
                type="password"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                placeholder="Password"
                required
              />
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
              <label className="block text-sm font-medium mb-1">Curriculum</label>
              <select
                value={createCurriculum}
                onChange={(e) => setCreateCurriculum(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              >
                <option value="1">IGCSE</option>
                <option value="2">NC</option>
                <option value="3">REB</option>
                <option value="4">DRC</option>
                <option value="5">YOUTH</option>
              </select>
            </div>
            {createError && (
              <p className="text-destructive text-sm">{createError}</p>
            )}
            <Button type="submit" disabled={createLoading}>
              {createLoading ? "Creating..." : "Create Test Account"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Section 3: Mark Existing User as Test Account */}
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
            <Button onClick={handleSearch} disabled={searchLoading || !searchEmail}>
              {searchLoading ? "Searching..." : "Search"}
            </Button>
          </div>
          {searchError && (
            <p className="text-muted-foreground text-sm">{searchError}</p>
          )}
          {searchResult && (
            <div className="border rounded-md p-4 max-w-md space-y-2">
              <p className="font-medium">{String(searchResult.name)}</p>
              <p className="text-sm text-muted-foreground">{String(searchResult.email)}</p>
              <p className="text-sm capitalize">Role: {String(searchResult.role)}</p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm">Mark as Test Account</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Mark as test account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to mark{" "}
                      <strong>{String(searchResult.name)}</strong> as a test account? They will
                      be excluded from all reports.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleMarkAsTest(searchResult!)}>
                      Mark as Test Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
