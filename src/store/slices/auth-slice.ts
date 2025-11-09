import type { StateCreator } from "zustand";
import type { AuthState } from "../auth-store";
import type { User } from "@supabase/supabase-js";
import type { Profile, JobSeeker } from "@/types/user";

export interface AuthSlice {
  user: User | null;
  profile: Profile | null;
  jobSeeker: JobSeeker | null;

  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setJobSeeker: (jobSeeker: JobSeeker | null) => void;
}

export const createAuthSlice: StateCreator<AuthState, [], [], AuthSlice> = (
  set,
) => ({
  user: null,
  profile: null,
  jobSeeker: null,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setJobSeeker: (jobSeeker) => set({ jobSeeker }),
});
