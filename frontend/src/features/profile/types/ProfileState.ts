import { UserData } from "@/features/auth/types";

export interface ProfileState {
  user: UserData | null;
  loading: boolean;
  error: string | null;

  fetchUserProfile: (userId: string) => Promise<UserData>;
  clearError: () => void;

  // ⭐ NEW
  updateUserWallet: (address: string | null) => void;
}
