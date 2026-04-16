import { Navigate } from 'react-router-dom';
import { useUserAuth } from '@/contexts/UserAuthContext';
import { Loader2 } from 'lucide-react';

interface Props {
    children: React.ReactNode;
    redirectTo?: string;
}

/**
 * Wraps routes that require user login.
 * Shows spinner during auth check, redirects to /login if not authenticated.
 */
const UserProtectedRoute = ({ children, redirectTo = '/login' }: Props) => {
    const { isAuthenticated, isLoading } = useUserAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#FAFAFA]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
};

export default UserProtectedRoute;
