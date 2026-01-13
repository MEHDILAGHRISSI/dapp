import { publicApiClient } from "@/lib/api/publicApiClient";
import { Property } from "../types";

export const propertyDetailsService = {
  /**
   * Get property details by ID
   */
  getPropertyById: async (id: string): Promise<Property> => {
    try {
      const response = await publicApiClient.get<Property>(
        `listings/properties/${id}`
      );
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to fetch property ${id}:`, error);
      throw error;
    }
  },
};
