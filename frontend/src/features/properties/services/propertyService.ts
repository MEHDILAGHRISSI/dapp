import { publicApiClient } from "@/lib/api/publicApiClient";
import { privateApiClient } from "@/lib/api/privateApiClient";
import {
  Property,
  PropertySearchFilters,
  PageableResponse,
  CreatePropertyRequest,
  UpdatePropertyRequest,
  PropertyStatus
} from "../types";

// Public Services
export const publicPropertiesService = {
  /**
   * Get all active properties with pagination
   */
  getAllProperties: async (
    page: number = 0,
    size: number = 20,
    sort: string = "createdAt,desc"
  ): Promise<PageableResponse<Property>> => {
    try {
      const response = await publicApiClient.get<PageableResponse<Property>>(
        "listings/properties",
        {
          params: {
            page,
            size,
            sort,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch properties:", error);
      throw error;
    }
  },

  /**
   * Search properties with filters (ACTIVE only)
   */
  searchProperties: async (
    filters: PropertySearchFilters
  ): Promise<PageableResponse<Property>> => {
    try {
      const response = await publicApiClient.get<PageableResponse<Property>>(
        "listings/properties/search",
        {
          params: filters,
        }
      );
      return response.data;
    } catch (error) {
      console.error("❌ Failed to search properties:", error);
      throw error;
    }
  },

  /**
   * Find Nearby Properties
   */
  findNearbyProperties: async (
    latitude: number,
    longitude: number,
    radius: number = 10,
    limit: number = 20
  ): Promise<Property[]> => {
    try {
      const response = await publicApiClient.get<Property[]>(
        "listings/properties/nearby",
        {
          params: {
            latitude,
            longitude,
            radius,
            limit
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch nearby properties:", error);
      throw error;
    }
  },

  /**
   * Search properties by city
   */
  searchByCity: async (
    city: string,
    page: number = 0,
    size: number = 20
  ): Promise<PageableResponse<Property>> => {
    return publicPropertiesService.searchProperties({
      city,
      page,
      size,
    });
  },

  /**
   * Filter properties by price range
   */
  filterByPrice: async (
    minPrice: number,
    maxPrice: number,
    page: number = 0,
    size: number = 20
  ): Promise<PageableResponse<Property>> => {
    return publicPropertiesService.searchProperties({
      minPrice,
      maxPrice,
      page,
      size,
    });
  },
};

// Private (Host) Services
class PrivatePropertyService {
  private baseURL = "/listings";

  /**
   * Create a new property
   * Endpoint: POST /properties
   */
  async createProperty(data: CreatePropertyRequest): Promise<Property> {
    try {
      const response = await privateApiClient.post<Property>(
        `/listings/properties`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error creating property:", error);
      throw error;
    }
  }

  /**
   * Get all active properties
   * Endpoint: GET /properties
   */
  async getAllProperties(
    page = 0,
    size = 20,
    sort = "createdAt,desc"
  ): Promise<PageableResponse<Property>> {
    try {
      const response = await privateApiClient.get<PageableResponse<Property>>(
        `/listings/properties`,
        {
          params: { page, size, sort },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching properties:", error);
      throw error;
    }
  }

  /**
   * Get property details by ID
   * Endpoint: GET /properties/{id}
   */
  async getPropertyById(id: string): Promise<Property> {
    try {
      const response = await privateApiClient.get<Property>(
        `/listings/properties/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching property details:", error);
      throw error;
    }
  }

  /**
   * Get My Properties
   * Endpoint: GET /properties/my-properties
   */
  async getMyProperties(): Promise<Property[]> {
    try {
      const response = await privateApiClient.get<Property[]>(
        `/listings/properties/my-properties`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching my properties:", error);
      throw error;
    }
  }

  /**
   * Get Properties By Owner
   * Endpoint: GET /properties/owner/{ownerId}
   */
  async getPropertiesByOwner(ownerId: string): Promise<Property[]> {
    try {
      const response = await privateApiClient.get<Property[]>(
        `/listings/properties/owner/${ownerId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching owner properties:", error);
      throw error;
    }
  }

  /**
   * Search properties with filters
   * Endpoint: GET /properties/search
   */
  async searchProperties(
    filters: PropertySearchFilters
  ): Promise<PageableResponse<Property> | Property[]> {
    try {
      const response = await privateApiClient.get(
        `/listings/properties/search`,
        {
          params: filters,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error searching properties:", error);
      throw error;
    }
  }

  /**
   * Update property status
   * Endpoint: PATCH /properties/{id}/status
   */
  async updatePropertyStatus(
    id: string,
    status: PropertyStatus
  ): Promise<Property> {
    try {
      const response = await privateApiClient.patch<Property>(
        `/listings/properties/${id}/status`,
        { status }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating property status:", error);
      throw error;
    }
  }

  /**
   * Update property
   * Endpoint: PUT /properties/{id}
   */
  async updateProperty(
    id: string,
    data: UpdatePropertyRequest
  ): Promise<Property> {
    try {
      const response = await privateApiClient.put<Property>(
        `/listings/properties/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error updating property:", error);
      throw error;
    }
  }

  /**
   * Delete property
   * Endpoint: DELETE /properties/{id}
   */
  async deleteProperty(id: string): Promise<void> {
    try {
      await privateApiClient.delete(`/listings/properties/${id}`);
    } catch (error) {
      console.error("Error deleting property:", error);
      throw error;
    }
  }

  /**
   * Upload images
   * Endpoint: POST /properties/{id}/images
   */
  async uploadImages(id: string, images: File[]): Promise<{ propertyId: string; uploadedImages: string[] }> {
    try {
      const formData = new FormData();
      images.forEach((image) => {
        formData.append("images", image);
      });

      const response = await privateApiClient.post(
        `/listings/properties/${id}/images`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error uploading images:", error);
      throw error;
    }
  }

  /**
   * Delete images
   * Endpoint: DELETE /properties/{id}/images
   */
  async deleteImages(id: string, imageUrls: string[]): Promise<void> {
    try {
      await privateApiClient.delete(`/listings/properties/${id}/images`, {
        data: { imageUrls },
      });
    } catch (error) {
      console.error("Error deleting images:", error);
      throw error;
    }
  }
}

export const propertyService = new PrivatePropertyService();
