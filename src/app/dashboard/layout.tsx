"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import TopNavbar from "@/components/layout/top-nav";
import { useAuthStore } from "@/store/auth-store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const isSidebarOpen = useAuthStore((state) => state.isSidebarOpen);
  const closeSidebar = useAuthStore((state) => state.closeSidebar);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="flex h-screen w-screen bg-gray-50">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNavbar />
        <main className="flex flex-1">
          {/* Sidebar - Fixed on mobile, static on desktop */}
          <div
            className={`fixed inset-y-0 left-0 z-40 h-full w-56 transform border-none bg-white transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 md:transform-none`}
          >
            <Sidebar />
          </div>
          <div className="flex-1 overflow-auto p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
