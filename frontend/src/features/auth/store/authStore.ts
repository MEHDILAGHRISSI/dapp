// src/stores/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  UserData,
  RegisterData,
  LoginData,
  VerifyOtpData,
  ResetPasswordData,
  ForgotPasswordData,
} from "@/features/auth/types";
import { authService } from "@/features/auth/services/authService";
import { AuthState } from "@/features/auth/types/AuthState";
import { useProfileStore } from "@/features/profile/store/profileStore";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,

      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ isLoading: loading }),

      // ---------------- LOGIN ----------------
      login: async (data: LoginData): Promise<boolean> => {
        set({ isLoading: true });

        try {
          // 1) Login → returns token + minimal user info
          const { token, user } = await authService.login(data);

          // 2) Save auth info only (no full profile here)
          set({
            token,
            user, // minimal user: id + email
            isAuthenticated: true,
          });

          set({ isLoading: false });
          return true;
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error?.message || "Login failed");
        }
      },

      // ---------------- REGISTER ----------------
      register: async (data: RegisterData): Promise<boolean> => {
        set({ isLoading: true });
        try {
          await authService.register(data);
          set({ isLoading: false });
          return true;
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error?.message || "Registration failed");
        }
      },

      // ---------------- VERIFY OTP ----------------
      verifyOtp: async (data): Promise<boolean> => {
        set({ isLoading: true });
        try {
          await authService.verifyOtp(data);
          set({ isLoading: false });
          return true;
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error?.message || "OTP verification failed");
        }
      },

      // ---------------- RESEND OTP ----------------
      resendOtp: async (email: string): Promise<boolean> => {
        set({ isLoading: true });
        try {
          await authService.resendOtp(email);
          set({ isLoading: false });
          return true;
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error?.message || "Failed to resend OTP");
        }
      },

      // ---------------- FORGOT PASSWORD ----------------
      forgotPassword: async (data: ForgotPasswordData): Promise<boolean> => {
        set({ isLoading: true });
        try {
          await authService.forgotPassword(data);
          set({ isLoading: false });
          return true;
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error?.message || "Request failed");
        }
      },

      // ---------------- RESET PASSWORD ----------------
      resetPassword: async (data: ResetPasswordData): Promise<boolean> => {
        set({ isLoading: true });
        try {
          await authService.resetPassword(data);
          set({ isLoading: false });
          return true;
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error?.message || "Reset failed");
        }
      },

      // ---------------- LOGOUT ----------------
      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          isLoading: false,
        });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
