// src/features/properties/services/properties.service.ts
import { publicApiClient } from "@/lib/api/publicApiClient";
import {
    Property,
    PropertySummary,
    PaginatedResponse,
    SearchFilters,
    NearbySearchFilters,
    Characteristic,
    CharacteristicType
} from "../types/properties.types";

export const PropertiesService = {
    // ==================== PUBLIC ENDPOINTS (No Auth Required) ====================

    /**
     * 1. LIST ALL ACTIVE PROPERTIES
     * GET /api/listings/properties
     */
    getAllProperties: async (
        page: number = 0,
        size: number = 20,
        sortBy: string = 'createdAt',
        sortDir: string = 'DESC'
    ): Promise<PaginatedResponse<PropertySummary>> => {
        try {
            const response = await publicApiClient.get('/listings/properties', {
                params: { page, size, sortBy, sortDir }
            });
            return response.data;
        } catch (error: any) {
            console.error("Failed to fetch properties:", error);
            throw new Error(error?.response?.data?.message || "Failed to fetch properties");
        }
    },

    /**
     * 2. GET PROPERTY DETAILS
     * GET /api/listings/properties/{propertyId}
     */
    getPropertyById: async (propertyId: string): Promise<Property> => {
        try {
            const response = await publicApiClient.get(`/listings/properties/${propertyId}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw new Error("Property not found");
            }
            console.error("Failed to fetch property details:", error);
            throw new Error(error?.response?.data?.message || "Failed to fetch property details");
        }
    },

    /**
     * 3. SEARCH PROPERTIES WITH FILTERS
     * GET /api/listings/properties/search
     */
    searchProperties: async (filters: SearchFilters): Promise<PaginatedResponse<PropertySummary>> => {
        try {
            // Clean filters - remove undefined/null values
            const cleanFilters = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v != null)
            );

            const response = await publicApiClient.get('/listings/properties/search', {
                params: cleanFilters
            });
            return response.data;
        } catch (error: any) {
            console.error("Failed to search properties:", error);
            throw new Error(error?.response?.data?.message || "Failed to search properties");
        }
    },

    /**
     * 4. NEARBY PROPERTIES SEARCH
     * GET /api/listings/properties/nearby
     */
    getNearbyProperties: async (
        filters: NearbySearchFilters
    ): Promise<PaginatedResponse<PropertySummary>> => {
        try {
            const response = await publicApiClient.get('/listings/properties/nearby', {
                params: filters
            });
            return response.data;
        } catch (error: any) {
            console.error("Failed to fetch nearby properties:", error);
            throw new Error(error?.response?.data?.message || "Failed to fetch nearby properties");
        }
    },

    // ==================== CHARACTERISTICS ====================

    /**
     * 16. GET ALL CHARACTERISTICS
     * GET /api/listings/characteristics
     */
    getAllCharacteristics: async (): Promise<Characteristic[]> => {
        try {
            const response = await publicApiClient.get('/listings/characteristics');
            return response.data;
        } catch (error: any) {
            console.error("Failed to fetch characteristics:", error);
            throw new Error(error?.response?.data?.message || "Failed to fetch characteristics");
        }
    },

    /**
     * 17. GET CHARACTERISTIC TYPES
     * GET /api/listings/type-caracteristiques
     */
    getCharacteristicTypes: async (): Promise<CharacteristicType[]> => {
        try {
            const response = await publicApiClient.get('/listings/type-caracteristiques');
            return response.data;
        } catch (error: any) {
            console.error("Failed to fetch characteristic types:", error);
            throw new Error(error?.response?.data?.message || "Failed to fetch characteristic types");
        }
    }
};
