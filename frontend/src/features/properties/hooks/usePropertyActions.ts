import { useState, useCallback } from "react";
import { PropertyService } from "../services";
import { CreatePropertyRequest, UpdatePropertyRequest, PropertyStatus } from "../types";

export const useCreateProperty = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const createProperty = useCallback(async (data: CreatePropertyRequest) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await PropertyService.createProperty(data);
      setSuccess("Property created successfully!");
      return response;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create property";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  return { createProperty, loading, error, success, clearMessages };
};

export const usePropertyDetails = (id: string) => {
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPropertyDetails = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await PropertyService.getPropertyById(id);
      setProperty(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to fetch property details"
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  return { property, loading, error, fetchPropertyDetails };
};

export const useUpdateProperty = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const updateProperty = useCallback(
    async (id: string, data: UpdatePropertyRequest) => {
      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        const response = await PropertyService.updateProperty(
          id,
          data
        );
        setSuccess("Property updated successfully!");
        return response;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || "Failed to update property";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  return { updateProperty, loading, error, success, clearMessages };
};

export const usePropertyStatus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const updateStatus = useCallback(
    async (
      id: string,
      status: PropertyStatus
    ) => {
      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        const response = await PropertyService.updatePropertyStatus(
          id,
          status
        );
        setSuccess(`Property status updated to ${status}`);
        return response;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || "Failed to update property status";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  return {
    updateStatus,
    loading,
    error,
    success,
    clearMessages,
  };
};

export const useDeleteProperty = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const deleteProperty = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await PropertyService.deleteProperty(id);
      setSuccess("Property deleted successfully");
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || "Failed to delete property";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  return { deleteProperty, loading, error, success, clearMessages };
};
