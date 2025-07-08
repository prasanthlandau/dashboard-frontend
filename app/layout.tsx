import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/sidebar";
import { CurriculumProvider } from "@/components/curriculum-context"; // Import the provider

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aspire Dashboard",
  description: "Aspire Dashboard application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>
        {/* Wrap the entire application with the CurriculumProvider */}
        <CurriculumProvider>
          <main className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar />
            {/* Main content area that grows to fill available space */}
            <div className="flex-1 p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </CurriculumProvider>
      </body>
    </html>
  );
}
