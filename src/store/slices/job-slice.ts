// job-slice.ts
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
  createJob: (jobData: Partial<Job>) => Promise<Job>;
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
    console.log(
      "refetchJobs called - Company:",
      state.currentCompany?.id,
      "User:",
      state.user?.id,
    );

    if (!state.user?.id || !state.currentCompany?.id) {
      console.log("refetchJobs: Missing user or company");
      set({ jobs: [] });
      return;
    }

    // Ensure companyAdmins is loaded
    if (!state.companyAdmins || state.companyAdmins.length === 0) {
      console.log("refetchJobs: companyAdmins not loaded, fetching now...");
      await get().refetchCompanies();
    }

    const updatedState = get();

    const isAdminOfCurrent = updatedState.companyAdmins.some(
      (a) => a.company_id === updatedState.currentCompany?.id,
    );

    if (!isAdminOfCurrent) {
      console.log("refetchJobs: User is not admin of current company");
      set({ jobs: [] });
      return;
    }

    set((s) => ({
      loading: { ...s.loading, jobs: true },
      errors: { ...s.errors, jobs: null },
    }));

    try {
      console.log(
        "refetchJobs: Fetching from database for company:",
        updatedState.currentCompany.id,
      );
      const { data, error } = await client
        .from("jobs")
        .select("*")
        .eq("company_id", updatedState.currentCompany.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      console.log("refetchJobs: Successfully fetched", data?.length, "jobs");
      set({ jobs: data || [] });
    } catch (err) {
      console.error("Error refetching jobs:", err);
      set({ jobs: [] });
    } finally {
      set((s) => ({ loading: { ...s.loading, jobs: false } }));
    }
  },

  createJob: async (jobData: Partial<Job>) => {
    const state = get();
    if (!state.user?.id || !state.currentCompany?.id) {
      throw new Error("User not authenticated or no company selected");
    }

    set((s) => ({
      loading: { ...s.loading, jobs: true },
      errors: { ...s.errors, jobs: null },
    }));

    try {
      const { data, error } = await client.rpc("create_job_transaction", {
        p_user_id: state.user.id,
        p_company_id: state.currentCompany.id,
        p_title: jobData.title,
        p_description: jobData.description,
        p_requirements: jobData.requirements,
        p_location_type: jobData.location_type,
        p_location: jobData.location || null,
        p_employment_type: jobData.employment_type,
        p_salary_range: jobData.salary_range || null,
        p_experience_level: jobData.experience_level,
        p_skills_required: jobData.skills_required || null,
        p_status: jobData.status || "draft",
        p_application_deadline: jobData.application_deadline || null,
        p_application_url: jobData.application_url || null,
      });

      if (error) throw error;

      set((s) => ({ jobs: [data, ...s.jobs] }));

      return data;
    } catch (err) {
      console.error("Error creating job:", err);
      throw err;
    } finally {
      set((s) => ({ loading: { ...s.loading, jobs: false } }));
    }
  },
});
