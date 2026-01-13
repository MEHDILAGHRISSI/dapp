// src/pages/Authentication/types/authTypes.ts

// minimal userData
export interface UserData{
  userId: string;
  email: string;
  
}

// Login input
export interface LoginData {
  email: string;
  password: string;
}

// Register input
export interface RegisterData {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  
}

// Verify OTP input
export interface VerifyOtpData {
  email: string;
  code: string;
}

// Forgot Password input
export interface ForgotPasswordData {
  email: string;
}

// Reset Password input
export interface ResetPasswordData {
  email: string;
  code: string;
  newPassword: string;
}


// Authentication/types/WalletType.ts

// API Response types
export interface WalletConnectResponse {
  message: string;
  userId: string;
  walletAddress: string;
}

export interface WalletDisconnectResponse {
  message: string;
  canDisconnect: boolean;
  reasons?: string[];
  activePropertiesCount?: number;
}

export interface WalletStatusResponse {
  hasWallet: boolean;
  walletAddress?: string;
  canDisconnect: boolean;
  activePropertiesCount: number;
}

// API Request types (if needed)
export interface WalletConnectRequest {
  walletAddress: string;
}

export interface WalletDisconnectRequest {
  userId: string;
}