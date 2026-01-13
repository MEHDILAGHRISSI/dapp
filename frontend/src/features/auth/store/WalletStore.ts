// stores/WalletStore.ts
import { create } from "zustand";
import { toast } from "@/shared/hooks/use-toast";
import { isAddress } from "viem";
import { WalletService } from "@/features/auth/services/WalletSevice";
import { useAuthStore } from "./authStore";
import { WalletState } from "@/features/auth/types/WalletState";
import { useProfileStore } from "@/features/profile/store/profileStore";

export const useWalletStore = create<WalletState>((set, get) => ({
  walletAddress: null,
  isConnected: false,

  initialize: () => {
    if (typeof window === "undefined") return;

    // Only listen to MetaMask — no local storage restore
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", async (accounts: string[]) => {
        if (accounts.length === 0) {
          get().disconnect();
        } else {
          const address = accounts[0];
          if (isAddress(address)) {
            set({ walletAddress: address, isConnected: true });

            // Sync with backend when wallet changes
            const { user } = useAuthStore.getState();
            if (user?.userId) {
              try {
                await WalletService.connectWallet(user.userId, address);
              } catch (error) {
                console.error("Failed to sync wallet with backend:", error);
              }
            }
          }
        }
      });

      window.ethereum.on("disconnect", () => get().disconnect());
    }
  },

  connect: async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask Missing",
        description: "Install MetaMask to connect your wallet",
        variant: "destructive",
      });
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const address = accounts[0];
      if (!isAddress(address)) throw new Error("Invalid wallet address");

      const user = useAuthStore.getState().user;
      if (!user?.userId) {
        throw new Error("User not authenticated");
      }

      // Sync with backend
      await WalletService.connectWallet(user.userId, address);

      set({ walletAddress: address, isConnected: true });

      toast({
        title: "Wallet Connected",
        description: `Connected: ${address.slice(0, 6)}...${address.slice(-4)}`,
      });

    } catch (err: any) {
      toast({
        title: "Connection Failed",
        description: err?.message || "Could not connect to wallet",
        variant: "destructive",
      });
      throw err;
    }
  },

  disconnect: async () => {
    try {
      const { user } = useAuthStore.getState();
      const { walletAddress } = get();

      if (user?.userId && walletAddress) {
        const result = await WalletService.disconnectWallet(user.userId);

        if (!result.canDisconnect) {
          toast({
            title: "Cannot Disconnect Wallet",
            description: result.reasons?.join(", ") || "Active properties prevent disconnection",
            variant: "destructive",
          });
          return;
        }
      }

      // Clear only in-memory state
      set({ walletAddress: null, isConnected: false });

      // Sync with profile store
      useProfileStore.getState().updateUserWallet(null);

      toast({
        title: "Wallet Disconnected",
        description: "Wallet has been successfully disconnected",
      });

    } catch (error: any) {
      toast({
        title: "Disconnection Failed",
        description: error?.message || "Failed to disconnect wallet",
        variant: "destructive",
      });
    }
  },
}));

declare global {
  interface Window {
    ethereum?: import("@metamask/providers").MetaMaskInpageProvider;
  }
}
