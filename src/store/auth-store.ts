// store/auth-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@supabase/supabase-js";
import type { Company, Job } from "@/types";
import type {
  Profile,
  AppError,
  CompanyAdmin,
  Agent,
  JobSeeker,
} from "@/types/user";
import client from "@/api/client";

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  companies: Company[];
  companyAdmins: CompanyAdmin[];
  agents: Agent[];
  jobSeeker: JobSeeker | null;
  currentCompany: Company | null;

  jobs: Job[];

  loading: {
    auth: boolean;
    profile: boolean;
    companies: boolean;
    jobs: boolean;
  };
  errors: {
    auth: AppError | null;
    profile: AppError | null;
    companies: AppError | null;
    jobs: AppError | null;
  };

  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setCompanies: (companies: Company[]) => void;
  setCompanyAdmins: (companyAdmins: CompanyAdmin[]) => void;
  setAgents: (agents: Agent[]) => void;
  setJobSeeker: (jobSeeker: JobSeeker | null) => void;
  setCurrentCompany: (company: Company | null) => void;

  setJobs: (jobs: Job[]) => void;
  addJob: (job: Job) => void;
  updateJob: (job: Job) => void;
  removeJob: (id: string) => void;
  refetchJobs: () => Promise<void>;
  refetchCompanies: () => Promise<void>; // ✅ NEW

  setLoading: (key: keyof AuthState["loading"], value: boolean) => void;
  setError: (key: keyof AuthState["errors"], error: AppError | null) => void;
  clearErrors: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      companies: [],
      companyAdmins: [],
      agents: [],
      jobSeeker: null,
      currentCompany: null,
      jobs: [],
      loading: { auth: false, profile: false, companies: false, jobs: false },
      errors: { auth: null, profile: null, companies: null, jobs: null },

      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setCompanies: (companies) => {
        const state = get();
        let current = state.currentCompany;
        if (current && !companies.find((c) => c.id === current.id)) {
          current = companies[0] || null;
        }
        set({ companies, currentCompany: current });
      },
      setCompanyAdmins: (companyAdmins) => set({ companyAdmins }),
      setAgents: (agents) => set({ agents }),
      setJobSeeker: (jobSeeker) => set({ jobSeeker }),
      setCurrentCompany: (company) => {
        if (company) localStorage.setItem("lastSelectedCompany", company.id);
        set({ currentCompany: company });
      },

      setJobs: (jobs) => set({ jobs }),
      addJob: (job) => set((state) => ({ jobs: [...state.jobs, job] })),
      updateJob: (job) =>
        set((state) => ({
          jobs: state.jobs.map((j) => (j.id === job.id ? job : j)),
        })),
      removeJob: (id) =>
        set((state) => ({ jobs: state.jobs.filter((job) => job.id !== id) })),

      setLoading: (key, value) =>
        set((state) => ({ loading: { ...state.loading, [key]: value } })),
      setError: (key, error) =>
        set((state) => ({ errors: { ...state.errors, [key]: error } })),
      clearErrors: () =>
        set({
          errors: { auth: null, profile: null, companies: null, jobs: null },
        }),

      refetchJobs: async () => {
        const state = get();
        if (!state.user?.id || !state.currentCompany?.id) return;

        const isAdminOfCurrent = state.companyAdmins.some(
          (a) => a.company_id === state.currentCompany?.id,
        );

        if (!isAdminOfCurrent) {
          set({ jobs: [] });
          return;
        }

        set((state) => ({
          loading: { ...state.loading, jobs: true },
          errors: { ...state.errors, jobs: null },
        }));

        try {
          const { data, error } = await client
            .from("jobs")
            .select("*")
            .eq("company_id", state.currentCompany.id) // ✅ only current company
            .order("created_at", { ascending: false });

          if (error) throw error;

          set({ jobs: data || [] });
        } catch (err) {
          console.error("Error refetching jobs:", err);
          set({ jobs: [] });
          set((state) => ({
            errors: {
              ...state.errors,
              jobs: {
                message:
                  err instanceof Error ? err.message : "Failed to fetch jobs",
                code: "JOBS_FETCH_ERROR",
                timestamp: Date.now(),
              },
            },
          }));
        } finally {
          set((state) => ({ loading: { ...state.loading, jobs: false } }));
        }
      },

      refetchCompanies: async () => {
        const state = get();
        if (!state.user?.id) return;

        set((state) => ({
          loading: { ...state.loading, companies: true },
          errors: { ...state.errors, companies: null },
        }));

        try {
          const { data: userCompanies, error: userError } = await client
            .from("company_admins")
            .select("company_id")
            .eq("user_id", state.user.id);

          if (userError) throw userError;

          const companyIds = userCompanies?.map((uc) => uc.company_id) || [];

          if (companyIds.length === 0) {
            set({ companies: [], currentCompany: null });
            return;
          }

          const { data, error } = await client
            .from("companies")
            .select("*")
            .in("id", companyIds);

          if (error) throw error;

          const authorizedCompanies = data || [];
          set({ companies: authorizedCompanies });

          // Update current company if needed
          const current = state.currentCompany;
          if (
            current &&
            !authorizedCompanies.find((c) => c.id === current.id)
          ) {
            set({ currentCompany: authorizedCompanies[0] || null });
          }
        } catch (err) {
          console.error("Error fetching companies:", err);
          set({ companies: [] });
          // ... error handling
        } finally {
          set((state) => ({ loading: { ...state.loading, companies: false } }));
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ currentCompany: state.currentCompany }),
    },
  ),
);
