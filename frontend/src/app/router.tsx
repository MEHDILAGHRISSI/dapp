import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/protected/ProtectedRoute"; // path updated
import LandingPage from "@/features/landing/pages/LandingPage"; // TO BE UPDATED: This file might need moving or proper path. 
// Wait, I didn't move LandingPage in the user request structure?
// The user request shows:
// ├── features/ ...
// It doesn't explicitly show LandingPage. But it shows `features/auth`, `features/properties`, `features/profile`.
// I should probably check where `LandingPage` fits. For now I'll import it from its current location, 
// OR move it to `shared/pages` or `app/pages` if it doesn't fit a feature.
// Since it's a generic page, I might keep it in `features/landing` or just `app/pages`.
// But wait, the user provided structure shows `src/app/` but only `App.tsx` etc.
// I will keep imports relative to `src` (using @) and update them in the next step.
// For now I construct the router with the NEW paths for moved files.

// Auth
import ForgotPassword from "@/features/auth/pages/ForgotPassword";
import ResetPassword from "@/features/auth/pages/ResetPassword"; // Oops I missed this one move?
// Let's check my move list.
// I moved: ForgotPassword, SignIn, SignUp, VerifyOtp.
// I DID NOT move ResetPassword. Use `ls` to check if it was there.
// Step 26 showed `ResetPassword.tsx` in `src/pages/Authentication/Sub_Features`.
// I missed moving `ResetPassword.tsx`. I should move it too!
// I'll add a move step for it.

import SignUp from "@/features/auth/pages/SignUp";
import SignIn from "@/features/auth/pages/SignIn";
import VerifyOtp from "@/features/auth/pages/VerifyOtp";

// Properties
import BrowseProperties from "@/features/properties/pages/BrowseProperties";
import MyProperties from "@/features/properties/pages/MyProperties";
import AddProperty from "@/features/properties/pages/AddProperty";
import PropertyDetails from "@/features/properties/pages/PropertyDetails";

// Profile/Settings
import Profile from "@/features/profile/pages/Profile";
import Settings from "@/features/settings/pages/Settings"; // Did not move this one either.
// User request:
// features/profile/pages/Profile.tsx
// It doesn't show `Settings`.
// I should probably move `Settings` to `features/settings` or keep it where it is and update path.
// But the goal is to clean up `pages`.
// I'll check `Settings` content later.

import NotFound from "@/features/NotFound"; // Did not move.
import Dashboard from "@/features/dashboard/pages/Dashboard"; // Did not move.

export const AppRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<BrowseProperties />} />

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />

            {/* Auth */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />

            <Route
                path="/my-properties"
                element={
                    <ProtectedRoute>
                        <MyProperties />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/add-property"
                element={
                    <ProtectedRoute>
                        <AddProperty />
                    </ProtectedRoute>
                }
            />

            <Route path="/property/:id" element={<PropertyDetails />} />

            {/* Profile / Settings */}
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/settings"
                element={
                    <ProtectedRoute>
                        <Settings />
                    </ProtectedRoute>
                }
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};
