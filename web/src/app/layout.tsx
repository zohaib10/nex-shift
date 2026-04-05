import type { Metadata } from "next";
import { Geist, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { QueryProvider } from "@/components/QueryProvider";
import { GlobalAuthListener } from "@/components/GlobalAuthListener";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NexShift — Healthcare Workforce, Reimagined",
  description: "NexShift brings scheduling, workforce management, and staff coordination into one fluid platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${plusJakartaSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-plus bg-bg text-tx transition-colors duration-300">
        <ThemeProvider>
          <QueryProvider>
            <GlobalAuthListener />
            {children}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
