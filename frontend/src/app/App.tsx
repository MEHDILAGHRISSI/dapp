import { useEffect } from "react";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

import { AppRouter } from "./router";

import { useThemeStore } from "@/app/providers/ThemeProvider";
import { useWalletStore } from "@/features/auth/store/WalletStore"; // Check if moved? Layout didn't specify.
import { useAuthStore } from "@/features/auth/store/authStore";
import { useProfileStore } from "@/features/profile/store/profileStore";
import { useGeolocationStore } from "@/lib/GeoLocation/geolocationStore";

const queryClient = new QueryClient();

const App = () => {
  const initializeTheme = useThemeStore((s) => s.initializeTheme);
  const initializeWallet = useWalletStore((s) => s.initialize);

  const { user: authUser, isAuthenticated } = useAuthStore();
  const fetchUserProfile = useProfileStore((s) => s.fetchUserProfile);

  const requestLocation = useGeolocationStore((s) => s.requestLocation);

  useEffect(() => {
    initializeTheme();
    initializeWallet();
  }, []);

  useEffect(() => {
    if (isAuthenticated && authUser?.userId) {
      fetchUserProfile(authUser.userId);
    }
  }, [isAuthenticated, authUser?.userId, fetchUserProfile]);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
