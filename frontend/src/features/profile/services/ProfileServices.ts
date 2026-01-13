// src\pages\Settings\Profile\ProfileServices.ts
import { privateApiClient } from "@/lib/api/privateApiClient";
import { UserData } from "@/features/auth/types";
export const ProfileServices = {
  // ---------------- FETCH USER PROFILE (PROTECTED) ----------------
  fetchUserProfile: async (userId: string): Promise<UserData> => {
    try {
      // USE privateApiClient for protected route
      const response = await privateApiClient.get(`auth/users/${userId}`);
      return response.data as UserData;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Failed to fetch user profile"
      );
    }
  },

  // ---------------- UPDATE USER PROFILE (PROTECTED) ----------------
  updateUserProfile: async (
    userId: string,
    data: Partial<UserData>
  ): Promise<UserData> => {
    try {
      // USE privateApiClient for protected route
      const response = await privateApiClient.put(`auth/users/${userId}`, data);
      return response.data as UserData;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Failed to update profile"
      );
    }
  },
};