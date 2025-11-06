// hooks/useRoles.ts
import { useAuth } from "./useAuth";
import { useEffect } from "react";
import client from "@/api/client";
import { useAuthStore } from "@/store/auth-store";

export const useRoles = () => {
  const { profile, user } = useAuth();

  // ✅ Read Zustand state using individual stable selectors
  const companies = useAuthStore((s) => s.companies);
  const companyAdmins = useAuthStore((s) => s.companyAdmins);
  const agents = useAuthStore((s) => s.agents);
  const jobSeeker = useAuthStore((s) => s.jobSeeker);
  const currentCompany = useAuthStore((s) => s.currentCompany);
  const jobs = useAuthStore((s) => s.jobs);
  const loading = useAuthStore((s) => s.loading);
  const errors = useAuthStore((s) => s.errors);

  // ✅ Stable Zustand actions
  const setLoading = useAuthStore((s) => s.setLoading);
  const setError = useAuthStore((s) => s.setError);
  const setCompanyAdmins = useAuthStore((s) => s.setCompanyAdmins);
  const setCompanies = useAuthStore((s) => s.setCompanies);
  const setAgents = useAuthStore((s) => s.setAgents);
  const setJobSeeker = useAuthStore((s) => s.setJobSeeker);
  const setJobs = useAuthStore((s) => s.setJobs);
  const setCurrentCompany = useAuthStore((s) => s.setCurrentCompany);

  // ✅ Fetch user companies, roles, etc.
  useEffect(() => {
    if (profile && user) {
      fetchUserData();
    } else {
      setLoading("companies", false);
      setLoading("jobs", false);
    }
  }, [profile, user]);

  // ✅ Fetch jobs on company change
  useEffect(() => {
    if (currentCompany?.id) {
      fetchJobs(currentCompany.id);
    } else {
      setJobs([]);
    }
  }, [currentCompany?.id]);

  const fetchUserData = async () => {
    if (!user?.id) return;
    try {
      setLoading("companies", true);
      setError("companies", null);

      switch (profile?.user_type) {
        case "company_admin": {
          const { data: adminData, error: adminError } = await client
            .from("company_admins")
            .select("*")
            .eq("user_id", user.id);
          if (adminError) throw adminError;

          setCompanyAdmins(adminData || []);

          if (adminData?.length > 0) {
            const { data: companyData, error: companyError } = await client
              .from("companies")
              .select("*")
              .in(
                "id",
                adminData.map((a) => a.company_id),
              );
            if (companyError) throw companyError;

            setCompanies(companyData || []);

            const lastId = localStorage.getItem("lastSelectedCompany");
            const lastCompany = companyData?.find((c) => c.id === lastId);
            if (lastCompany) {
              setCurrentCompany(lastCompany);
            }
          }
          break;
        }

        case "agent": {
          const { data: agentData, error: agentError } = await client
            .from("agents")
            .select("*")
            .eq("user_id", user.id);
          if (agentError) throw agentError;

          setAgents(agentData || []);

          if (agentData?.length > 0) {
            const { data: companyData, error: companyError } = await client
              .from("companies")
              .select("*")
              .in(
                "id",
                agentData.map((a) => a.company_id),
              );
            if (companyError) throw companyError;

            setCompanies(companyData || []);

            const lastId = localStorage.getItem("lastSelectedCompany");
            const lastCompany = companyData?.find((c) => c.id === lastId);
            if (lastCompany) {
              setCurrentCompany(lastCompany);
            }
          }
          break;
        }

        case "job_seeker": {
          const { data, error } = await client
            .from("job_seekers")
            .select("*")
            .eq("user_id", user.id)
            .single();
          if (error) throw error;
          setJobSeeker(data);
          break;
        }
      }
    } catch (error) {
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

  const fetchJobs = async (companyId: string) => {
    try {
      setLoading("jobs", true);
      setError("jobs", null);

      const { data, error } = await client
        .from("jobs")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      setError("jobs", {
        message:
          error instanceof Error ? error.message : "Failed to fetch jobs",
        code: "JOBS_FETCH_ERROR",
        timestamp: Date.now(),
      });
      setJobs([]);
    } finally {
      setLoading("jobs", false);
    }
  };

  const refetchJobs = async () => {
    if (currentCompany?.id) {
      await fetchJobs(currentCompany.id);
    }
  };

  const switchCompany = async (companyId: string) => {
    if (profile?.user_type === "company_admin") {
      const isAuthorized = companyAdmins.some(
        (a) => a.company_id === companyId,
      );
      if (isAuthorized) {
        const company = companies.find((c) => c.id === companyId);
        if (company) setCurrentCompany(company);
        return true;
      }
    }

    if (profile?.user_type === "agent") {
      const isAuthorized = agents.some((a) => a.company_id === companyId);
      if (isAuthorized) {
        const company = companies.find((c) => c.id === companyId);
        if (company) {
          setCurrentCompany(company);
          return true;
        }
      }
    }
    return false;
  };

  const hasPermission = (permission: string, companyId?: string) => {
    if (profile?.user_type === "super_admin") return true;
    if (profile?.user_type === "company_admin" && companyId)
      return companyAdmins.some((a) => a.company_id === companyId);
    if (profile?.user_type === "agent" && companyId) {
      const agent = agents.find((a) => a.company_id === companyId);
      return agent?.permissions?.[permission] || false;
    }
    return false;
  };

  const refetchAllData = async () => {
    await fetchUserData();
    if (currentCompany?.id) await fetchJobs(currentCompany.id);
  };

  return {
    companies,
    companyAdmins,
    agents,
    jobSeeker,
    currentCompany,
    jobs,
    loading: loading.companies || loading.jobs,
    loadingStates: loading,
    errors,
    switchCompany,
    hasPermission,
    refetchAllData,
    refetchJobs,
    currentUserType: profile?.user_type,
  };
};
