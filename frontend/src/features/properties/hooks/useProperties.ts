import { useState, useCallback } from "react";
import { PropertyService } from "../services";
import { Property } from "../types";

export interface UsePropertyState {
  properties: Property[];
  loading: boolean;
  error: string | null;
  success: string | null;
}

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchAllProperties = useCallback(async (page = 0, size = 20) => {
    setLoading(true);
    setError(null);
    try {
      const data = await PropertyService.getAllProperties(page, size);
      setProperties(data.content || []);
      setSuccess("Properties fetched successfully");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch properties");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await PropertyService.getMyProperties();
      setProperties(data);
      setSuccess("My properties fetched successfully");
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to fetch my properties"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const searchProperties = useCallback(async (filters: any) => {
    setLoading(true);
    setError(null);
    try {
      const data = await PropertyService.searchProperties(filters);
      // Handle both PageableResponse and Property[]
      if (Array.isArray(data)) {
        setProperties(data);
      } else {
        setProperties(data.content || []);
      }
      setSuccess("Properties searched successfully");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to search properties");
    } finally {
      setLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  return {
    properties,
    loading,
    error,
    success,
    fetchAllProperties,
    fetchMyProperties,
    searchProperties,
    clearMessages,
  };
};
