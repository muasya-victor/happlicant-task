// store/auth-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@supabase/supabase-js";
import type {
  Profile,
  AppError,
  CompanyAdmin,
  Agent,
  JobSeeker,
} from "@/types/user";

import type {
  Company

} from "@/types/company";

interface AuthState {
  user: User | null;
  profile: Profile | null;
  companies: Company[];
  companyAdmins: CompanyAdmin[];
  agents: Agent[];
  jobSeeker: JobSeeker | null;
  currentCompany: Company | null;
  loading: {
    auth: boolean;
    profile: boolean;
    companies: boolean;
  };
  errors: {
    auth: AppError | null;
    profile: AppError | null;
    companies: AppError | null;
  };

  // Actions
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setCompanies: (companies: Company[]) => void;
  setCompanyAdmins: (companyAdmins: CompanyAdmin[]) => void;
  setAgents: (agents: Agent[]) => void;
  setJobSeeker: (jobSeeker: JobSeeker | null) => void;
  setCurrentCompany: (company: Company | null) => void;
  setLoading: (key: keyof AuthState["loading"], value: boolean) => void;
  setError: (key: keyof AuthState["errors"], error: AppError | null) => void;
  clearErrors: () => void;
  refetchCompanies: () => void;
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
      loading: {
        auth: true,
        profile: true,
        companies: false,
      },
      errors: {
        auth: null,
        profile: null,
        companies: null,
      },

      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setCompanies: (companies) => {
        const state = get();
        let newCurrentCompany = state.currentCompany;

        if (
          state.currentCompany &&
          !companies.find((c) => c.id === state.currentCompany?.id)
        ) {
          newCurrentCompany = companies[0] || null;
        }

        if (!newCurrentCompany && companies.length > 0) {
          newCurrentCompany = companies[0] || null;
        }

        set({ companies, currentCompany: newCurrentCompany });
      },
      setCompanyAdmins: (companyAdmins) => set({ companyAdmins }),
      setAgents: (agents) => set({ agents }),
      setJobSeeker: (jobSeeker) => set({ jobSeeker }),
      setCurrentCompany: (company) => {
        if (company) {
          localStorage.setItem("lastSelectedCompany", company.id);
        }
        set({ currentCompany: company });
      },
      setLoading: (key, value) =>
        set((state) => ({
          loading: { ...state.loading, [key]: value },
        })),
      setError: (key, error) =>
        set((state) => ({
          errors: { ...state.errors, [key]: error },
        })),
      clearErrors: () =>
        set({
          errors: { auth: null, profile: null, companies: null },
        }),
      refetchCompanies: () => {
        set({ loading: { ...get().loading, companies: true } });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        currentCompany: state.currentCompany,
      }),
    },
  ),
);
