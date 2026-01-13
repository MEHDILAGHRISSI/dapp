import { useEffect } from "react";

import { useThemeStore } from "@/shared/stores/theme.store";
import { useWalletStore } from "@/shared/stores/wallet.store";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useProfileStore } from "@/features/settings/store/profile.store";
import { useGeolocationStore } from "@/lib/geolocation/geolocation.store";

/**
 * AppBootstrap handles all global side effects and initialization logic.
 * This includes theme, wallet, auth profile fetching, and geolocation.
 */
export const AppBootstrap = () => {
    const initializeTheme = useThemeStore((s) => s.initializeTheme);
    const initializeWallet = useWalletStore((s) => s.initialize);
    const fetchWalletStatus = useWalletStore((s) => s.fetchWalletStatus);

    const { user: authUser, isAuthenticated } = useAuthStore();

    const requestLocation = useGeolocationStore((s) => s.requestLocation);

    // Initialize theme and wallet on mount
    useEffect(() => {
        initializeTheme();
        initializeWallet();
    }, [initializeTheme, initializeWallet]);

    // Fetch user profile and wallet status when authenticated
    useEffect(() => {
        if (isAuthenticated && authUser?.userId) {

            fetchWalletStatus(authUser.userId);
        }
    }, [isAuthenticated, authUser?.userId, fetchWalletStatus]);

    // Request geolocation on app startup
    useEffect(() => {
        requestLocation();
    }, [requestLocation]);

    return null;
};
