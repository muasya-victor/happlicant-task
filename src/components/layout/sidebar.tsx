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

  // Correct way to access the store
  const { isSidebarOpen, closeSidebar } = useAuthStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const navItems = [
    { name: "Companies", href: "/dashboard/companies", icon: Building2 },
    { name: "Jobs", href: "/dashboard/jobs", icon: Briefcase },
  ];

  if (!isMounted) {
    return (
      <aside className="h-full border-r border-gray-200 bg-white">
        <div className="flex h-16 items-center justify-center border-b border-gray-100">
          <span className="text-lg font-bold">Happlicant</span>
        </div>
      </aside>
    );
  }

  const handleLinkClick = () => {
    // Close sidebar on mobile when a link is clicked
    if (window.innerWidth < 768) {
      closeSidebar();
    }
  };

  return (
    <aside className="h-full border-r border-gray-200 bg-white">
      <nav className="mt-4 flex w-full flex-col items-center justify-center space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const currentPath = pathname?.split("?")[0] ?? "";
          const isActive =
            item.href === "/dashboard"
              ? currentPath === item.href
              : currentPath.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleLinkClick}
              className={cn(
                "flex w-[90%] items-center justify-center gap-3 rounded-md px-6 py-2.5 text-center text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-100 text-gray-600"
                  : "text-gray-700 hover:bg-gray-50 hover:text-black",
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
