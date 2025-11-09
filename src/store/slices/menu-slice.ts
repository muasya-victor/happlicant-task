import type { StateCreator } from "zustand";
import type { AuthState } from "../auth-store";

export interface MenuSlice {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
}

export const createMenuSlice: StateCreator<AuthState, [], [], MenuSlice> = (
  set,
) => ({
  isSidebarOpen: false,

  toggleSidebar: () =>
    set((state:any) => ({ isSidebarOpen: !state.isSidebarOpen })),
  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({ isSidebarOpen: false }),
});
