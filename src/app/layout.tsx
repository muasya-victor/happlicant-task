import Sidebar from "@/components/layout/sidebar";
import TopNavbar from "@/components/layout/top-nav";
import { ToastProvider } from "@/providers/toast-provider";
import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

export const metadata: Metadata = {
  title: "Happlicant Task",
  description: "Happlicant Task",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body className="overflow-x-auto">
        <ToastProvider/>
        <div className="h-screen w-screen bg-gray-50">{children}</div>
      </body>
    </html>
  );
}
