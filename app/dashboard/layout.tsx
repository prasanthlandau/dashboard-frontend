"use client";

import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiLoader } from "react-icons/fi";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const loggedIn = sessionStorage.getItem("isLoggedIn") === "true";
    if (!loggedIn) {
      router.push("/login");
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <FiLoader className="animate-spin h-6 w-6 text-primary" />
        <p className="ml-4 text-muted-foreground">Verifying session...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-muted/40">
      <Sidebar />
      <div className="flex flex-col flex-1 min-h-0">
        <main className="flex-1 overflow-hidden p-4 sm:px-6 sm:py-0">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
