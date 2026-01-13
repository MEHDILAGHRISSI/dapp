// components/WalletConnectButton.tsx
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { useWalletStore } from "@/features/auth/store/WalletStore";
import { useProfileStore } from "@/features/profile/store/profileStore";

interface WalletConnectButtonProps {
  className?: string;
}

export function WalletConnectButton({ className = "" }: WalletConnectButtonProps) {

  // REAL wallet state
  const { isConnected, walletAddress, connect, disconnect } = useWalletStore();

  // BACKEND wallet state
  const profileWallet = useProfileStore((s) => s.user?.walletAddress);

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
      className={`font-medium text-[#182a3a] ${
        finalIsConnected
          ? "bg-gray-200 hover:bg-gray-300"
          : "bg-white hover:bg-gray-200"
      } ${className}`}
    >
      <Wallet className="w-4 h-4 mr-2" />
      {label}
    </Button>
  );
}
