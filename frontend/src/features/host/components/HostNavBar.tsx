// src/components/HostNavbar.tsx
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Settings,
    LogOut,
    User,
    Wallet,
} from "lucide-react";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { useProfileStore } from "@/features/settings/store/profile.store";

import Logo from "@/components/Logo";
import { WalletConnectButton } from "@/components/Layout/Navbar/WalletConnectButton";

export const HostNavbar = () => {
    const navigate = useNavigate();

    const { user: profileUser } = useProfileStore();

    const isAuthenticated = true

    // User information functions
    const getDisplayEmail = (): string => {
        return profileUser?.email || "host@example.com";
    };

    const getDisplayInitial = (): string => {
        if (profileUser?.firstname) {
            return profileUser.firstname.charAt(0).toUpperCase();
        }
        const email = getDisplayEmail();
        return email.charAt(0).toUpperCase() || "H";
    };

    const getDisplayName = (): string => {
        return profileUser?.firstname || "Host";
    };

    const displayEmail = getDisplayEmail();
    const displayInitial = getDisplayInitial();
    const displayName = getDisplayName();

    // Navigation handlers
    const handleSettings = () => navigate("/host/settings");
    const handleLogout = () => {
        //logout();
        navigate("/");
    };

    return (
        <nav className="sticky top-0 z-50 flex items-center justify-between bg-navy-deep px-6 py-4 lg:px-8 shadow-md">
            {/* Logo */}
            <div className="flex items-center gap-2">
                <Logo size="sm" textcolor="white" iconColor="#0fbad8ff" />
            </div>

            {/* Right Section - Only for authenticated users */}
            {isAuthenticated ? (
                <div className="flex items-center gap-4">
                    {/* Wallet Connect Button - Simple glow effect */}
                    <WalletConnectButton
                        className="px-4 py-2 rounded-lg hover:shadow-[0_0_15px_rgba(15,186,216,0.6)] transition-shadow duration-300"
                    >
                        <div className="flex items-center gap-2">
                            <Wallet className="w-4 h-4" />
                            <span className="font-medium">Connect Wallet</span>
                        </div>
                    </WalletConnectButton>

                    {/* Profile Dropdown - Original style */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-10 w-10 p-0 flex items-center justify-center text-white hover:bg-white/10 rounded-full border border-white/20"
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-white text-navy-deep font-semibold">
                                        {displayInitial}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent className="w-56" align="end">
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-white text-navy-deep font-semibold">
                                            {displayInitial}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col leading-none">
                                        <span className="text-sm font-medium text-slate-900">
                                            {displayName}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {displayEmail}
                                        </span>
                                    </div>
                                </div>
                            </DropdownMenuLabel>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                onClick={handleSettings}
                                className="text-slate-700 hover:bg-slate-100 cursor-pointer"
                            >
                                <Settings className="w-4 h-4 mr-2" /> Settings
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="text-red-600 hover:bg-red-50 cursor-pointer"
                            >
                                <LogOut className="w-4 h-4 mr-2" /> Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ) : null}
        </nav>
    );
};