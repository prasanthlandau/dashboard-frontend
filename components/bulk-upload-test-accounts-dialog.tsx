"use client";
import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

type BulkMarkStatus = "marked" | "already_test_account" | "not_found";

interface BulkMarkResult {
  email: string;
  status: BulkMarkStatus;
  id?: string;
  name?: string;
}

const statusLabel: Record<BulkMarkStatus, string> = {
  marked: "Marked",
  already_test_account: "Already test account",
  not_found: "Not found",
};

const statusClass: Record<BulkMarkStatus, string> = {
  marked: "bg-green-100 text-green-800",
  already_test_account: "bg-gray-100 text-gray-800",
  not_found: "bg-red-100 text-red-800",
};

function parseEmails(text: string): string[] {
  const seen = new Set<string>();
  const emails: string[] = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const email = rawLine.trim();
    if (!email) continue;
    const key = email.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    emails.push(email);
  }
  return emails;
}

function downloadSampleCsv() {
  const content = "user1@example.com\nuser2@example.com\n";
  const blob = new Blob([content], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "test-accounts-sample.csv";
  a.click();
  URL.revokeObjectURL(url);
}

interface BulkUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export default function BulkUploadDialog({
  open,
  onOpenChange,
  onComplete,
}: BulkUploadDialogProps) {
  const [emails, setEmails] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [results, setResults] = useState<BulkMarkResult[] | null>(null);

  function reset() {
    setEmails([]);
    setFileName("");
    setParseError(null);
    setUploadError(null);
    setResults(null);
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      reset();
      onComplete();
    }
    onOpenChange(next);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setParseError(null);
    setResults(null);
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseEmails(String(reader.result ?? ""));
      if (parsed.length === 0) {
        setParseError("No valid emails found in this file");
      }
      setEmails(parsed);
    };
    reader.readAsText(file);
  }

  async function handleUpload() {
    setUploading(true);
    setUploadError(null);
    try {
      const res = await axios.post<{ results: BulkMarkResult[] }>(
        `${API_BASE_URL}/test-accounts/bulk-mark`,
        { emails },
      );
      setResults(res.data.results);
    } catch {
      setUploadError("Bulk upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  const summary = results
    ? {
        marked: results.filter((r) => r.status === "marked").length,
        already: results.filter((r) => r.status === "already_test_account")
          .length,
        notFound: results.filter((r) => r.status === "not_found").length,
      }
    : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Upload Test Accounts</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <button
            type="button"
            onClick={downloadSampleCsv}
            className="text-sm text-primary underline"
          >
            Download sample CSV
          </button>

          <div>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="text-sm"
            />
            {fileName && (
              <p className="text-sm text-muted-foreground mt-1">
                {fileName} — {emails.length} email(s) found
              </p>
            )}
            {parseError && (
              <p className="text-destructive text-sm mt-1">{parseError}</p>
            )}
          </div>

          {uploadError && (
            <p className="text-destructive text-sm">{uploadError}</p>
          )}

          {!results && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={emails.length === 0 || uploading}>
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Mark {emails.length} email(s) as test accounts?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will check {emails.length} email(s) against existing
                    users and mark any matches as test accounts. Emails that
                    don&apos;t match an existing user will be skipped.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleUpload}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {summary && (
            <div className="space-y-3">
              <p className="text-sm font-medium">
                {summary.marked} marked, {summary.already} already test
                accounts, {summary.notFound} not found
              </p>
              <div className="border rounded-md max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-background">
                    <tr>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results!.map((r) => (
                      <tr key={r.email} className="border-t">
                        <td className="p-2">{r.email}</td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${statusClass[r.status]}`}
                          >
                            {statusLabel[r.status]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
