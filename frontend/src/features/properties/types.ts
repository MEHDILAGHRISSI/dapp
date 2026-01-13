export type PropertyType =
    | "APARTMENT"
    | "HOUSE"
    | "VILLA"
    | "STUDIO"
    | "ROOM";

export type PropertyStatus =
    | "ACTIVE"
    | "INACTIVE"
    | "PENDING"
    | "BLOCKED";

export type PropertyAmenity =
    | "WIFI"
    | "TV"
    | "KITCHEN"
    | "WASHER"
    | "DRYER"
    | "AIR_CONDITIONING"
    | "HEATING"
    | "PARKING"
    | "POOL"
    | "GYM"
    | "ELEVATOR"
    | "BALCONY"
    | "GARDEN";

export interface Property {
    id: string;
    title: string;
    description?: string;
    propertyType: PropertyType;
    address?: string;
    city: string;
    state?: string;
    country?: string;
    zipCode?: string;
    latitude?: number;
    longitude?: number;
    pricePerNight: number;
    bedrooms: number;
    bathrooms: number;
    maxGuests: number;
    amenities: PropertyAmenity[];
    images: string[];
    ownerId?: string;
    ownerName?: string;
    status: PropertyStatus;
    rating?: number;
    reviewsCount?: number;
    createdAt: string;
    updatedAt?: string;
}

export interface CreatePropertyRequest {
    title: string;
    description: string;
    propertyType: PropertyType; // User spec says "propertyType"
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    latitude: number;
    longitude: number;
    pricePerNight: number;
    bedrooms: number;
    bathrooms: number;
    maxGuests: number;
    amenities: PropertyAmenity[];
}

export interface UpdatePropertyRequest {
    title?: string;
    description?: string;
    pricePerNight?: number;
    amenities?: PropertyAmenity[];
}

export interface PropertySearchFilters {
    city?: string;
    country?: string;
    propertyType?: PropertyType;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    maxGuests?: number;
    amenities?: string; // Comma separated
    page?: number;
    size?: number;
    sort?: string;
}

export interface PageableResponse<T> {
    content: T[];
    pageable: {
        pageNumber: number;
        pageSize: number;
    };
    totalElements: number;
    totalPages: number;
}
