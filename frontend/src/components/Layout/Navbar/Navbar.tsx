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
} from "lucide-react";

import { useAuthStore } from "@/features/auth/store/authStore";
import { useProfileStore } from "@/features/profile/store/profileStore";


import Logo from "@/components/Logo";
import { BecomeHost } from "./BecomeHost";
import { WalletConnectButton } from "./WalletConnectButton";

export function Navbar() {
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

  const handleDisconnect = () => {
    logout();
   
  };

  // Safely get display email with fallbacks
  const getDisplayEmail = (): string => {
    if (profileUser?.email) {
      return profileUser.email;
    }
    // Add additional fallbacks if needed from auth store
    return "user@example.com"; // Default fallback
  };

  // Safely get display initial with fallbacks
  const getDisplayInitial = (): string => {
    // Try profile firstname first character
    if (profileUser?.firstname) {
      return profileUser.firstname.charAt(0).toUpperCase();
    }
    
    // Fallback to email first character
    const email = getDisplayEmail();
    if (email && email.length > 0) {
      return email.charAt(0).toUpperCase();
    }
    
    // Ultimate fallback
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
      <nav className="fixed top-0 w-full bg-[#182a3a] backdrop-blur-md z-50 py-3 px-6">
        <div className="max-w-full mx-auto flex justify-between items-center">
          <Logo size="lg" logocolor="white" textcolor="#ffffff" className="gap-3" />

          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              onClick={handleBecomeHost}
              className="text-white hover:text-gray-200 hover:bg-white/10 font-medium"
            >
              Become a Host
            </Button>

            <Separator orientation="vertical" className="h-6 bg-white/30" />

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <WalletConnectButton />

                {/* Profile Button - Only show if user is authenticated */}
                <Button
                  variant="ghost"
                  onClick={handleProfile}
                  className="h-8 w-8 p-0 flex items-center justify-center text-white hover:bg-white/10 rounded-full"
                >
                  <User className="h-5 w-5" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0 flex items-center justify-center text-white hover:bg-white/10"
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-[#182a3a] text-white text-xs">
                            {displayInitial}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col leading-none">
                          <span className="text-sm font-medium">
                            {displayName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {displayEmail}
                          </span>
                        </div>
                      </div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={handleProfile}>
                      <User className="w-4 h-4 mr-2" /> Profile
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={handleFavorites}>
                      <Heart className="w-4 h-4 mr-2" /> Favorites
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={handleMessages}>
                      <MessageCircle className="w-4 h-4 mr-2" /> Messages
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={handleSettings}>
                      <Settings className="w-4 h-4 mr-2" /> Settings
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={handleDisconnect}
                      className="text-red-600 focus:bg-red-100 focus:text-red-600"
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Disconnect
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/signin")}
                  className="text-white hover:text-gray-200 hover:bg-white/10 font-medium"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => navigate("/signup")}
                  className="bg-white text-[#182a3a] hover:bg-gray-100 font-medium"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
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