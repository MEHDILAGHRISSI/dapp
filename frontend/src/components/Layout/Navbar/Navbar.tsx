import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
  Heart,
  MessageCircle,
  User,
  Settings,
  LogOut,
  Menu,
  Home,
} from "lucide-react";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { useProfileStore } from "@/features/settings/store/profile.store";

import Logo from "@/components/Logo";
import { BecomeHost } from "./BecomeHost";
import { WalletConnectButton } from "./WalletConnectButton";

export const Navbar = () => {
  const navigate = useNavigate();
  const [showBecomeHost, setShowBecomeHost] = useState(false);

  const { isAuthenticated, logout } = useAuthStore();
  const { user: profileUser } = useProfileStore();

  const handleBecomeHost = () => setShowBecomeHost(true);
  const handleSignIn = () => {
    setShowBecomeHost(false);
    navigate("/signin");
  };

  const handleProfile = () => navigate("/profile");
  const handleFavorites = () => navigate("/favorites");
  const handleMessages = () => navigate("/messages");
  const handleSettings = () => navigate("/settings");
  const handleHostDashboard = () => navigate("/host/dashboard");

  const handleDisconnect = () => {
    logout();
    navigate("/");
  };

  // Safely get display email with fallbacks
  const getDisplayEmail = (): string => {
    if (profileUser?.email) {
      return profileUser.email;
    }
    return "user@example.com";
  };

  // Safely get display initial with fallbacks
  const getDisplayInitial = (): string => {
    if (profileUser?.firstname) {
      return profileUser.firstname.charAt(0).toUpperCase();
    }

    const email = getDisplayEmail();
    if (email && email.length > 0) {
      return email.charAt(0).toUpperCase();
    }

    return "U";
  };

  // Safely get display name
  const getDisplayName = (): string => {
    return profileUser?.firstname || "User";
  };

  const displayEmail = getDisplayEmail();
  const displayInitial = getDisplayInitial();
  const displayName = getDisplayName();

  return (
    <>
      <nav className="relative z-50 flex items-center justify-between bg-brand-dark px-6 py-4 lg:px-10">
        {/* Logo Section */}
        <div className="flex items-center gap-4">
          <Logo size="md" textcolor="white" iconColor="#2DD4BF" />
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            // AUTHENTICATED UI
            <div className="flex items-center gap-4">
              {/* Wallet Connect Button */}
              <WalletConnectButton />

              {/* Profile Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-10 w-10 p-0 flex items-center justify-center text-white hover:bg-white/10 rounded-full border border-transparent"
                  >
                    <Avatar className="h-8 w-8 ring-2 ring-brand-blue/30">
                      <AvatarFallback className="bg-brand-blue text-white text-sm font-semibold">
                        {displayInitial}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-brand-blue text-white text-sm font-semibold">
                          {displayInitial}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col leading-none">
                        <span className="text-sm font-medium text-foreground">
                          {displayName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {displayEmail}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleProfile}
                    className="text-foreground hover:bg-accent cursor-pointer"
                  >
                    <User className="w-4 h-4 mr-2" /> Profile
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleFavorites}
                    className="text-foreground hover:bg-accent cursor-pointer"
                  >
                    <Heart className="w-4 h-4 mr-2" /> Favorites
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleMessages}
                    className="text-foreground hover:bg-accent cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" /> Messages
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleSettings}
                    className="text-foreground hover:bg-accent cursor-pointer"
                  >
                    <Settings className="w-4 h-4 mr-2" /> Settings
                  </DropdownMenuItem>

                  {/* Become Host Menu Item - Only in dropdown for authenticated users */}
                  <DropdownMenuItem
                    onClick={handleHostDashboard}
                    className="text-primary hover:bg-primary/10 cursor-pointer"
                  >
                    <Home className="w-4 h-4 mr-2" /> Become Host
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleDisconnect}
                    className="text-destructive hover:bg-destructive/10 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            // NOT AUTHENTICATED UI - Only Sign In and Sign Up
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/signin")}
                className="text-white hover:bg-white/10 font-medium px-5 py-2 h-auto text-sm"
              >
                Sign In
              </Button>
              <Button
                onClick={() => navigate("/signup")}
                className="bg-brand-blue text-brand-dark hover:bg-cyan-400 font-bold px-6 py-2 h-auto text-sm shadow-[0_0_20px_rgba(45,212,191,0.3)] rounded-full transition-all hover:scale-105"
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </nav>

      {showBecomeHost && (
        <BecomeHost
          onClose={() => setShowBecomeHost(false)}
          onSignIn={handleSignIn}
          isAuthenticated={isAuthenticated}
        />
      )}
    </>
  );
}