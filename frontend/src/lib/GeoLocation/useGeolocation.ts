/**
 * useGeolocation Hook
 * Easy-to-use hook for accessing geolocation data in components
 */

import { useGeolocationStore } from "@/lib/GeoLocation/geolocationStore";

export const useGeolocation = () => {
  const {
    location,
    error,
    loading,
    city,
    requestLocation,
    clearLocation,
    clearError,
  } = useGeolocationStore();

  return {
    location,
    error,
    loading,
    city,
    requestLocation,
    clearLocation,
    clearError,
  };
};
