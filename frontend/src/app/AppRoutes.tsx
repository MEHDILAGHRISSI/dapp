import { Routes, Route } from "react-router-dom";

import ForgotPassword from "@/features/auth/pages/ForgotPassword";
import ResetPassword from "@/features/auth/pages/ResetPassword";
import SignUp from "@/features/auth/pages/SignUp";
import SignIn from "@/features/auth/pages/SignIn";
import VerifyOtp from "@/features/auth/pages/VerifyOtp";

import ProtectedRoute from "@/components/guards/ProtectedRoute";
import RoleGuard from "@/components/guards/RoleGuard";
import OwnerGuard from "@/components/guards/OwnerGuard";

import Profile from "@/features/settings/pages/Profile";
import Security from "@/features/settings/pages/Security";
import RentalHistory from "@/features/settings/pages/RentalHistory";


import NotFound from "@/pages/NotFound";

import AdminDashboard from "@/features/admin/pages/AdminDashboard";
import Agents from "@/features/admin/pages/Agents";
import AdminProperties from "@/features/admin/pages/AdminProperties";
import AdminSettings from "@/features/admin/pages/AdminSettings";
import AdminLayout from "@/features/admin/components/AdminLayout";
import Homepage from "@/pages/Homepage";
import HostDashboard from "@/features/host/pages/HostDashboard";
import MyProperties from "@/features/host/pages/MyProperties";
import CreateProperty from "@/features/host/pages/CreateProperty";
import EditProperty from "@/features/host/pages/EditProperty";
import PropertiesListPage from "@/features/properties/pages/PropertiesListPage";
import PropertyDetailsPage from "@/features/properties/pages/PropertyDetailsPage";
import MainLayout from "@/components/Layout/MainLayout";
import HostLayout from "@/features/host/components/HostLayout";


export const AppRoutes = () => {
    return (
        <Routes>

            <Route path="/test" element={<Homepage />} />
            {/* ================= PUBLIC ROUTES ================= */}

            <Route element={<MainLayout />}>
                <Route path="/properties" element={<PropertiesListPage />} />
                <Route path="/properties/:propertyId" element={<PropertyDetailsPage />} />
                <Route path="/" element={<PropertiesListPage />} />
            </Route>



            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />

            {/* ================= ADMIN / AGENT ROUTES ================= */}
            <Route element={<AdminLayout />}>
                <Route
                    path="/admin/dashboard"
                    element={
                        <RoleGuard allowedRoles={["ADMIN", "AGENT"]}>
                            <AdminDashboard />
                        </RoleGuard>
                    }
                />

                <Route
                    path="/admin/properties"
                    element={
                        <RoleGuard allowedRoles={["ADMIN", "AGENT"]}>
                            <AdminProperties />
                        </RoleGuard>
                    }
                />

                <Route
                    path="/admin/agents"
                    element={
                        <RoleGuard allowedRoles={["ADMIN", "AGENT"]}>
                            <Agents />
                        </RoleGuard>
                    }
                />
                <Route
                    path="/admin/settings"
                    element={
                        <RoleGuard allowedRoles={["ADMIN", "AGENT"]}>
                            <AdminSettings />
                        </RoleGuard>
                    }
                />
            </Route>

            {/* ================= HOST ROUTES ================= */}
            <Route element={<HostLayout />}>
                <Route
                    path="/host/dashboard"
                    element={
                        <OwnerGuard>
                            <HostDashboard />
                        </OwnerGuard>
                    }
                />
                <Route
                    path="/host/properties"
                    element={
                        <OwnerGuard>
                            <MyProperties />
                        </OwnerGuard>
                    }
                />
                <Route
                    path="/host/properties/create"
                    element={
                        <ProtectedRoute>
                            <CreateProperty />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/host/properties/:id"
                    element={
                        <OwnerGuard>
                            <EditProperty />
                        </OwnerGuard>
                    }
                />
            </Route>

            {/* ================= USER SETTINGS ================= */}
            <Route
                path="/settings"
                element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/settings/profile"
                element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/settings/security"
                element={
                    <ProtectedRoute>
                        <Security />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/settings/history"
                element={
                    <ProtectedRoute>
                        <RentalHistory />
                    </ProtectedRoute>
                }
            />

            {/* Legacy profile route */}
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                }
            />

            {/* ================= 404 ================= */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};
