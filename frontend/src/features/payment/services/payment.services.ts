// src/features/payment/services/payment.service.ts
import { privateApiClient } from "@/lib/api/privateApiClient";
import {
  Payment,
  ValidatePaymentRequest,
  ValidatePaymentResponse,
  PaymentHistoryResponse,
  HealthCheckResponse,
  PaymentError,
  MetaMaskError,
  PAYMENT_CONSTANTS,
  ContractStateInfo
} from "../types/payment.types";

// Web3 ABI for RentalEscrow contract
const RENTAL_ESCROW_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_owner", "type": "address" },
      { "internalType": "address", "name": "_tenant", "type": "address" },
      { "internalType": "uint256", "name": "_rentAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "_checkInDate", "type": "uint256" },
      { "internalType": "uint256", "name": "_checkOutDate", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "initiator", "type": "address" }
    ],
    "name": "Cancelled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "tenant", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "Funded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "Released",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "cancel",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "checkInDate",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "checkOutDate",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "currentState",
    "outputs": [{ "internalType": "enum RentalEscrow.State", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "fund",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "release",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "rentAmount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "tenant",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  }
];

export const PaymentService = {
  // ==================== API ENDPOINTS ====================

  /**
   * 1. VALIDATE PAYMENT
   * POST /api/payments/validate
   * Validates a blockchain payment
   */
  validatePayment: async (request: ValidatePaymentRequest): Promise<ValidatePaymentResponse> => {
    try {
      const response = await privateApiClient.post('/payments/validate', request);
      return response.data as ValidatePaymentResponse;
    } catch (error: any) {
      console.error("Failed to validate payment:", error);

      // Handle specific error cases
      if (error.response?.status === 400) {
        throw new PaymentError({
          message: error.response.data.message,
          userMessage: "❌ Montant incorrect ou transaction invalide",
          retryable: false
        });
      }

      if (error.response?.status === 404) {
        throw new PaymentError({
          message: error.response.data.message,
          userMessage: "⏳ Transaction pas encore visible sur la blockchain. Veuillez réessayer dans quelques secondes.",
          retryable: true
        });
      }

      if (error.response?.status === 409) {
        throw new PaymentError({
          message: error.response.data.message,
          userMessage: "✅ Ce paiement a déjà été validé. Vérifiez vos réservations.",
          retryable: false
        });
      }

      throw new PaymentError({
        message: error?.response?.data?.message || "Failed to validate payment",
        userMessage: "❌ Erreur lors de la validation du paiement. Veuillez réessayer.",
        retryable: true
      });
    }
  },

  /**
   * 2. GET PAYMENT HISTORY FOR BOOKING
   * GET /api/payments/booking/{bookingId}
   */
  getPaymentHistory: async (bookingId: number): Promise<PaymentHistoryResponse> => {
    try {
      const response = await privateApiClient.get(`/payments/booking/${bookingId}`);
      return response.data as PaymentHistoryResponse;
    } catch (error: any) {
      console.error("Failed to fetch payment history:", error);
      throw new Error(error?.response?.data?.message || "Failed to fetch payment history");
    }
  },

  /**
   * 3. HEALTH CHECK
   * GET /api/payments/health
   */
  checkHealth: async (): Promise<HealthCheckResponse> => {
    try {
      const response = await privateApiClient.get('/payments/health');
      return response.data as HealthCheckResponse;
    } catch (error: any) {
      console.error("Payment service health check failed:", error);
      throw new Error("Payment service is unavailable");
    }
  },

  // ==================== WEB3 / BLOCKCHAIN METHODS ====================

  /**
   * Initialize Web3 and connect to MetaMask
   */
  initWeb3: async (): Promise<{ web3: any; accounts: string[]; fromAddress: string }> => {
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        throw new PaymentError({
          code: 4100,
          message: 'MetaMask is not installed',
          userMessage: '❌ MetaMask n\'est pas installé. Veuillez installer MetaMask pour continuer.',
          retryable: false
        });
      }

      // Create Web3 instance
      const Web3 = (await import('web3')).default;
      const web3 = new Web3(window.ethereum);

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (!accounts || accounts.length === 0) {
        throw new PaymentError({
          code: 4200,
          message: 'No accounts found',
          userMessage: '❌ Aucun compte trouvé. Veuillez déverrouiller MetaMask.',
          retryable: false
        });
      }

      const fromAddress = accounts[0];
      console.log("✅ Wallet connecté:", fromAddress);

      return { web3, accounts, fromAddress };

    } catch (error: any) {
      throw PaymentService.handleWeb3Error(error);
    }
  },

  /**
   * Ensure correct network is connected
   */
  ensureNetwork: async (targetNetwork: string = 'POLYGON_MUMBAI'): Promise<void> => {
    try {
      const network = PAYMENT_CONSTANTS.NETWORKS[targetNetwork as keyof typeof PAYMENT_CONSTANTS.NETWORKS];

      if (!network) {
        throw new Error(`Unknown network: ${targetNetwork}`);
      }

      try {
        // Try to switch to the network
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: network.chainId }]
        });
      } catch (switchError: any) {
        // Network not added, add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: network.chainId,
              chainName: network.name,
              nativeCurrency: {
                name: network.currency,
                symbol: network.currency,
                decimals: 18
              },
              rpcUrls: ['https://rpc-mumbai.maticvigil.com/'], // Default for Polygon Mumbai
              blockExplorerUrls: ['https://mumbai.polygonscan.com/']
            }]
          });
        } else {
          throw switchError;
        }
      }

      // Verify the switch was successful
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== network.chainId) {
        throw new Error(`Failed to switch to ${network.name}`);
      }

      console.log(`✅ Réseau correct: ${network.name}`);

    } catch (error: any) {
      throw PaymentService.handleWeb3Error(error);
    }
  },

  /**
   * Get contract instance
   */
  getContractInstance: (web3: any, contractAddress: string): any => {
    try {
      return new web3.eth.Contract(RENTAL_ESCROW_ABI, contractAddress);
    } catch (error) {
      throw new PaymentError({
        message: 'Failed to create contract instance',
        userMessage: '❌ Impossible de créer l\'instance du contrat. Vérifiez l\'adresse.',
        retryable: false
      });
    }
  },

  /**
   * Check contract state
   */
  checkContractState: async (contract: any): Promise<{
    currentState: number;
    rentAmount: string;
    stateInfo: ContractStateInfo;
  }> => {
    try {
      const currentState = await contract.methods.currentState().call();
      const rentAmount = await contract.methods.rentAmount().call();

      const stateInfo = PAYMENT_CONSTANTS.CONTRACT_STATES[currentState] || {
        name: 'Unknown',
        displayName: 'Unknown',
        canFund: false,
        canRelease: false,
        canCancel: false
      };

      return { currentState, rentAmount, stateInfo };

    } catch (error: any) {
      throw new PaymentError({
        message: `Failed to read contract state: ${error.message}`,
        userMessage: '❌ Impossible de lire l\'état du contrat. Vérifiez que l\'adresse est correcte.',
        retryable: false
      });
    }
  },

  /**
   * Estimate gas for fund() transaction
   */
  estimateGasForFund: async (
    contract: any,
    fromAddress: string,
    rentAmount: string
  ): Promise<number> => {
    try {
      const gasEstimate = await contract.methods.fund().estimateGas({
        from: fromAddress,
        value: rentAmount
      });

      return Math.floor(gasEstimate * PAYMENT_CONSTANTS.GAS_MULTIPLIER);

    } catch (error: any) {
      // Handle specific contract errors
      if (error.message.includes('Already funded')) {
        throw new PaymentError({
          message: 'Contract already funded',
          userMessage: '❌ Ce contrat a déjà été payé.',
          retryable: false
        });
      }

      if (error.message.includes('Incorrect amount')) {
        throw new PaymentError({
          message: 'Incorrect amount',
          userMessage: '❌ Montant incorrect.',
          retryable: false
        });
      }

      if (error.message.includes('Only tenant')) {
        throw new PaymentError({
          message: 'Only tenant can fund',
          userMessage: '❌ Seul le locataire peut payer ce contrat.',
          retryable: false
        });
      }

      if (error.message.includes('insufficient funds')) {
        throw new PaymentError({
          message: 'Insufficient funds',
          userMessage: '❌ Solde insuffisant. Ajoutez des fonds à votre wallet.',
          retryable: false
        });
      }

      throw new PaymentError({
        message: `Gas estimation failed: ${error.message}`,
        userMessage: '❌ Erreur lors de l\'estimation des frais.',
        retryable: true
      });
    }
  },

  /**
   * Execute fund() transaction
   */
  executeFundTransaction: async (
    contract: any,
    fromAddress: string,
    rentAmount: string,
    gasLimit: number
  ): Promise<any> => {
    try {
      const receipt = await contract.methods.fund().send({
        from: fromAddress,
        value: rentAmount,
        gas: gasLimit
      });

      console.log("✅ Transaction minée:", {
        hash: receipt.transactionHash,
        block: receipt.blockNumber,
        gasUsed: receipt.gasUsed
      });

      return receipt;

    } catch (error: any) {
      throw PaymentService.handleWeb3Error(error);
    }
  },

  /**
   * Check wallet balance
   */
  checkWalletBalance: async (web3: any, address: string, requiredAmount: string): Promise<{
    balance: string;
    balanceEther: string;
    hasEnough: boolean;
  }> => {
    try {
      const balance = await web3.eth.getBalance(address);
      const balanceEther = web3.utils.fromWei(balance, 'ether');
      const requiredEther = web3.utils.fromWei(requiredAmount, 'ether');

      const hasEnough = web3.utils.toBN(balance).gte(web3.utils.toBN(requiredAmount));

      return {
        balance,
        balanceEther,
        hasEnough
      };

    } catch (error) {
      throw new PaymentError({
        message: 'Failed to check wallet balance',
        userMessage: '❌ Impossible de vérifier le solde du wallet.',
        retryable: true
      });
    }
  },

  // ==================== COMPLETE PAYMENT WORKFLOW ====================

  /**
   * Complete payment workflow
   */
  processCompletePayment: async (
    booking: {
      id: number;
      contractAddress: string;
      tenantWalletAddress: string;
      createdAt: string;
      totalPrice?: number;
      currency?: string;
    },
    authToken: string
  ): Promise<{
    success: boolean;
    payment: ValidatePaymentResponse;
    transactionHash: string;
    blockNumber: number;
  }> => {
    try {
      // Step 1: Initialize Web3
      console.log("🔌 Initializing Web3...");
      const { web3, fromAddress } = await PaymentService.initWeb3();

      // Step 2: Ensure correct network
      console.log("🌐 Checking network...");
      await PaymentService.ensureNetwork('POLYGON_MUMBAI');

      // Step 3: Check if booking is expired
      const isExpired = PaymentService.isBookingExpired(booking.createdAt);
      if (isExpired) {
        throw new PaymentError({
          message: 'Booking expired',
          userMessage: '⏰ Temps expiré ! Votre réservation a été annulée.',
          retryable: false
        });
      }

      // Step 4: Check wallet matches booking wallet (with option to continue anyway)
      const walletMatches = fromAddress.toLowerCase() === booking.tenantWalletAddress.toLowerCase();
      if (!walletMatches) {
        const userConfirmed = window.confirm(
          `⚠️ Vous utilisez un wallet différent de celui enregistré.\n\n` +
          `Enregistré: ${booking.tenantWalletAddress}\n` +
          `Actuel: ${fromAddress}\n\n` +
          `Voulez-vous continuer avec le wallet actuel?`
        );

        if (!userConfirmed) {
          throw new PaymentError({
            message: 'User cancelled due to wallet mismatch',
            userMessage: 'Veuillez utiliser le wallet enregistré.',
            retryable: false
          });
        }
      }

      // Step 5: Get contract instance
      console.log("📄 Loading contract...");
      const contract = PaymentService.getContractInstance(web3, booking.contractAddress);

      // Step 6: Check contract state
      console.log("🔍 Checking contract state...");
      const { currentState, rentAmount, stateInfo } = await PaymentService.checkContractState(contract);

      if (!stateInfo.canFund) {
        throw new PaymentError({
          message: `Contract state ${currentState} cannot be funded`,
          userMessage: `❌ Contrat dans l'état "${stateInfo.displayName}". Impossible de payer.`,
          retryable: false
        });
      }

      // Step 7: Check wallet balance
      console.log("💰 Checking wallet balance...");
      const balanceInfo = await PaymentService.checkWalletBalance(web3, fromAddress, rentAmount);

      if (!balanceInfo.hasEnough) {
        const requiredEther = web3.utils.fromWei(rentAmount, 'ether');
        throw new PaymentError({
          message: `Insufficient balance: ${balanceInfo.balanceEther} < ${requiredEther}`,
          userMessage: `❌ Solde insuffisant.\nNécessaire: ${requiredEther} MATIC\nActuel: ${balanceInfo.balanceEther} MATIC`,
          retryable: false
        });
      }

      // Step 8: Estimate gas
      console.log("⛽ Estimating gas...");
      const gasLimit = await PaymentService.estimateGasForFund(contract, fromAddress, rentAmount);

      // Step 9: Execute transaction
      console.log("🚀 Executing transaction...");
      const receipt = await PaymentService.executeFundTransaction(
        contract,
        fromAddress,
        rentAmount,
        gasLimit
      );

      // Step 10: Validate with backend
      console.log("🔄 Validating with backend...");
      const amountEther = web3.utils.fromWei(rentAmount, 'ether');
      const payment = await PaymentService.validatePaymentWithRetry(
        booking.id,
        receipt.transactionHash,
        booking.contractAddress,
        parseFloat(amountEther),
        authToken
      );

      console.log("✅ Payment completed successfully!");

      return {
        success: true,
        payment,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber
      };

    } catch (error) {
      if (error instanceof PaymentError) {
        throw error;
      }

      throw PaymentService.handleWeb3Error(error);
    }
  },

  /**
   * Validate payment with retry logic
   */
  validatePaymentWithRetry: async (
    bookingId: number,
    transactionHash: string,
    contractAddress: string,
    expectedAmount: number,
    authToken: string,
    attempt: number = 1
  ): Promise<ValidatePaymentResponse> => {
    try {
      const request: ValidatePaymentRequest = {
        bookingId,
        transactionHash,
        contractAddress,
        expectedAmount
      };

      return await PaymentService.validatePayment(request);

    } catch (error: any) {
      // Check if we should retry
      if (attempt < PAYMENT_CONSTANTS.VALIDATION_RETRY_ATTEMPTS) {
        if (error.retryable || error.message?.includes('Transaction not found')) {
          console.log(`⏳ Retry ${attempt}/${PAYMENT_CONSTANTS.VALIDATION_RETRY_ATTEMPTS}...`);
          await new Promise(resolve => setTimeout(resolve, PAYMENT_CONSTANTS.VALIDATION_RETRY_DELAY));
          return PaymentService.validatePaymentWithRetry(
            bookingId,
            transactionHash,
            contractAddress,
            expectedAmount,
            authToken,
            attempt + 1
          );
        }
      }

      throw error;
    }
  },

  // ==================== UTILITY METHODS ====================

  /**
   * Check if booking is expired (for AWAITING_PAYMENT status)
   */
  isBookingExpired: (createdAt: string): boolean => {
    const created = new Date(createdAt);
    const expires = new Date(created.getTime() + PAYMENT_CONSTANTS.PAYMENT_TIMEOUT);
    const now = new Date();
    return now > expires;
  },

  /**
   * Calculate time left for payment
   */
  calculateTimeLeft: (createdAt: string): { minutes: number; seconds: number; expired: boolean } => {
    const created = new Date(createdAt);
    const expires = new Date(created.getTime() + PAYMENT_CONSTANTS.PAYMENT_TIMEOUT);
    const now = new Date();
    const timeLeft = expires.getTime() - now.getTime();

    if (timeLeft <= 0) {
      return { expired: true, minutes: 0, seconds: 0 };
    }

    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);

    return { expired: false, minutes, seconds };
  },

  /**
   * Handle Web3/MetaMask errors
   */
  handleWeb3Error: (error: any): PaymentError => {
    console.error("Web3 error:", error);

    // MetaMask specific errors
    if (error.code === PAYMENT_CONSTANTS.METAMASK_ERRORS.USER_REJECTED) {
      return new PaymentError({
        code: error.code,
        message: 'User rejected the transaction',
        userMessage: '❌ Transaction rejetée par l\'utilisateur',
        retryable: true
      });
    }

    if (error.code === PAYMENT_CONSTANTS.METAMASK_ERRORS.UNAUTHORIZED) {
      return new PaymentError({
        code: error.code,
        message: 'Unauthorized',
        userMessage: '❌ Non autorisé. Reconnectez MetaMask.',
        retryable: true
      });
    }

    if (error.code === PAYMENT_CONSTANTS.METAMASK_ERRORS.UNSUPPORTED_METHOD) {
      return new PaymentError({
        code: error.code,
        message: 'Unsupported method',
        userMessage: '❌ Méthode non supportée. Mettez à jour MetaMask.',
        retryable: false
      });
    }

    if (error.code === PAYMENT_CONSTANTS.METAMASK_ERRORS.DISCONNECTED) {
      return new PaymentError({
        code: error.code,
        message: 'MetaMask disconnected',
        userMessage: '❌ MetaMask déconnecté. Veuillez reconnecter.',
        retryable: true
      });
    }

    if (error.code === PAYMENT_CONSTANTS.METAMASK_ERRORS.CHAIN_DISCONNECTED) {
      return new PaymentError({
        code: error.code,
        message: 'Chain disconnected',
        userMessage: '❌ Réseau non connecté dans MetaMask',
        retryable: true
      });
    }

    // Generic error
    return new PaymentError({
      message: error.message || 'Unknown Web3 error',
      userMessage: '❌ Erreur lors de l\'interaction avec la blockchain',
      retryable: true
    });
  },

  /**
   * Get status display info
   */
  getStatusInfo: (status: string) => {
    const statusKey = status.toUpperCase() as keyof typeof PAYMENT_CONSTANTS.STATUS_INFO;
    return PAYMENT_CONSTANTS.STATUS_INFO[statusKey] || PAYMENT_CONSTANTS.STATUS_INFO.FAILED;
  },

  /**
   * Format address for display
   */
  formatAddress: (address: string, length: number = 8): string => {
    if (!address || address.length < 10) return address;
    return `${address.substring(0, length)}...${address.substring(address.length - length)}`;
  },

  /**
   * Convert wei to ether
   */
  weiToEther: (wei: string, decimals: number = 4): string => {
    try {
      const Web3 = require('web3');
      const web3 = new Web3();
      const ether = web3.utils.fromWei(wei, 'ether');
      return parseFloat(ether).toFixed(decimals);
    } catch (error) {
      return wei;
    }
  },

  /**
   * Convert ether to wei
   */
  etherToWei: (ether: string): string => {
    try {
      const Web3 = require('web3');
      const web3 = new Web3();
      return web3.utils.toWei(ether, 'ether');
    } catch (error) {
      return ether;
    }
  },

  /**
   * Get blockchain explorer URL
   */
  getExplorerUrl: (type: 'tx' | 'address', hash: string, network: string = 'mumbai'): string => {
    const baseUrls: Record<string, string> = {
      mainnet: 'https://polygonscan.com',
      mumbai: 'https://mumbai.polygonscan.com',
      ethereum: 'https://etherscan.io',
      sepolia: 'https://sepolia.etherscan.io'
    };

    const baseUrl = baseUrls[network] || baseUrls.mumbai;
    return `${baseUrl}/${type}/${hash}`;
  }
};

// PaymentError class
class PaymentError extends Error {
  code?: number;
  userMessage: string;
  retryable: boolean;

  constructor(data: { code?: number; message: string; userMessage: string; retryable: boolean }) {
    super(data.message);
    this.name = 'PaymentError';
    this.code = data.code;
    this.userMessage = data.userMessage;
    this.retryable = data.retryable;
  }
}