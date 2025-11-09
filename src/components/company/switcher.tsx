"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Company } from "@/types/company";

export default function CompanySwitcher() {
  const router = useRouter();
  const {
    user,
    companies,
    currentCompany,
    setCurrentCompany,
    refetchCompanies,
    loading,
  } = useAuthStore();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchCompanies = async () => {
      if (open && user) {
        await refetchCompanies();

        if (!currentCompany && companies.length > 0) {
          setCurrentCompany(companies[0] ?? null);
        }
      }
    };

    void fetchCompanies();
  }, [
    open,
    user,
    refetchCompanies,
    currentCompany,
    setCurrentCompany,
    companies.length,
  ]);

  const handleSelect = (companyId: string) => {
    const selected = companies.find((c: Company) => c.id === companyId);
    if (selected) setCurrentCompany(selected);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="inline-flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-none hover:bg-gray-50">
        {currentCompany ? currentCompany.name : "Select Company"}
        <ChevronDown className="ml-2 h-4 w-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56">
        {loading.companies && (
          <DropdownMenuItem className="cursor-default text-gray-500">
            Loading...
          </DropdownMenuItem>
        )}

        {!loading.companies && companies.length === 0 && (
          <DropdownMenuItem className="cursor-default text-gray-500">
            No companies available
          </DropdownMenuItem>
        )}

        {!loading.companies &&
          companies.map((company: Company) => (
            <DropdownMenuItem
              key={company.id}
              onClick={() => handleSelect(company.id)}
              className={`${
                currentCompany?.id === company.id
                  ? "bg-gray-500 text-white"
                  : ""
              }`}
            >
              {company.name}
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
