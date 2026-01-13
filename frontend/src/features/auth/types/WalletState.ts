export interface WalletState {
  walletAddress: string | null;
  isConnected: boolean;
  initialize: () => void;
  connect: () => Promise<void>;
  disconnect: () => void;
}