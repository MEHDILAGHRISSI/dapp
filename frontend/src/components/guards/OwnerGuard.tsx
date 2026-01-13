// components/guards/OwnerGuard.tsx
import { Navigate, useParams } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { Spinner } from "../ui/spinner";

interface OwnerGuardProps {
    children: React.ReactNode;
    resourceOwnerId?: string; // Optional: pass owner ID directly
}

/**
 * OwnerGuard - Requires user to be the owner of a resource
 * Useful for protecting property management pages
 * Redirects to dashboard if user is not the owner
 */
const OwnerGuard = ({ children, resourceOwnerId }: OwnerGuardProps) => {
    const { user, isAuthenticated, isLoading } = useAuthStore();
    const params = useParams();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center gap-4">
                <Spinner className="size-10 text-primary animate-pulse" />
                <p className="text-sm font-medium text-muted-foreground animate-pulse">Vérification des autorisations...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/signin" replace />;
    }


    // user.roles?.[0] could also be checked here if we want to strictly enforce HOST role
    if (!Array.isArray(user?.types) || !user.types.includes("HOST")) {
        return <Navigate to="/" replace />;
    }


    return <>{children}</>;
};

export default OwnerGuard;
