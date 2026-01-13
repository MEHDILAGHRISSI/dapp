import { create } from "zustand";
import { ProfileServices } from "../services/ProfileServices";
import { ProfileState } from "@/features/profile/types/ProfileState";

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

  // ---------------- UPDATE USER WALLET (Frontend only) ----------------
  updateUserWallet: (address: string | null) =>
    set((state) => ({
      user: state.user
        ? { ...state.user, walletAddress: address }
        : null,
    })),
}));
