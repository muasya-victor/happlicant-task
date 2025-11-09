"use client";

import { useAuthStore } from "@/store/auth-store";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Building2, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  const isSidebarOpen = useAuthStore((state) => {
    if (typeof window === "undefined") return true;
    return state.isSidebarOpen;
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Companies", href: "/dashboard/companies", icon: Building2 },
    { name: "Jobs", href: "/dashboard/jobs", icon: Briefcase },
  ];

  if (!isMounted) {
    return (
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-64 transform border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out",
          "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex h-16 items-center justify-center border-b border-gray-100">
          <span className="text-lg font-bold">Happlicant</span>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        "z-40 h-full w-64 transform border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        "md:translate-x-0",
      )}
    >
      <nav className="mt-4 flex flex-col space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-100 text-blue-600"
                  : "text-gray-700 hover:bg-gray-50 hover:text-blue-600",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
