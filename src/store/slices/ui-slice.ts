import type { StateCreator } from "zustand";
import type { AuthState } from "../auth-store";
import type { AppError } from "@/types/user";

export interface UISlice {
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

  setLoading: (key: keyof UISlice["loading"], value: boolean) => void;
  setError: (key: keyof UISlice["errors"], error: AppError | null) => void;
  clearErrors: () => void;
}

export const createUISlice: StateCreator<AuthState, [], [], UISlice> = (
  set,
) => ({
  loading: { auth: false, profile: false, companies: false, jobs: false },
  errors: { auth: null, profile: null, companies: null, jobs: null },

  setLoading: (key, value) =>
    set((state) => ({ loading: { ...state.loading, [key]: value } })),
  setError: (key, error) =>
    set((state) => ({ errors: { ...state.errors, [key]: error } })),
  clearErrors: () =>
    set({
      errors: { auth: null, profile: null, companies: null, jobs: null },
    }),
});
