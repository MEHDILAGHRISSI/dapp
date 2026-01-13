// src/types/AuthState.ts
import {
  ForgotPasswordData,
  LoginData,
  RegisterData,
  ResetPasswordData,
  UserData,
  VerifyOtpData,

} from "@/features/auth/types";

export interface AuthState {
  isAuthenticated: boolean;
  user: UserData | null;
  isLoading: boolean;
  token: string | null;

  // Existing methods (keeping Promise<boolean> return types)
  login: (data: LoginData) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  verifyOtp: (data: VerifyOtpData) => Promise<boolean>;
  resendOtp: (email: string) => Promise<boolean>;
  forgotPassword: (email: ForgotPasswordData) => Promise<boolean>;
  resetPassword: (data: ResetPasswordData) => Promise<boolean>;
 


  logout: () => void;
  setLoading: (loading: boolean) => void;
  setUser: (user: UserData | null) => void;
}
