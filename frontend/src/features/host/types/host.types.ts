
import {
    Property,
    PropertyType,
    PropertyStatus
} from "@/features/properties/types/properties.types";

// ==================== CREATE & UPDATE TYPES ====================

export interface CreatePropertyInput {
    title: string;
    type: PropertyType;
    description: string;
    addressName: string;
    city: string;
    country: string;
    state?: string;
    codePostale?: string;
    latitude: number;
    longitude: number;
    pricePerNight: number;
    nbOfGuests: number;
    nbOfBedrooms: number;
    nbOfBeds: number;
    nbOfBathrooms: number;
    characteristics: CharacteristicInput[]; // Array of { id: number }
}

export interface PropertyFormData extends CreatePropertyInput {
    rawImages?: File[];
}

export interface CharacteristicInput {
    id: number;
}

export interface UpdatePropertyInput {
    title?: string;
    type?: PropertyType;
    description?: string;
    addressName?: string;
    city?: string;
    country?: string;
    state?: string;
    codePostale?: string;
    latitude?: number;
    longitude?: number;
    pricePerNight?: number;
    nbOfGuests?: number;
    nbOfBedrooms?: number;
    nbOfBeds?: number;
    nbOfBathrooms?: number;
    characteristics?: CharacteristicInput[];
    rawImages?: File[];
}

// ==================== RESPONSE TYPES ====================

export interface PropertyCreateResponse {
    message: string;
    property: Property;
}

export interface PropertyActionResponse {
    propertyId: string;
    status: PropertyStatus;
    message: string;
}

export interface ImageUploadResponse {
    message: string;
    imagePaths: string[];
}

export interface PropertyCountResponse {
    count: number;
}

// ==================== VALIDATION CONSTANTS ====================

export const PROPERTY_VALIDATION = {
    TITLE: {
        MIN_LENGTH: 5,
        MAX_LENGTH: 100
    },
    DESCRIPTION: {
        MIN_LENGTH: 50,
        MAX_LENGTH: 2000
    },
    PRICE: {
        MIN: 0.01
    },
    GUESTS: {
        MIN: 1
    },
    COORDINATES: {
        LATITUDE: {
            MIN: -90,
            MAX: 90
        },
        LONGITUDE: {
            MIN: -180,
            MAX: 180
        }
    }
} as const;
