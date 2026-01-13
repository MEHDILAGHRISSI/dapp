
// src/features/host/services/host.services.ts
import { privateApiClient } from "@/lib/api/privateApiClient";
import {
    Property,
    PropertyStatus
} from "@/features/properties/types/properties.types";
import {
    CreatePropertyInput,
    UpdatePropertyInput,
    PropertyCreateResponse,
    PropertyActionResponse,
    PropertyCountResponse,
    ImageUploadResponse
} from "../types/host.types";

export const HostService = {
    // ==================== HOST ENDPOINTS (Property Owner) ====================

    /**
     * 5. CREATE A NEW PROPERTY
     * POST /api/listings/properties
     * Requires: Wallet connected & HOST role
     */
    createProperty: async (propertyData: CreatePropertyInput): Promise<PropertyCreateResponse> => {
        try {
            const response = await privateApiClient.post('/listings/properties', propertyData);
            return response.data;
        } catch (error: any) {
            console.error("Failed to create property:", error);

            if (error.response?.status === 403) {
                throw new Error("You must connect a wallet to create a property");
            }

            if (error.response?.status === 400) {
                const errorMessage = error.response.data.message;
                if (errorMessage.includes("Description")) {
                    throw new Error("Description must be between 50 and 2000 characters");
                }
                throw new Error(errorMessage || "Validation failed");
            }

            throw new Error(error?.response?.data?.message || "Failed to create property");
        }
    },

    /**
     * 6. GET MY PROPERTIES
     * GET /api/listings/properties/my-properties
     */
    getMyProperties: async (): Promise<Property[]> => {
        try {
            const response = await privateApiClient.get('/listings/properties/my-properties');
            return response.data;
        } catch (error: any) {
            console.error("Failed to fetch my properties:", error);
            throw new Error(error?.response?.data?.message || "Failed to fetch your properties");
        }
    },

    /**
     * 7. UPDATE A PROPERTY
     * PUT /api/listings/properties/{propertyId}
     */
    updateProperty: async (
        propertyId: string,
        updateData: UpdatePropertyInput
    ): Promise<Property> => {
        try {
            const response = await privateApiClient.put(
                `/listings/properties/${propertyId}`,
                updateData
            );
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 403) {
                throw new Error("You are not the owner of this property");
            }
            if (error.response?.status === 400) {
                throw new Error(error.response.data.message || "Invalid update data");
            }
            console.error("Failed to update property:", error);
            throw new Error(error?.response?.data?.message || "Failed to update property");
        }
    },

    /**
     * 8. SUBMIT PROPERTY FOR VALIDATION
     * POST /api/listings/properties/{propertyId}/submit
     */
    submitProperty: async (propertyId: string): Promise<PropertyActionResponse> => {
        try {
            const response = await privateApiClient.post(
                `/listings/properties/${propertyId}/submit`
            );
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 400) {
                const errorMessage = error.response.data.error;
                if (errorMessage.includes("Only DRAFT properties")) {
                    throw new Error(`Only DRAFT properties can be submitted. Current status: ${errorMessage.split(': ')[1]}`);
                }
            }
            console.error("Failed to submit property:", error);
            throw new Error(error?.response?.data?.message || "Failed to submit property");
        }
    },

    /**
     * 9. HIDE A PROPERTY
     * POST /api/listings/properties/{propertyId}/hide
     */
    hideProperty: async (propertyId: string): Promise<PropertyActionResponse> => {
        try {
            const response = await privateApiClient.post(
                `/listings/properties/${propertyId}/hide`
            );
            return response.data;
        } catch (error: any) {
            console.error("Failed to hide property:", error);
            throw new Error(error?.response?.data?.message || "Failed to hide property");
        }
    },

    /**
     * 10. SHOW A HIDDEN PROPERTY
     * POST /api/listings/properties/{propertyId}/show
     */
    showProperty: async (propertyId: string): Promise<PropertyActionResponse> => {
        try {
            const response = await privateApiClient.post(
                `/listings/properties/${propertyId}/show`
            );
            return response.data;
        } catch (error: any) {
            console.error("Failed to show property:", error);
            throw new Error(error?.response?.data?.message || "Failed to show property");
        }
    },

    /**
     * 11. DELETE (SOFT DELETE) A PROPERTY
     * DELETE /api/listings/properties/{propertyId}
     */
    deleteProperty: async (propertyId: string): Promise<{ message: string }> => {
        try {
            const response = await privateApiClient.delete(
                `/listings/properties/${propertyId}`
            );
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 409) {
                throw new Error("Cannot delete property with active bookings");
            }
            console.error("Failed to delete property:", error);
            throw new Error(error?.response?.data?.message || "Failed to delete property");
        }
    },

    /**
     * 12A. COUNT PROPERTIES FOR OWNER (Non-Deleted)
     * GET /api/listings/properties/owner/{ownerId}/count
     */
    getOwnerPropertiesCount: async (ownerId: string): Promise<PropertyCountResponse> => {
        try {
            const response = await privateApiClient.get(
                `/listings/properties/owner/${ownerId}/count`
            );
            return response.data;
        } catch (error: any) {
            console.error("Failed to count owner properties:", error);
            throw new Error(error?.response?.data?.message || "Failed to count properties");
        }
    },

    /**
     * 12B. COUNT ACTIVE PROPERTIES FOR OWNER
     * GET /api/listings/properties/owner/{ownerId}/active-count
     */
    getOwnerActivePropertiesCount: async (ownerId: string): Promise<PropertyCountResponse> => {
        try {
            const response = await privateApiClient.get(
                `/listings/properties/owner/${ownerId}/active-count`
            );
            return response.data;
        } catch (error: any) {
            console.error("Failed to count active properties:", error);
            throw new Error(error?.response?.data?.message || "Failed to count active properties");
        }
    },

    // ==================== IMAGE MANAGEMENT ====================

    /**
     * UPLOAD PROPERTY IMAGES
     * POST /api/listings/properties/{propertyId}/images
     * Content-Type: multipart/form-data
     */
    uploadPropertyImages: async (
        propertyId: string,
        images: File[]
    ): Promise<ImageUploadResponse> => {
        try {
            const formData = new FormData();
            images.forEach((image) => {
                formData.append('images', image);
            });

            const response = await privateApiClient.post(
                `/listings/properties/${propertyId}/images`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        } catch (error: any) {
            console.error("Failed to upload images:", error);

            if (error.response?.status === 400) {
                const errorMessage = error.response.data.message;
                if (errorMessage.includes("maximum")) {
                    throw new Error("Maximum 10 images per property");
                }
                if (errorMessage.includes("size")) {
                    throw new Error("Maximum file size is 10MB");
                }
            }

            throw new Error(error?.response?.data?.message || "Failed to upload images");
        }
    },

    // ==================== STATUS HELPER METHODS ====================

    /**
     * Check if status is publicly visible
     */
    isPubliclyVisible: (status: PropertyStatus): boolean => {
        return status === 'ACTIVE';
    },

    /**
     * Check if status can accept bookings
     */
    canAcceptBookings: (status: PropertyStatus): boolean => {
        return status === 'ACTIVE';
    },

    /**
     * Check if status is editable
     */
    isEditable: (status: PropertyStatus): boolean => {
        return status === 'DRAFT' || status === 'PENDING';
    },

    /**
     * Check if status is deleted
     */
    isDeleted: (status: PropertyStatus): boolean => {
        return status === 'DELETED';
    },

    /**
     * Check if status needs validation
     */
    needsValidation: (status: PropertyStatus): boolean => {
        return status === 'PENDING';
    },

    /**
     * Check if transition is allowed
     */
    canTransitionTo: (current: PropertyStatus, newStatus: PropertyStatus): boolean => {
        const allowedTransitions: Record<PropertyStatus, PropertyStatus[]> = {
            DRAFT: ['PENDING', 'DELETED'],
            PENDING: ['ACTIVE', 'DRAFT', 'DELETED'],
            ACTIVE: ['HIDDEN', 'DELETED'],
            HIDDEN: ['ACTIVE', 'DELETED'],
            DELETED: [] // No transitions from DELETED
        };

        return allowedTransitions[current]?.includes(newStatus) ?? false;
    },

    /**
     * Get allowed transitions for current status
     */
    getAllowedTransitions: (currentStatus: PropertyStatus): PropertyStatus[] => {
        const transitions: Record<PropertyStatus, PropertyStatus[]> = {
            DRAFT: ['PENDING', 'DELETED'],
            PENDING: ['ACTIVE', 'DRAFT', 'DELETED'],
            ACTIVE: ['HIDDEN', 'DELETED'],
            HIDDEN: ['ACTIVE', 'DELETED'],
            DELETED: []
        };

        return transitions[currentStatus] || [];
    },

    /**
     * Get status display name
     */
    getStatusDisplayName: (status: PropertyStatus): string => {
        const displayNames: Record<PropertyStatus, string> = {
            DRAFT: 'Brouillon',
            PENDING: 'En attente',
            ACTIVE: 'Actif',
            HIDDEN: 'Caché',
            DELETED: 'Supprimé'
        };

        return displayNames[status] || status;
    },

    /**
     * Get status color
     */
    getStatusColor: (status: PropertyStatus): string => {
        const colors: Record<PropertyStatus, string> = {
            DRAFT: 'bg-gray-100 text-gray-800',
            PENDING: 'bg-yellow-100 text-yellow-800',
            ACTIVE: 'bg-green-100 text-green-800',
            HIDDEN: 'bg-blue-100 text-blue-800',
            DELETED: 'bg-red-100 text-red-800'
        };

        return colors[status] || 'bg-gray-100 text-gray-800';
    }
};
