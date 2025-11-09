import type { StateCreator } from "zustand";
import type { AuthState } from "../auth-store";
import type { Company } from "@/types/company";
import type { CompanyAdmin, Agent, AppError } from "@/types/user";
import client from "@/api/client";

export interface CompanySlice {
  companies: Company[];
  companyAdmins: CompanyAdmin[];
  agents: Agent[];
  currentCompany: Company | null;

  setCompanies: (companies: Company[]) => void;
  setCompanyAdmins: (companyAdmins: CompanyAdmin[]) => void;
  setAgents: (agents: Agent[]) => void;
  setCurrentCompany: (company: Company | null) => void;

  refetchCompanies: () => Promise<void>;
}

export const createCompanySlice: StateCreator<AuthState, [], [], CompanySlice> = (
  set,
  get,
) => ({
  companies: [],
  companyAdmins: [],
  agents: [],
  currentCompany: null,

  setCompanies: (companies) => {
    const current = get().currentCompany;
    let nextCurrent: Company | null = current ?? null;

    if (!nextCurrent || !companies.some((c) => c.id === nextCurrent?.id)) {
      nextCurrent = companies[0] || null;
    }

    set({ companies, currentCompany: nextCurrent });
  },

  setCompanyAdmins: (companyAdmins) => set({ companyAdmins }),
  setAgents: (agents) => set({ agents }),

  setCurrentCompany: (company) => {
    if (company) localStorage.setItem("lastSelectedCompany", company.id);
    set({ currentCompany: company });
  },

  refetchCompanies: async () => {
    const state = get();
    if (!state.user?.id) return;

    set((s) => ({
      loading: { ...s.loading, companies: true },
      errors: { ...s.errors, companies: null },
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

      const companies = data || [];
      set({ companies });

      const current = get().currentCompany;
      if (!current && companies.length > 0) {
        set({ currentCompany: companies[0] });
      }
    } catch (err) {
      console.error("Error fetching companies:", err);
      set({ companies: [], currentCompany: null });
    } finally {
      set((s) => ({ loading: { ...s.loading, companies: false } }));
    }
  },
});
