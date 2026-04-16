import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useUserAuth } from '@/contexts/UserAuthContext';
import { toast } from 'sonner';

/**
 * Thin callback page at /auth/callback.
 * The backend redirects here after Google OAuth with userToken cookie already set.
 * We just refresh auth state and redirect to home.
 */
const GoogleCallback = () => {
    const { refreshAuth, user } = useUserAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const complete = async () => {
            await refreshAuth();
            toast.success('Signed in with Google successfully!');
            navigate('/', { replace: true });
        };
        complete();
    }, []);

    return (
        <div className="min-h-screen bg-[#FDF8F2] flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="font-body text-gray-600">Completing sign in...</p>
        </div>
    );
};

export default GoogleCallback;
