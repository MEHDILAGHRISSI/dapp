// src/features/properties/types/properties.types.ts

// ==================== CORE PROPERTY TYPES ====================

export interface Property {
    // Core Information
    propertyId: string;
    title: string;
    type: PropertyType;
    description: string;

    // Location
    addressName: string;
    city: string;
    country: string;
    state?: string;
    codePostale?: string;
    latitude: number;
    longitude: number;

    // Pricing & Capacity
    pricePerNight: number;
    nbOfGuests: number;
    nbOfBedrooms: number;
    nbOfBeds: number;
    nbOfBathrooms: number;

    // Status & Ownership
    status: PropertyStatus;
    ownerId: string;
    owner_user_id?: string; // UUID from Auth Service

    // Media
    images?: string[];
    characteristics: Characteristic[];

    // Timestamps
    createdAt: string;
    lastUpdateAt: string;

    // For nearby search
    distance?: number; // in kilometers
}

export interface PropertySummary {
    // For listings/search results
    propertyId: string;
    title: string;
    type: PropertyType;
    pricePerNight: number;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    nbOfGuests: number;
    nbOfBedrooms: number;
    nbOfBeds: number;
    nbOfBathrooms: number;
    status: PropertyStatus;
    images: string[];
    characteristics: Characteristic[];
    ownerId: string;
    createdAt: string;
    lastUpdateAt: string;
}

export interface Characteristic {
    id: number;
    name: string;
    iconPath: string;
    isActive?: boolean;
    typeCaracteristique?: CharacteristicType;
}

export interface CharacteristicType {
    id: number;
    name: string;
    description?: string;
    iconPath?: string;
}

// ==================== ENUMS ====================

export type PropertyType =
    | 'VILLA'
    | 'APARTMENT'
    | 'HOUSE'
    | 'CONDO'
    | 'CABIN'
    | 'TINY_HOUSE'
    | 'CASTLE'
    | 'TREEHOUSE'
    | 'BOAT'
    | 'CAMPER'
    | string; // Allow custom types

export type PropertyStatus =
    | 'DRAFT'      // Brouillon (owner travaille dessus)
    | 'PENDING'    // En attente validation admin
    | 'ACTIVE'     // Validé et visible publiquement
    | 'HIDDEN'     // Validé mais caché temporairement
    | 'DELETED';   // Supprimé (soft delete)

// ==================== SEARCH & FILTER TYPES ====================

export interface SearchFilters {
    city?: string;
    type?: PropertyType;
    minPrice?: number;
    maxPrice?: number;
    nbOfGuests?: number;
    characteristics?: number[]; // Array of characteristic IDs
    page?: number;
    size?: number;
    sortBy?: SortByField;
    sortDir?: SortDirection;
}

export interface NearbySearchFilters {
    latitude: number;
    longitude: number;
    radius?: number; // in kilometers
    page?: number;
    size?: number;
}

export type SortByField =
    | 'createdAt'
    | 'pricePerNight'
    | 'title'
    | 'lastUpdateAt';

export type SortDirection = 'ASC' | 'DESC';

// ==================== PAGINATION TYPES ====================

export interface PaginatedResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number; // Current page number
    size: number;   // Page size
    first: boolean;
    last: boolean;
}

// ==================== CREATE & UPDATE TYPES ====================
// Moved to src/features/host/types/host.types.ts

// ==================== RESPONSE TYPES ====================
// Moved to src/features/host/types/host.types.ts

// ==================== VALIDATION CONSTANTS ====================
// Moved to src/features/host/types/host.types.ts

// ==================== STATUS HELPER TYPES ====================

export interface StatusTransition {
    from: PropertyStatus;
    to: PropertyStatus;
}

// Helper functions type
export type StatusHelper = {
    isPubliclyVisible: (status: PropertyStatus) => boolean;
    canAcceptBookings: (status: PropertyStatus) => boolean;
    isEditable: (status: PropertyStatus) => boolean;
    isDeleted: (status: PropertyStatus) => boolean;
    needsValidation: (status: PropertyStatus) => boolean;
    canTransitionTo: (current: PropertyStatus, newStatus: PropertyStatus) => boolean;
};