/**
 * useSearchProperties Hook - Local to BrowseProperties
 * Hook for searching and filtering properties with advanced filters
 */

import { useState, useCallback } from "react";
import {
  publicPropertiesService,
  PropertiesResponse,
  PublicProperty,
  PropertySearchFilters,
} from "./propertiesService";

interface UseSearchPropertiesState {
  properties: PublicProperty[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  totalElements: number;
  filters: PropertySearchFilters;
}

export const useSearchProperties = () => {
  const [state, setState] = useState<UseSearchPropertiesState>({
    properties: [],
    loading: false,
    error: null,
    totalPages: 0,
    currentPage: 0,
    pageSize: 20,
    totalElements: 0,
    filters: {
      page: 0,
      size: 20,
      sortBy: "createdAt",
      sortDir: "DESC",
    },
  });

  /**
   * Search properties with filters
   */
  const search = useCallback(async (filters: PropertySearchFilters) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response: PropertiesResponse =
        await publicPropertiesService.searchProperties(filters);
      setState((prev) => ({
        ...prev,
        properties: response.content,
        totalPages: response.totalPages,
        currentPage: response.currentPage,
        pageSize: response.pageSize,
        totalElements: response.totalElements,
        filters,
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
      console.error("❌ Search failed:", errorMessage);
    }
  }, []);

  /**
   * Search by city
   */
  const searchByCity = useCallback(
    async (city: string, page: number = 0, size: number = 20) => {
      await search({ city, page, size });
    },
    [search]
  );

  /**
   * Filter by price range
   */
  const filterByPrice = useCallback(
    async (
      minPrice: number,
      maxPrice: number,
      page: number = 0,
      size: number = 20
    ) => {
      await search({ minPrice, maxPrice, page, size });
    },
    [search]
  );

  /**
   * Filter by property type
   */
  const filterByType = useCallback(
    async (type: string, page: number = 0, size: number = 20) => {
      await search({ type, page, size });
    },
    [search]
  );

  /**
   * Filter by guest capacity
   */
  const filterByGuests = useCallback(
    async (nbOfGuests: number, page: number = 0, size: number = 20) => {
      await search({ nbOfGuests, page, size });
    },
    [search]
  );

  /**
   * Clear filters and reset
   */
  const clearFilters = useCallback(() => {
    setState((prev) => ({
      ...prev,
      filters: {
        page: 0,
        size: 20,
        sortBy: "createdAt",
        sortDir: "DESC",
      },
      properties: [],
      error: null,
    }));
  }, []);

  return {
    ...state,
    search,
    searchByCity,
    filterByPrice,
    filterByType,
    filterByGuests,
    clearFilters,
  };
};
