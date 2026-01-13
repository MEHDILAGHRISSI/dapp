// services/walletService.ts
import { privateApiClient } from "@/lib/api/privateApiClient";
import { 
  WalletConnectResponse, 
  WalletDisconnectResponse, 
  WalletStatusResponse 
} from "../types";

export const WalletService = {
  // ---------------- WALLET MANAGEMENT (PROTECTED) ----------------

  // Connect Wallet
  connectWallet: async (
    userId: string,
    walletAddress: string
  ): Promise<WalletConnectResponse> => {
    console.log("[WalletService] Connecting wallet...", { userId, walletAddress });

    try {
      const response = await privateApiClient.post(
        `auth/users/${userId}/wallet/connect`,
        { walletAddress }
      );

      console.log("[WalletService] Wallet connected ✅", response.data);
      return response.data;
    } catch (error: any) {
      console.error("[WalletService] Connect Failed ❌", error?.response?.data || error);
      throw new Error(
        error?.response?.data?.message || "Failed to connect wallet"
      );
    }
  },

  // Disconnect Wallet
  disconnectWallet: async (
    userId: string
  ): Promise<WalletDisconnectResponse> => {
    console.log("[WalletService] Disconnecting wallet...", { userId });

    try {
      const response = await privateApiClient.delete(
        `auth/users/${userId}/wallet/disconnect`
      );

      console.log("[WalletService] Wallet disconnected ✅", response.data);
      return response.data;
    } catch (error: any) {
      console.error("[WalletService] Disconnect Failed ❌", error?.response?.data || error);

      // Handle domain-specific case
      if (error?.response?.status === 400) {
        console.warn("[WalletService] Wallet cannot be disconnected (400)", error.response.data);
        return error.response.data;
      }

      throw new Error(
        error?.response?.data?.message || "Failed to disconnect wallet"
      );
    }
  },

  // Get Wallet Status
  getWalletStatus: async (
    userId: string
  ): Promise<WalletStatusResponse> => {
    console.log("[WalletService] Fetching wallet status...", { userId });

    try {
      const response = await privateApiClient.get(`auth/users/${userId}/wallet/status`);

      console.log("[WalletService] Wallet status ✅", response.data);
      return response.data;
    } catch (error: any) {
      console.error("[WalletService] Status Fetch Failed ❌", error?.response?.data || error);

      throw new Error(
        error?.response?.data?.message || "Failed to get wallet status"
      );
    }
  },
};
