// src/features/booking/services/booking.service.ts
import { privateApiClient } from "@/lib/api/privateApiClient";
import { publicApiClient } from "@/lib/api/publicApiClient";
import {
    Booking,
    EnrichedBooking,
    CreateBookingInput,
    BookingCreateResponse,
    BookingCancelResponse,
    BookingCountResponse,
    BookingStatus,
    TimeLeft,
    BookingError,
    BOOKING_CONSTANTS
} from "../types/booking.types";

export const BookingService = {
    // ==================== BOOKING MANAGEMENT ====================

    /**
     * 1. CREATE A NEW BOOKING
     * POST /api/bookings
     * Requires: Wallet connected
     */
    createBooking: async (bookingData: CreateBookingInput): Promise<BookingCreateResponse> => {
        try {
            const response = await privateApiClient.post('/bookings', bookingData);
            return response.data as BookingCreateResponse;
        } catch (error: any) {
            console.error("Failed to create booking:", error);

            // Handle specific error cases
            if (error.response?.status === 400) {
                if (error.response.data.message.includes("Wallet Not Connected")) {
                    throw new Error("You must connect your wallet before creating a booking. Please go to your profile settings and connect your Web3 wallet.");
                }
                if (error.response.data.message.includes("Start date")) {
                    throw new Error(error.response.data.message);
                }
                if (error.response.data.message.includes("End date")) {
                    throw new Error(error.response.data.message);
                }
            }

            if (error.response?.status === 409) {
                throw new Error("Property already booked for these dates. Please choose different dates.");
            }

            throw new Error(error?.response?.data?.message || "Failed to create booking");
        }
    },

    /**
     * 2. GET MY BOOKINGS
     * GET /api/bookings/my-bookings
     */
    getMyBookings: async (): Promise<Booking[]> => {
        try {
            const response = await privateApiClient.get('/bookings/my-bookings');
            return response.data as Booking[];
        } catch (error: any) {
            console.error("Failed to fetch bookings:", error);
            throw new Error(error?.response?.data?.message || "Failed to fetch your bookings");
        }
    },

    /**
     * 3. GET BOOKING DETAILS
     * GET /api/bookings/{bookingId}
     */
    getBookingById: async (bookingId: number): Promise<Booking> => {
        try {
            const response = await privateApiClient.get(`/bookings/${bookingId}`);
            return response.data as Booking;
        } catch (error: any) {
            if (error.response?.status === 403) {
                throw new Error("You are not authorized to view this booking");
            }
            if (error.response?.status === 404) {
                throw new Error("Booking not found");
            }
            console.error("Failed to fetch booking:", error);
            throw new Error(error?.response?.data?.message || "Failed to fetch booking details");
        }
    },

    /**
     * 4. CANCEL A BOOKING
     * PATCH /api/bookings/{bookingId}/cancel
     */
    cancelBooking: async (bookingId: number): Promise<BookingCancelResponse> => {
        try {
            const response = await privateApiClient.patch(`/bookings/${bookingId}/cancel`);
            return response.data as BookingCancelResponse;
        } catch (error: any) {
            if (error.response?.status === 400) {
                throw new Error(error.response.data.message || "Cannot cancel booking");
            }
            if (error.response?.status === 403) {
                throw new Error("You are not authorized to cancel this booking");
            }
            console.error("Failed to cancel booking:", error);
            throw new Error(error?.response?.data?.message || "Failed to cancel booking");
        }
    },

    // ==================== COUNT ENDPOINTS ====================

    /**
     * 5. COUNT ACTIVE BOOKINGS AS CLIENT
     * GET /api/bookings/client/{userId}/active-count
     */
    getClientActiveBookingsCount: async (userId: string): Promise<BookingCountResponse> => {
        try {
            const response = await privateApiClient.get(`/bookings/client/${userId}/active-count`);
            return response.data as BookingCountResponse;
        } catch (error: any) {
            console.error("Failed to count active bookings:", error);
            throw new Error(error?.response?.data?.message || "Failed to count active bookings");
        }
    },

    /**
     * 6. COUNT FUTURE BOOKINGS AS HOST
     * GET /api/bookings/host/{userId}/future-count
     * ⚠️ WARNING: Currently returns always 0 due to backend limitations
     */
    getHostFutureBookingsCount: async (userId: string): Promise<BookingCountResponse> => {
        try {
            const response = await privateApiClient.get(`/bookings/host/${userId}/future-count`);
            return response.data as BookingCountResponse;
        } catch (error: any) {
            console.error("Failed to count future host bookings:", error);
            throw new Error(error?.response?.data?.message || "Failed to count future host bookings");
        }
    },

    // ==================== ENRICHMENT METHODS ====================

    /**
     * Enrich booking with property details
     * This is a frontend-only operation since backend doesn't return property details
     */
    enrichBooking: async (booking: Booking, token: string): Promise<EnrichedBooking> => {
        try {
            // Fetch property details from Listing Service
            const propertyResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082'}/api/listings/properties/${booking.propertyId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            let propertyTitle = 'Property not available';
            let propertyAddress = 'Address not available';
            let propertyCity = 'City not available';
            let propertyCountry = 'Country not available';
            let propertyImage = '/default-property.jpg';

            if (propertyResponse.ok) {
                const property = await propertyResponse.json();
                propertyTitle = property.title;
                propertyAddress = property.addressName;
                propertyCity = property.city;
                propertyCountry = property.country;
                propertyImage = property.images?.[0] || '/default-property.jpg';
            }

            // Calculate derived fields
            const start = new Date(booking.startDate);
            const end = new Date(booking.endDate);
            const numberOfNights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

            // Calculate expiration time for AWAITING_PAYMENT status
            let expiresAt: string | undefined;
            let timeLeft: TimeLeft | undefined;

            if (booking.status === BOOKING_CONSTANTS.STATUS.AWAITING_PAYMENT) {
                const created = new Date(booking.createdAt);
                expiresAt = new Date(created.getTime() + BOOKING_CONSTANTS.PAYMENT_TIMEOUT_MS).toISOString();
                timeLeft = BookingService.calculateTimeLeft(booking.createdAt);
            }

            return {
                ...booking,
                propertyTitle,
                propertyAddress,
                propertyCity,
                propertyCountry,
                propertyImage,
                numberOfNights,
                expiresAt,
                timeLeft
            };

        } catch (error) {
            console.error("Error enriching booking:", error);
            // Return basic enriched booking even if property fetch fails
            const start = new Date(booking.startDate);
            const end = new Date(booking.endDate);
            const numberOfNights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

            return {
                ...booking,
                propertyTitle: 'Property not available',
                propertyAddress: 'Address not available',
                propertyCity: 'City not available',
                propertyCountry: 'Country not available',
                propertyImage: '/default-property.jpg',
                numberOfNights
            };
        }
    },

    /**
     * Enrich multiple bookings
     */
    enrichBookings: async (bookings: Booking[], token: string): Promise<EnrichedBooking[]> => {
        const enrichedBookings = await Promise.all(
            bookings.map((booking) => BookingService.enrichBooking(booking, token))
        );
        return enrichedBookings;
    },

    // ==================== UTILITY METHODS ====================

    /**
     * Calculate time left for AWAITING_PAYMENT bookings
     */
    calculateTimeLeft: (createdAt: string): TimeLeft => {
        const created = new Date(createdAt);
        const expires = new Date(created.getTime() + BOOKING_CONSTANTS.PAYMENT_TIMEOUT_MS);
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
     * Check if booking is expired (for AWAITING_PAYMENT status)
     */
    isBookingExpired: (createdAt: string): boolean => {
        const created = new Date(createdAt);
        const expires = new Date(created.getTime() + BOOKING_CONSTANTS.PAYMENT_TIMEOUT_MS);
        const now = new Date();
        return now > expires;
    },

    /**
     * Get display name for booking status
     */
    getStatusDisplayName: (status: BookingStatus): string => {
        const displayNames: Record<BookingStatus, string> = {
            AWAITING_PAYMENT: 'Awaiting Payment',
            CONFIRMED: 'Confirmed',
            CANCELLED: 'Cancelled',
            EXPIRED: 'Expired',
            PENDING: 'Pending'
        };
        return displayNames[status] || status;
    },

    /**
     * Get CSS classes for status badge
     */
    getStatusBadgeClass: (status: BookingStatus): string => {
        const badgeClasses: Record<BookingStatus, string> = {
            AWAITING_PAYMENT: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            CONFIRMED: 'bg-green-100 text-green-800 border-green-200',
            CANCELLED: 'bg-red-100 text-red-800 border-red-200',
            EXPIRED: 'bg-gray-100 text-gray-800 border-gray-200',
            PENDING: 'bg-blue-100 text-blue-800 border-blue-200'
        };
        return badgeClasses[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    },

    /**
     * Check if booking can be cancelled
     */
    canCancelBooking: (booking: Booking): boolean => {
        const now = new Date();
        const startDate = new Date(booking.startDate);

        // Can cancel if:
        // 1. Status is AWAITING_PAYMENT
        // 2. Status is CONFIRMED AND start date is in the future
        if (booking.status === BOOKING_CONSTANTS.STATUS.AWAITING_PAYMENT) {
            return true;
        }

        if (booking.status === BOOKING_CONSTANTS.STATUS.CONFIRMED) {
            return now < startDate;
        }

        return false;
    },

    /**
     * Check if booking can be paid
     */
    canPayBooking: (booking: Booking): boolean => {
        return booking.status === BOOKING_CONSTANTS.STATUS.AWAITING_PAYMENT &&
            !BookingService.isBookingExpired(booking.createdAt);
    },

    /**
     * Calculate total price based on nights and price per night
     */
    calculateTotalPrice: (pricePerNight: number, startDate: string, endDate: string): number => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const numberOfNights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return pricePerNight * numberOfNights;
    },

    /**
     * Format date for display
     */
    formatDate: (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    /**
     * Get booking duration in nights
     */
    getNumberOfNights: (startDate: string, endDate: string): number => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    },

    /**
     * Validate booking dates before creation
     */
    validateBookingDates: (startDate: string, endDate: string): { isValid: boolean; errors: string[] } => {
        const errors: string[] = [];
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start <= now) {
            errors.push(BOOKING_CONSTANTS.VALIDATION.START_DATE_FUTURE);
        }

        if (end <= start) {
            errors.push(BOOKING_CONSTANTS.VALIDATION.END_DATE_AFTER_START);
        }

        const maxDays = BOOKING_CONSTANTS.VALIDATION.MAX_BOOKING_DAYS;
        const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff > maxDays) {
            errors.push(`Maximum booking duration is ${maxDays} days`);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
};