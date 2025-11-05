import { useCallback } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useRoles } from "./useRoles";

export const useCacheInvalidation = () => {
  const { refetchAllData } = useRoles();
  const { setCompanies, setCompanyAdmins, setAgents, setJobSeeker } =
    useAuthStore();

  const invalidateCompanyData = useCallback(
    async (companyId?: string) => {
      await refetchAllData();
    },
    [refetchAllData],
  );

  const invalidateOnMutation = useCallback(
    async (mutationPromise: Promise<any>) => {
      try {
        const result = await mutationPromise;
        await invalidateCompanyData();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [invalidateCompanyData],
  );

  const clearCompanyData = useCallback(() => {
    setCompanies([]);
    setCompanyAdmins([]);
    setAgents([]);
    setJobSeeker(null);
  }, [setCompanies, setCompanyAdmins, setAgents, setJobSeeker]);

  return {
    invalidateCompanyData,
    invalidateOnMutation,
    clearCompanyData,
    refetchAllData,
  };
};
