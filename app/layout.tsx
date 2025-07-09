import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { AppProvider } from "@/components/curriculum-context"; // Renamed for clarity

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aspire Dashboard",
  description: "Executive Dashboard for Aspire",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {/* Wrap everything in the AppProvider */}
          <AppProvider>
            <div className="flex min-h-screen w-full bg-muted/40">
              <Sidebar />
              <div className="flex-1 flex flex-col">
                <main className="flex-1 p-4 sm:p-6">
                  {children}
                </main>
              </div>
            </div>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
