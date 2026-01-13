// src/features/payment/types/payment.types.ts

// ==================== CORE PAYMENT TYPES ====================

export interface Payment {
    // Core Information
    id: number;
    bookingId: number;
    transactionHash: string; // Format: "0x" + 64 hex characters
    contractAddress: string; // Format: "0x" + 40 hex characters

    // Transaction Details
    amount: number; // In Ether/MATIC
    currency: string; // "MATIC", "ETH", "USDC", etc.
    fromAddress: string; // Wallet address of payer
    status: PaymentStatus;

    // Blockchain Details
    blockNumber?: number;
    validatedAt?: string;
    errorMessage?: string;

    // Timestamps
    createdAt: string;
    updatedAt: string;
}

export interface PaymentHistory {
    id: number;
    bookingId: number;
    transactionHash: string;
    status: PaymentStatus;
    errorMessage?: string;
    createdAt: string;
}

// ==================== ENUMS ====================

export type PaymentStatus =
    | 'PENDING'      // Payment created, awaiting validation
    | 'VALIDATING'   // Blockchain validation in progress
    | 'CONFIRMED'    // Transaction validated and booking confirmed
    | 'FAILED';      // Validation failed

// ==================== REQUEST TYPES ====================

export interface ValidatePaymentRequest {
    bookingId: number;
    transactionHash: string;
    contractAddress: string;
    expectedAmount: number; // In Ether/MATIC
}

// ==================== RESPONSE TYPES ====================

export interface ValidatePaymentResponse extends Payment {
    // Same as Payment for now
}

export interface PaymentHistoryResponse extends Array<PaymentHistory> { }

export interface HealthCheckResponse {
    status: 'UP' | 'DOWN';
    blockchain: {
        connected: boolean;
        network: string;
        chainId: number;
        blockNumber: number;
    };
    services: {
        bookingService: string;
        web3Provider: string;
    };
}

// ==================== SMART CONTRACT TYPES ====================

export interface RentalEscrowContract {
    address: string;
    rentAmount: string; // In wei
    currentState: ContractState;
    owner: string;
    tenant: string;
    checkInDate: number; // timestamp
    checkOutDate: number; // timestamp
}

export type ContractState =
    | 'Created'    // 0
    | 'Funded'     // 1
    | 'Active'     // 2
    | 'Completed'  // 3
    | 'Cancelled'; // 4

export interface ContractStateInfo {
    code: number;
    name: ContractState;
    displayName: string;
    canFund: boolean;
    canRelease: boolean;
    canCancel: boolean;
}

// ==================== BLOCKCHAIN TYPES ====================

export interface TransactionReceipt {
    transactionHash: string;
    blockNumber: number;
    gasUsed: number;
    status: boolean; // true for success
    events?: Record<string, any>;
}

export interface WalletInfo {
    address: string;
    balance: string; // In Ether/MATIC
    network: string;
    chainId: number;
}

// ==================== ERROR TYPES ====================

export interface PaymentError {
    code?: number;
    message: string;
    userMessage: string;
    retryable: boolean;
}

export interface MetaMaskError extends Error {
    code: number;
    message: string;
    data?: any;
}

// ==================== CONSTANTS ====================

export const PAYMENT_CONSTANTS = {
    // Network IDs
    NETWORKS: {
        POLYGON_MAINNET: {
            chainId: '0x89', // 137
            name: 'Polygon Mainnet',
            currency: 'MATIC'
        },
        POLYGON_MUMBAI: {
            chainId: '0x13881', // 80001
            name: 'Polygon Mumbai Testnet',
            currency: 'MATIC'
        },
        ETHEREUM_MAINNET: {
            chainId: '0x1', // 1
            name: 'Ethereum Mainnet',
            currency: 'ETH'
        },
        ETHEREUM_SEPOLIA: {
            chainId: '0xaa36a7', // 11155111
            name: 'Ethereum Sepolia',
            currency: 'ETH'
        }
    },

    // Payment Status Info
    STATUS_INFO: {
        PENDING: {
            displayName: 'Pending',
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-100',
            badge: 'badge-warning'
        },
        VALIDATING: {
            displayName: 'Validating',
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
            badge: 'badge-info'
        },
        CONFIRMED: {
            displayName: 'Confirmed',
            color: 'text-green-600',
            bgColor: 'bg-green-100',
            badge: 'badge-success'
        },
        FAILED: {
            displayName: 'Failed',
            color: 'text-red-600',
            bgColor: 'bg-red-100',
            badge: 'badge-error'
        }
    },

    // Contract State Info
    CONTRACT_STATES: {
        0: { name: 'Created', displayName: 'Created', canFund: true, canRelease: false, canCancel: true },
        1: { name: 'Funded', displayName: 'Funded', canFund: false, canRelease: true, canCancel: false },
        2: { name: 'Active', displayName: 'Active', canFund: false, canRelease: false, canCancel: false },
        3: { name: 'Completed', displayName: 'Completed', canFund: false, canRelease: false, canCancel: false },
        4: { name: 'Cancelled', displayName: 'Cancelled', canFund: false, canRelease: false, canCancel: false }
    } as unknown as Record<number, ContractStateInfo>,

    // MetaMask Error Codes
    METAMASK_ERRORS: {
        USER_REJECTED: 4001,
        UNAUTHORIZED: 4100,
        UNSUPPORTED_METHOD: 4200,
        DISCONNECTED: 4900,
        CHAIN_DISCONNECTED: 4901
    },

    // Transaction Constants
    GAS_MULTIPLIER: 1.2, // Add 20% buffer for gas
    VALIDATION_RETRY_ATTEMPTS: 3,
    VALIDATION_RETRY_DELAY: 5000, // ms
    PAYMENT_TIMEOUT: 15 * 60 * 1000, // 15 minutes in ms
} as const;

// ==================== WEB3 CONFIG TYPES ====================

export interface Web3Config {
    provider: any;
    defaultNetwork: string;
    contracts: {
        rentalEscrow: {
            abi: any[];
        };
    };
}

export interface NetworkConfig {
    chainId: string;
    chainName: string;
    nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
    };
    rpcUrls: string[];
    blockExplorerUrls: string[];
}