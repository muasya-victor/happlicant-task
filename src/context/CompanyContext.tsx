"use client";

import React, { createContext, useContext, useMemo, useCallback } from "react";
import type { ReactNode } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useRoles } from "@/hooks/useRoles";
import type { Company } from "@/types/company";
import type { AppError } from "@/types/user";

interface CompanyContextType {
  companies: Company[];
  currentCompany: Company | null;
  setCurrentCompany: (company: Company | null) => Promise<void>;
  canSwitchToCompany: (companyId: string) => boolean;
  loading: boolean;
  error: AppError | null;
  refetchCompanies: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider = ({ children }: { children: ReactNode }) => {
  const {
    companies,
    currentCompany,
    switchCompany,
    refetchAllData,
    loading: rolesLoading,
    errors,
  } = useRoles();

  const { setCurrentCompany: setStoreCurrentCompany } = useAuthStore();

  const canSwitchToCompany = useCallback(
    (companyId: string): boolean => companies.some((c) => c.id === companyId),
    [companies],
  );

  const handleSetCurrentCompany = useCallback(
    async (company: Company | null) => {
      if (!company) {
        setStoreCurrentCompany(null);
        return;
      }

      const allowed = await switchCompany(company.id);
      if (!allowed) {
        throw new Error("Not authorized to switch to this company");
      }
    },
    [switchCompany, setStoreCurrentCompany],
  );

  const refetchCompanies = useCallback(async () => {
    await refetchAllData();
  }, [refetchAllData]);

  const value = useMemo<CompanyContextType>(
    () => ({
      companies,
      currentCompany,
      setCurrentCompany: handleSetCurrentCompany,
      canSwitchToCompany,
      loading: rolesLoading,
      error: errors?.companies || null,
      refetchCompanies,
    }),
    [
      companies,
      currentCompany,
      handleSetCurrentCompany,
      canSwitchToCompany,
      rolesLoading,
      errors?.companies,
      refetchCompanies,
    ],
  );

  return (
    <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
};
