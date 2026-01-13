import { create } from "zustand";
import { ProfileServices } from "../services/profile.service";
import { ProfileState, UserData } from "../types/profile.types";

export const useProfileStore = create<ProfileState>((set) => ({
  user: null,
  loading: false,
  error: null,

  // ---------------- FETCH USER PROFILE ----------------
  fetchUserProfile: async (userId: string) => {
    try {
      set({ loading: true, error: null });

      const userData = await ProfileServices.fetchUserProfile(userId);

      set({ user: userData, loading: false });
      return userData;
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch user profile",
        loading: false,
      });
      throw error;
    }
  },

  // ---------------- CLEAR ANY ERROR ----------------
  clearError: () => set({ error: null }),

  // ---------------- SET USER DATA (Manual update) ----------------
  setUser: (userData: UserData) => set({ user: userData }),

  // ---------------- UPDATE USER WALLET (Frontend only) ----------------
  updateUserWallet: (address: string | null) =>
    set((state) => ({
      user: state.user
        ? { ...state.user, walletAddress: address }
        : null,
    })),
}));
