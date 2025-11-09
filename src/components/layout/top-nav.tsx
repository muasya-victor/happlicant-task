"use client";

import { useAuthStore } from "@/store/auth-store";
import { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Menu, ChevronDown } from "lucide-react";
import CompanySwitcher from "@/components/company/switcher";

export default function TopNavbar() {
  const isSidebarOpen = useAuthStore((state) => state.isSidebarOpen);
  const toggleSidebar = useAuthStore((state) => state.toggleSidebar);
  const currentCompany = useAuthStore((state) => state.currentCompany);
  const refetchCompanies = useAuthStore((state) => state.refetchCompanies);

  useEffect(() => {
    if (!currentCompany) {
      refetchCompanies();
    }
  }, [currentCompany, refetchCompanies]);

  return (
    <header className="flex items-center justify-between flex-wrap border-b border-gray-200 bg-white px-4 py-2 md:px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-6 w-6" />
        </Button>

        <div className="hidden text-xl font-bold md:flex">Happlicant</div>
      </div>

      <div className="flex items-center gap-4">
        <CompanySwitcher />

        <div className="hidden md:flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentCompany?.logo_url || ""} />
                  <AvatarFallback>
                    {currentCompany?.name?.[0] || "C"}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => console.log("Profile clicked")}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log("Logout clicked")}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      
    </header>
  );
}
