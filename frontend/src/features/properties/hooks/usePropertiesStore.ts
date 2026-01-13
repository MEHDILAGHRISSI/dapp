import { create } from 'zustand';
import { PropertiesService } from '../services/properties.services';
import {
    Property,
    PropertySummary,
    PaginatedResponse,
    SearchFilters,
    NearbySearchFilters,
    Characteristic,
    CharacteristicType,
} from '../types/properties.types';

interface PropertiesStore {
    properties: PropertySummary[];
    currentProperty: Property | null;
    characteristics: Characteristic[];
    characteristicTypes: CharacteristicType[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalElements: number;
    };
    loading: boolean;
    error: string | null;

    // Actions
    fetchProperties: (page?: number, size?: number) => Promise<PaginatedResponse<PropertySummary>>;
    searchProperties: (filters: SearchFilters) => Promise<PaginatedResponse<PropertySummary>>;
    fetchNearbyProperties: (filters: NearbySearchFilters) => Promise<PaginatedResponse<PropertySummary>>;
    fetchPropertyById: (id: string) => Promise<Property>;
    fetchCharacteristics: () => Promise<void>;
    fetchCharacteristicTypes: () => Promise<void>;

    // State helpers
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    resetCurrentProperty: () => void;
}

export const usePropertiesStore = create<PropertiesStore>((set) => ({
    properties: [],
    currentProperty: null,
    characteristics: [],
    characteristicTypes: [],
    pagination: {
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
    },
    loading: false,
    error: null,

    fetchProperties: async (page = 0, size = 12) => {
        set({ loading: true, error: null });
        try {
            const response = await PropertiesService.getAllProperties(page, size);
            set({
                properties: response.content,
                pagination: {
                    currentPage: response.number,
                    totalPages: response.totalPages,
                    totalElements: response.totalElements,
                },
                loading: false,
            });
            return response;
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    searchProperties: async (filters: SearchFilters) => {
        set({ loading: true, error: null });
        try {
            const response = await PropertiesService.searchProperties(filters);
            set({
                properties: response.content,
                pagination: {
                    currentPage: response.number,
                    totalPages: response.totalPages,
                    totalElements: response.totalElements,
                },
                loading: false,
            });
            return response;
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    fetchNearbyProperties: async (filters: NearbySearchFilters) => {
        set({ loading: true, error: null });
        try {
            const response = await PropertiesService.getNearbyProperties(filters);
            set({
                properties: response.content,
                pagination: {
                    currentPage: response.number,
                    totalPages: response.totalPages,
                    totalElements: response.totalElements,
                },
                loading: false,
            });
            return response;
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    fetchPropertyById: async (id: string) => {
        set({ loading: true, error: null });
        try {
            const property = await PropertiesService.getPropertyById(id);
            set({ currentProperty: property, loading: false });
            return property;
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    fetchCharacteristics: async () => {
        try {
            const characteristics = await PropertiesService.getAllCharacteristics();
            set({ characteristics });
        } catch (error: any) {
            console.error('Failed to fetch characteristics:', error);
            set({ error: error.message });
        }
    },

    fetchCharacteristicTypes: async () => {
        try {
            const characteristicTypes = await PropertiesService.getCharacteristicTypes();
            set({ characteristicTypes });
        } catch (error: any) {
            console.error('Failed to fetch characteristic types:', error);
            set({ error: error.message });
        }
    },

    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    resetCurrentProperty: () => set({ currentProperty: null }),
}));
