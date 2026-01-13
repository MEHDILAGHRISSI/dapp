// src/features/booking/types/booking.types.ts

// ==================== CORE BOOKING TYPES ====================

export interface Booking {
    // Core Information
    id: number;
    propertyId: number; // ⚠️ Important: Long, NOT UUID
    tenantId: string; // UUID from Auth Service
    tenantWalletAddress: string; // Snapshot of wallet at booking time

    // Dates
    startDate: string; // Format: "2026-02-01"
    endDate: string;   // Format: "2026-02-05"

    // Pricing
    pricePerNight: number; // Snapshot at booking time
    totalPrice: number;
    currency: string; // "MAD", "USD", etc.

    // Status
    status: BookingStatus;

    // Timestamps
    createdAt: string;
    updatedAt: string;
}

export interface BookingSummary {
    id: number;
    propertyId: number;
    startDate: string;
    endDate: string;
    status: BookingStatus;
    totalPrice: number;
    currency: string;
    createdAt: string;
    updatedAt: string;
}

// ==================== ENRICHED BOOKING TYPES ====================

export interface EnrichedBooking extends Booking {
    // Property details (from Listing Service)
    propertyTitle: string;
    propertyAddress: string;
    propertyCity: string;
    propertyCountry: string;
    propertyImage?: string;

    // Calculated fields (frontend)
    numberOfNights: number;
    expiresAt?: string; // For AWAITING_PAYMENT status
    timeLeft?: TimeLeft; // For timer display
}

export interface TimeLeft {
    minutes: number;
    seconds: number;
    expired: boolean;
}

// ==================== ENUMS ====================

export type BookingStatus =
    | 'AWAITING_PAYMENT'  // Active, waiting for payment (15 min timeout)
    | 'CONFIRMED'         // Payment successful
    | 'CANCELLED'         // Manually cancelled
    | 'EXPIRED'           // Payment timeout (auto)
    | 'PENDING';          // ⚠️ NOT USED in current implementation

// ==================== REQUEST TYPES ====================

export interface CreateBookingInput {
    propertyId: number; // ⚠️ Long, NOT UUID
    startDate: string;  // Format: "YYYY-MM-DD"
    endDate: string;    // Format: "YYYY-MM-DD"
    // ⚠️ Important: NO numberOfGuests field
}

// ==================== RESPONSE TYPES ====================

export interface BookingCreateResponse extends Booking {
    // Same as Booking for now
}

export interface BookingCancelResponse {
    id: number;
    status: BookingStatus;
    message: string;
}

export interface BookingCountResponse {
    count: number;
    userId: string;
    message: string;
}

// ==================== VALIDATION TYPES ====================

export interface BookingValidation {
    isValid: boolean;
    errors: string[];
    canBook: boolean;
}

// ==================== STATUS HELPER TYPES ====================

export interface StatusInfo {
    displayName: string;
    colorClass: string;
    badgeClass: string;
    canCancel: boolean;
    canPay: boolean;
    isExpired: boolean;
    showTimer: boolean;
}

// ==================== ERROR TYPES ====================

export interface BookingError {
    timestamp: string;
    status: number;
    error: string;
    message: string;
}

// ==================== CONSTANTS ====================

export const BOOKING_CONSTANTS = {
    PAYMENT_TIMEOUT_MINUTES: 15,
    PAYMENT_TIMEOUT_MS: 15 * 60 * 1000, // 15 minutes in milliseconds

    STATUS: {
        AWAITING_PAYMENT: 'AWAITING_PAYMENT' as BookingStatus,
        CONFIRMED: 'CONFIRMED' as BookingStatus,
        CANCELLED: 'CANCELLED' as BookingStatus,
        EXPIRED: 'EXPIRED' as BookingStatus,
        PENDING: 'PENDING' as BookingStatus,
    },

    CURRENCY: {
        MAD: 'MAD',
        USD: 'USD',
        EUR: 'EUR',
    },

    VALIDATION: {
        START_DATE_FUTURE: 'Start date must be in the future',
        END_DATE_AFTER_START: 'End date must be after start date',
        WALLET_REQUIRED: 'You must connect your wallet before creating a booking',
        PROPERTY_ACTIVE: 'Property must be active to book',
        NO_OVERLAP: 'Property already booked for these dates',
        MAX_BOOKING_DAYS: 30, // Example: maximum booking duration
    }
} as const;

// ==================== UTILITY TYPES ====================

export interface DateRange {
    startDate: Date;
    endDate: Date;
}

export interface PropertyAvailability {
    propertyId: number;
    availableDates: DateRange[];
    bookedDates: DateRange[];
}