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
import { useRouter } from "next/navigation";

export default function TopNavbar() {
  const router = useRouter();
  const toggleSidebar = useAuthStore((state) => state.toggleSidebar);
  const currentCompany = useAuthStore((state) => state.currentCompany);
  const refetchCompanies = useAuthStore((state) => state.refetchCompanies);
  const logout = useAuthStore((state) => state.logout);
  const isSidebarOpen = useAuthStore((state) => state.isSidebarOpen);


  useEffect(() => {
    if (!currentCompany) {
      refetchCompanies();
    }
  }, [currentCompany, refetchCompanies]);

  const handleLogout = () => {
    logout(); 
    router.push("/");
  };

  return (
    <header className="flex flex-wrap items-center justify-between border-b border-gray-200 bg-white px-4 py-2 md:px-6">
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

        <div className="hidden items-center gap-4 md:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentCompany?.logo_url ?? ""} />
                  <AvatarFallback>
                    {currentCompany?.name?.[0] ?? "C"}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => console.log("Profile clicked")}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
