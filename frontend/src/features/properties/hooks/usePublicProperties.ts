import { useState, useCallback } from "react";
import { publicPropertiesService } from "../services/PropertyService";
import { Property, PageableResponse } from "../types";

interface UsePublicPropertiesState {
  properties: Property[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  totalElements: number;
}

export const usePublicProperties = () => {
  const [state, setState] = useState<UsePublicPropertiesState>({
    properties: [],
    loading: false,
    error: null,
    totalPages: 0,
    currentPage: 0,
    pageSize: 20,
    totalElements: 0,
  });

  const fetchProperties = useCallback(
    async (
      page: number = 0,
      size: number = 20,
      sortBy: string = "createdAt",
      sortDir: "ASC" | "DESC" = "DESC"
    ) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const sort = `${sortBy},${sortDir.toLowerCase()}`;
        const response: PageableResponse<Property> =
          await publicPropertiesService.getAllProperties(
            page,
            size,
            sort
          );
        setState((prev) => ({
          ...prev,
          properties: response.content,
          totalPages: response.totalPages,
          currentPage: response.pageable.pageNumber,
          pageSize: response.pageable.pageSize,
          totalElements: response.totalElements,
          loading: false,
        }));
        console.log(
          `✅ Fetched ${response.content.length} properties from page ${page}`
        );
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message;
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
        console.error("❌ Failed to fetch properties:", errorMessage);
      }
    },
    []
  );

  const searchProperties = useCallback(async (filters: any) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response: PageableResponse<Property> =
        await publicPropertiesService.searchProperties(filters);
      setState((prev) => ({
        ...prev,
        properties: response.content,
        totalPages: response.totalPages,
        currentPage: response.pageable.pageNumber,
        pageSize: response.pageable.pageSize,
        totalElements: response.totalElements,
        loading: false,
      }));
      console.log(
        `✅ Found ${response.content.length} properties matching filters`
      );
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message;
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      console.error("❌ Failed to search properties:", errorMessage);
    }
  }, []);

  return {
    ...state,
    fetchProperties,
    searchProperties,
  };
};
