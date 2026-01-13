import { useState, useCallback, useEffect } from "react";
import { propertyDetailsService } from "../services/propertyDetailsService";
import { Property } from "../types";

interface UsePropertyDetailsState {
  property: Property | null;
  loading: boolean;
  error: string | null;
}

export const usePropertyDetails = (id?: string) => {
  const [state, setState] = useState<UsePropertyDetailsState>({
    property: null,
    loading: false,
    error: null,
  });

  const fetchPropertyDetails = useCallback(async (propertyId: string) => {
    if (!propertyId) {
      setState({
        property: null,
        loading: false,
        error: "Property ID is required",
      });
      return;
    }

    setState({ property: null, loading: true, error: null });
    try {
      const property = await propertyDetailsService.getPropertyById(propertyId);
      setState({ property, loading: false, error: null });
      console.log(`✅ Loaded property details: ${property.title}`);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to load property details";
      setState({
        property: null,
        loading: false,
        error: errorMessage,
      });
      console.error("❌ Failed to fetch property details:", errorMessage);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchPropertyDetails(id);
    }
  }, [id, fetchPropertyDetails]);

  return {
    ...state,
    fetchPropertyDetails,
    refetch: () => {
      if (id) {
        fetchPropertyDetails(id);
      }
    },
  };
};
