// components/WalletConnectButton.tsx
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { useWalletStore } from "@/shared/stores/wallet.store";
import { useProfileStore } from "@/features/settings/store/profile.store";
import { useEffect, ReactNode } from "react";

interface WalletConnectButtonProps {
  className?: string;
  children?: ReactNode;
}

export function WalletConnectButton({ className = "", children }: WalletConnectButtonProps) {
  // REAL wallet state
  const { isConnected, walletAddress, connect, disconnect } = useWalletStore();

  // BACKEND wallet state
  const profileWallet = useProfileStore((s) => s.user?.walletAddress);

  // Debug logging
  useEffect(() => {
    console.log("[WalletConnectButton]", {
      walletAddress,
      isConnected,
      profileWallet,
    });
  }, [walletAddress, isConnected, profileWallet]);

  // FIX: Determine connection using combined logic
  const finalIsConnected = isConnected || !!profileWallet;

  const finalAddress = walletAddress || profileWallet || null;

  const formatWalletAddress = (addr: string | null) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleWalletConnect = async () => {
    try {
      if (finalIsConnected) {
        await disconnect();
      } else {
        await connect();
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
    }
  };

  const label =
    finalIsConnected && finalAddress
      ? `Connected: ${formatWalletAddress(finalAddress)}`
      : "Connect Wallet";

  return (
    <Button
      onClick={handleWalletConnect}
      className={`font-medium text-sm px-4 py-2.5 h-auto ${finalIsConnected
        ? "bg-secondary text-secondary-foreground hover:bg-secondary/90 border border-secondary/50"
        : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"
        } ${className}`}
    >
      {children || (
        <>
          <Wallet className="w-4 h-4 mr-2" />
          {label}
        </>
      )}
    </Button>
  );
}