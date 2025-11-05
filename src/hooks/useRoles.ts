// hooks/useRoles.ts
import { useAuth } from "./useAuth";
import { useEffect } from "react";
import client from "@/api/client";
import { useAuthStore } from "@/store/auth-store";
import type { CompanyAdmin, Agent, JobSeeker } from "@/types/user";

export const useRoles = () => {
  const { profile, user } = useAuth();
  const {
    companies,
    companyAdmins,
    agents,
    jobSeeker,
    currentCompany,
    loading,
    errors,
    setCompanies,
    setCompanyAdmins,
    setAgents,
    setJobSeeker,
    setLoading,
    setError,
  } = useAuthStore();

  useEffect(() => {
    if (profile && user) {
      fetchUserData();
    } else {
      setLoading("companies", false);
    }
  }, [profile, user]);

  const fetchUserData = async () => {
    if (!user?.id) return;

    try {
      setLoading("companies", true);
      setError("companies", null);

      switch (profile?.user_type) {
        case "company_admin":
          const { data: adminData, error: adminError } = await client
            .from("company_admins")
            .select("*")
            .eq("user_id", user.id);

          if (adminError) throw adminError;
          setCompanyAdmins(adminData || []);

          if (adminData?.length) {
            const { data: companyData, error: companyError } = await client
              .from("companies")
              .select("*")
              .in(
                "id",
                adminData.map((admin) => admin.company_id),
              );

            if (companyError) throw companyError;
            setCompanies(companyData || []);

            // Restore last selected company
            const lastCompanyId = localStorage.getItem("lastSelectedCompany");
            if (lastCompanyId) {
              const lastCompany = companyData?.find(
                (c) => c.id === lastCompanyId,
              );
              if (lastCompany) {
                useAuthStore.getState().setCurrentCompany(lastCompany);
              }
            }
          }
          break;

        case "agent":
          const { data: agentData, error: agentError } = await client
            .from("agents")
            .select("*")
            .eq("user_id", user.id);

          if (agentError) throw agentError;
          setAgents(agentData || []);

          // Also fetch companies for agents
          if (agentData?.length) {
            const { data: companyData, error: companyError } = await client
              .from("companies")
              .select("*")
              .in(
                "id",
                agentData.map((agent) => agent.company_id),
              );

            if (companyError) throw companyError;
            setCompanies(companyData || []);

            const lastCompanyId = localStorage.getItem("lastSelectedCompany");
            if (lastCompanyId) {
              const lastCompany = companyData?.find(
                (c) => c.id === lastCompanyId,
              );
              if (lastCompany) {
                useAuthStore.getState().setCurrentCompany(lastCompany);
              }
            }
          }
          break;

        case "job_seeker":
          const { data: seekerData, error: seekerError } = await client
            .from("job_seekers")
            .select("*")
            .eq("user_id", user.id)
            .single();

          if (seekerError) throw seekerError;
          setJobSeeker(seekerData);
          break;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("companies", {
        message:
          error instanceof Error ? error.message : "Failed to fetch user data",
        code: "USER_DATA_FETCH_ERROR",
        timestamp: Date.now(),
      });
    } finally {
      setLoading("companies", false);
    }
  };

  const switchCompany = async (companyId: string) => {
    if (profile?.user_type === "company_admin") {
      const isAuthorized = companyAdmins.some(
        (admin) => admin.company_id === companyId,
      );

      if (isAuthorized) {
        // Optimistic update
        const company = companies.find((c) => c.id === companyId);
        if (company) {
          useAuthStore.getState().setCurrentCompany(company);
        }

        // Validate in background
        try {
          const { data } = await client
            .from("company_admins")
            .select("id")
            .eq("user_id", user?.id)
            .eq("company_id", companyId)
            .single();

          if (!data) {
            // Revert if not actually authorized
            const firstCompany = companies[0];
            useAuthStore.getState().setCurrentCompany(firstCompany || null);
            return false;
          }
        } catch (error) {
          console.error("Error validating company switch:", error);
          const firstCompany = companies[0];
          useAuthStore.getState().setCurrentCompany(firstCompany || null);
          return false;
        }

        return true;
      }
    }

    // For agents, check if they belong to the company
    if (profile?.user_type === "agent") {
      const isAuthorized = agents.some(
        (agent) => agent.company_id === companyId,
      );

      if (isAuthorized) {
        const company = companies.find((c) => c.id === companyId);
        if (company) {
          useAuthStore.getState().setCurrentCompany(company);
          return true;
        }
      }
    }

    return false;
  };

  const hasPermission = (permission: string, companyId?: string): boolean => {
    if (profile?.user_type === "super_admin") return true;

    if (profile?.user_type === "company_admin" && companyId) {
      return companyAdmins.some((admin) => admin.company_id === companyId);
    }

    if (profile?.user_type === "agent" && companyId) {
      const agent = agents.find((a) => a.company_id === companyId);
      return agent?.permissions[permission] || false;
    }

    return false;
  };

  const refetchAllData = async () => {
    await fetchUserData();
  };

  return {
    companyAdmins,
    agents,
    jobSeeker,
    companies,
    currentCompany,
    loading: loading.companies,
    loadingStates: loading,
    errors,
    switchCompany,
    hasPermission,
    refetchAllData,
    currentUserType: profile?.user_type,
  };
};
