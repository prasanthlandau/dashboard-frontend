import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AppProvider } from "@/components/app-context"; // Use the new AppProvider

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
        
          <ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange >
  <AppProvider>
    <div className="flex min-h-screen w-full bg-muted/40">
      <div className="flex-1 flex flex-col">
          {children}
      </div>
    </div>
  </AppProvider>
</ThemeProvider>

        
      </body>
    </html>
  );
}
