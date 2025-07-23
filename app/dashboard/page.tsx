"use client";

import Sidebar from "@/components/sidebar";
import Header from "@/components/header"; // Added header import
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Check for the session flag on the client side
    const loggedIn = sessionStorage.getItem("isLoggedIn") === "true";
    if (!loggedIn) {
      router.push("/login");
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  // While checking, show a loading state
  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <CircularProgress />
        <p className="ml-4">Verifying session...</p>
      </div>
    );
  }

  // If authorized, render the protected dashboard layout
  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8">{children}</main>
      </div>
    </div>
  );
}
