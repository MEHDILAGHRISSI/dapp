// src/pages/Authentication/authService.ts
import { publicApiClient } from "@/lib/api/publicApiClient";
import {
  LoginData,
  RegisterData,
  VerifyOtpData,
  UserData,
  ForgotPasswordData,
  ResetPasswordData,
} from "../types";
import { useProfileStore } from "@/features/profile/store/profileStore";

export const authService = {
  // ---------------- LOGIN (PUBLIC) ----------------
  login: async (
    data: LoginData
  ): Promise<{ token: string; user: UserData }> => {
    try {
      // Use publicApiClient for login
      const response = await publicApiClient.post("/auth/users/login", data);

      const authHeader = response.headers["authorization"];
      const userId = response.headers["user_id"];

      if (!authHeader || !userId) {
        console.log("auth :" , authHeader,"userid :", userId);
        throw new Error("Missing authentication data");
      }

      const token = authHeader.replace("Bearer ", "");
      return {
        token,
        user: {
          userId,
          email: data.email,
        },
      };
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Login failed";

      console.log(msg, error);

      if (error?.response?.status === 403) {
        if (
          msg.toLowerCase().includes("verify") ||
          msg.toLowerCase().includes("email") ||
          msg.toLowerCase().includes("vérifier")
        ) {
          throw new Error("Please verify your email before logging in");
        } else {
          throw new Error("Invalid email or password");
        }
      }

      throw new Error(msg);
    }
  },

  // ---------------- REGISTER (PUBLIC) ----------------
  register: async (data: RegisterData): Promise<void> => {
    try {
      // Use publicApiClient for registration
      await publicApiClient.post("/auth/users", data);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Registration failed";

      if ([400, 409].includes(error?.response?.status)) {
        if (
          msg.toLowerCase().includes("email") ||
          msg.toLowerCase().includes("exist")
        ) {
          throw new Error("Email already exists");
        }
        throw new Error("Invalid registration data");
      }

      throw new Error(msg);
    }
  },

  // ---------------- VERIFY OTP (PUBLIC) ----------------
  verifyOtp: async (data: VerifyOtpData): Promise<void> => {
    try {
      // Use publicApiClient for OTP verification
      await publicApiClient.post("/auth/users/verify-otp", data);
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Invalid OTP code"
      );
    }
  },

  // ---------------- RESEND OTP (PUBLIC) ----------------
  resendOtp: async (email: string): Promise<void> => {
    try {
      // Use publicApiClient for resending OTP
      await publicApiClient.post("/auth/users/resend-otp", null, {
        params: { email },
      });
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to resend OTP"
      );
    }
  },

  // ---------------- FORGOT PASSWORD (PUBLIC) ----------------
  forgotPassword: async (data: ForgotPasswordData): Promise<void> => {
    try {
      // Use publicApiClient for forgot password
      await publicApiClient.post("/auth/users/forgot-password", data);
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to send reset instructions"
      );
    }
  },

  // ---------------- RESET PASSWORD (PUBLIC) ----------------
  resetPassword: async (data: ResetPasswordData): Promise<void> => {
    try {
      // Use publicApiClient for reset password
      await publicApiClient.post("/auth/users/reset-password", data);
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to reset password"
      );
    }
  },
};
