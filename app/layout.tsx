import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { AppProvider } from "@/components/app-context"; // Use the new AppProvider
import Footer from '../components/footer'

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
        <AppProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange >
            <div className="flex min-h-screen w-full bg-muted/40">
              <Sidebar />
              <div className="flex-1 flex flex-col">
                <main className="flex-1 p-4 sm:p-6">
                  {children}
                </main>
                <Footer />
              </div>
            </div>
        < /ThemeProvider>
        </AppProvider>
      </body>
    </html>
  );
}
