import type { StateCreator } from "zustand";
import type { AuthState } from "../auth-store";
import type { Job } from "@/types/jobs";
import client from "@/api/client";

export interface JobSlice {
  jobs: Job[];
  setJobs: (jobs: Job[]) => void;
  addJob: (job: Job) => void;
  updateJob: (job: Job) => void;
  removeJob: (id: string) => void;
  refetchJobs: () => Promise<void>;
}

export const createJobSlice: StateCreator<AuthState, [], [], JobSlice> = (
  set,
  get,
) => ({
  jobs: [],

  setJobs: (jobs) => set({ jobs }),
  addJob: (job) => set((state) => ({ jobs: [...state.jobs, job] })),
  updateJob: (job) =>
    set((state) => ({
      jobs: state.jobs.map((j) => (j.id === job.id ? job : j)),
    })),
  removeJob: (id) =>
    set((state) => ({ jobs: state.jobs.filter((j) => j.id !== id) })),

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

    set((s) => ({
      loading: { ...s.loading, jobs: true },
      errors: { ...s.errors, jobs: null },
    }));

    try {
      const { data, error } = await client
        .from("jobs")
        .select("*")
        .eq("company_id", state.currentCompany.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      set({ jobs: data || [] });
    } catch (err) {
      console.error("Error refetching jobs:", err);
      set({ jobs: [] });
    } finally {
      set((s) => ({ loading: { ...s.loading, jobs: false } }));
    }
  },
});
