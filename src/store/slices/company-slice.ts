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
  createCompany: (companyData: Partial<Company>) => Promise<Company>;
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

  createCompany: async (companyData: Partial<Company>) => {
    const state = get();
    if (!state.user?.id) throw new Error("User not authenticated");

    set((s) => ({
      loading: { ...s.loading, companies: true },
      errors: { ...s.errors, companies: null },
    }));

    try {
      const dbPayload = {
        p_user_id: state.user.id,
        p_user_email: state.user.email,
        p_company_name: companyData.name,
        p_company_description: companyData.description ?? null,
        p_company_website: companyData.website ?? null,
        p_company_logo_url: companyData.logo_url ?? null,
        p_company_founded: companyData.founded ?? null,
        p_company_employee_count: companyData.employee_count ?? null,
        p_company_ceo: companyData.ceo ?? null,
        p_company_industry: companyData.industry ?? null,
        p_company_location: companyData.location ?? null,
      };

      const { data: newCompany, error } = await client.rpc(
        "create_company_transaction",
        dbPayload,
      );

      if (error) throw error;

      await get().refetchCompanies();

      return newCompany;
    } catch (err) {
      console.error("Error creating company:", err);
      throw err;
    } finally {
      set((s) => ({ loading: { ...s.loading, companies: false } }));
    }
  },
});
