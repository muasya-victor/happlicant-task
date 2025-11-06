"use client";

import { useCompany } from "@/context/CompanyContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Building } from "lucide-react";

export const CompanySwitcherSkeleton = () => (
  <div className="w-[240px]">
    <Skeleton className="h-10 w-full" />
  </div>
);

const CompanySwitcher = () => {
  const { companies, currentCompany, setCurrentCompany, loading, error } =
    useCompany();

  if (loading) {
    return <CompanySwitcherSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="w-[240px]">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load companies</AlertDescription>
      </Alert>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="text-muted-foreground flex w-[240px] items-center gap-2 px-3 py-2 text-sm">
        <Building className="h-4 w-4" />
        No companies
      </div>
    );
  }

  return (
    <Select
      value={currentCompany?.id || ""}
      onValueChange={(value) => {
        const selected = companies.find((c) => c.id === value);
        if (selected) {
          setCurrentCompany(selected);
        }
      }}
    >
      <SelectTrigger className="w-[240px]">
        <SelectValue placeholder="Select a company" />
      </SelectTrigger>

      <SelectContent>
        {companies.map((company) => (
          <SelectItem key={company.id} value={company.id}>
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              {company.name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CompanySwitcher;
