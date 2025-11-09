import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createAuthSlice } from "./slices/auth-slice";
import type{  AuthSlice } from "./slices/auth-slice";
import { createCompanySlice } from "./slices/company-slice";
import type {CompanySlice } from "./slices/company-slice";
import { createJobSlice } from "./slices/job-slice";
import type { JobSlice } from "./slices/job-slice";
import { createUISlice } from "./slices/ui-slice";
import type { UISlice } from "./slices/ui-slice";
import type { MenuSlice } from "./slices/menu-slice";
import { createMenuSlice } from "./slices/menu-slice";

export type AuthState = AuthSlice & CompanySlice & JobSlice & UISlice & MenuSlice;

export const useAuthStore = create<AuthState>()(
  persist(
    (...a) => ({
      ...createAuthSlice(...a),
      ...createCompanySlice(...a),
      ...createJobSlice(...a),
      ...createUISlice(...a),
      ...createMenuSlice(...a),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        currentCompany: state.currentCompany,
        user: state.user,
        profile: state.profile,
      }),
    },
  ),
);
