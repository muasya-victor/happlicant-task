"use client";

import { useState } from "react";
import { useCompany } from "@/context/CompanyContext";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import CompanySwitcher from "@/components/company/switcher";
import { LayoutDashboard, Briefcase, Building, Menu, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current: boolean;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { currentCompany } = useCompany();
  const { profile, isLoading } = useAuth();

  const navItems: NavItem[] = [
    {
      name: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
      current: pathname === "/dashboard",
    },
    {
      name: "Jobs",
      href: "/dashboard/jobs",
      icon: Briefcase,
      current: pathname.startsWith("/dashboard/jobs"),
    },
    {
      name: "Companies",
      href: "/dashboard/companies",
      icon: Building,
      current: pathname.startsWith("/dashboard/companies"),
    },
  ];

  const NavLink = ({ item }: { item: NavItem }) => {
    const Icon = item.icon;
    return (
      <Link
        href={item.href}
        className={cn(
          "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
          "hover:bg-accent hover:text-accent-foreground",
          item.current
            ? "bg-accent text-accent-foreground shadow-sm"
            : "text-muted-foreground",
        )}
        onClick={() => setMobileSidebarOpen(false)}
      >
        <Icon
          className={cn(
            "h-4 w-4 transition-colors",
            item.current
              ? "text-primary"
              : "text-muted-foreground group-hover:text-accent-foreground",
          )}
        />
        <span>{item.name}</span>
      </Link>
    );
  };

  const UserProfile = () => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-3 p-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3 p-2">
        <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full border">
          <User className="text-primary h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-foreground truncate text-sm font-medium">
            {profile?.email || "User"}
          </p>
          <p className="text-muted-foreground text-xs capitalize">
            {profile?.user_type?.replace("_", " ") || "User"}
          </p>
        </div>
      </div>
    );
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="px-6 py-4">
        <div className="space-y-2">
          <h1 className="text-foreground text-lg font-semibold tracking-tight">
            Dashboard
          </h1>
          {currentCompany ? (
            <p className="text-muted-foreground truncate text-sm">
              {currentCompany.name}
            </p>
          ) : (
            <Skeleton className="h-4 w-24" />
          )}
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="space-y-1 p-4">
          {navItems.map((item) => (
            <NavLink key={item.name} item={item} />
          ))}
        </nav>
      </ScrollArea>

      <Separator />

      {/* User Profile */}
      <div className="p-4">
        <UserProfile />
      </div>
    </div>
  );

  const CurrentPageTitle = () => {
    const currentItem = navItems.find((item) => item.current);
    return (
      <h1 className="text-foreground text-xl font-semibold tracking-tight">
        {currentItem?.name || "Dashboard"}
      </h1>
    );
  };

  return (
    <div className="bg-background flex h-screen">
      {/* Mobile Sidebar */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="bg-card hidden w-64 flex-col border-r lg:flex">
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-background/95 border-b backdrop-blur">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="hidden sm:block">
                <CurrentPageTitle />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CompanySwitcher />
              <Badge
                variant="secondary"
                className="hidden border capitalize sm:inline-flex"
              >
                {profile?.user_type?.replace("_", " ") || "User"}
              </Badge>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Mobile page title */}
            <div className="mb-6 sm:hidden">
              <CurrentPageTitle />
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
