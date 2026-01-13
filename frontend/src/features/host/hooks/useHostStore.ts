
// src/features/host/hooks/useHostStore.ts
import { create } from 'zustand';
import { HostService } from '../services/host.services';
import { Property } from '@/features/properties/types/properties.types';
import { CreatePropertyInput, UpdatePropertyInput } from '../types/host.types';

interface HostStore {
    myProperties: Property[];
    loading: boolean;
    error: string | null;
    totalPropertiesCount: number | null;
    activePropertiesCount: number | null;

    // Actions
    fetchMyProperties: () => Promise<void>;
    createProperty: (data: CreatePropertyInput) => Promise<Property>;
    updateProperty: (id: string, data: UpdatePropertyInput) => Promise<void>;
    deleteProperty: (id: string) => Promise<void>;
    hideProperty: (id: string) => Promise<void>;
    showProperty: (id: string) => Promise<void>;
    submitProperty: (id: string) => Promise<void>;
    uploadPropertyImages: (id: string, images: File[]) => Promise<void>;
    fetchOwnerPropertiesCount: (ownerId: string) => Promise<void>;
    fetchOwnerActivePropertiesCount: (ownerId: string) => Promise<void>;

    // Clear state
    reset: () => void;
}

export const useHostStore = create<HostStore>((set, get) => ({
    myProperties: [],
    loading: false,
    error: null,
    totalPropertiesCount: null,
    activePropertiesCount: null,

    fetchMyProperties: async () => {
        set({ loading: true, error: null });
        try {
            const properties = await HostService.getMyProperties();
            set({ myProperties: properties, loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },

    createProperty: async (data) => {
        set({ loading: true, error: null });
        try {
            const response = await HostService.createProperty(data);
            await get().fetchMyProperties(); // Refresh list
            set({ loading: false });
            return response.property;
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    updateProperty: async (id, data) => {
        set({ loading: true, error: null });
        try {
            await HostService.updateProperty(id, data);
            await get().fetchMyProperties(); // Refresh list
            set({ loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    deleteProperty: async (id) => {
        set({ loading: true, error: null });
        try {
            await HostService.deleteProperty(id);
            set(state => ({
                myProperties: state.myProperties.filter(p => p.propertyId !== id),
                loading: false
            }));
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    hideProperty: async (id) => {
        set({ loading: true, error: null });
        try {
            await HostService.hideProperty(id);
            await get().fetchMyProperties();
            set({ loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    showProperty: async (id) => {
        set({ loading: true, error: null });
        try {
            await HostService.showProperty(id);
            await get().fetchMyProperties();
            set({ loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    submitProperty: async (id) => {
        set({ loading: true, error: null });
        try {
            await HostService.submitProperty(id);
            await get().fetchMyProperties();
            set({ loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    uploadPropertyImages: async (id, images) => {
        set({ loading: true, error: null });
        try {
            await HostService.uploadPropertyImages(id, images);
            await get().fetchMyProperties();
            set({ loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    fetchOwnerPropertiesCount: async (ownerId) => {
        try {
            const response = await HostService.getOwnerPropertiesCount(ownerId);
            set({ totalPropertiesCount: response.count });
        } catch (error: any) {
            console.error('Failed to fetch total properties count:', error);
        }
    },

    fetchOwnerActivePropertiesCount: async (ownerId) => {
        try {
            const response = await HostService.getOwnerActivePropertiesCount(ownerId);
            set({ activePropertiesCount: response.count });
        } catch (error: any) {
            console.error('Failed to fetch active properties count:', error);
        }
    },

    reset: () => set({ myProperties: [], loading: false, error: null, totalPropertiesCount: null, activePropertiesCount: null })
}));
