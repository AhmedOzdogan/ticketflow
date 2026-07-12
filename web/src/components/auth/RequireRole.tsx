import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthGate from '../../pages/AuthGate';

type UserRole = 'buyer' | 'admin' | 'organizer';

type RequireRoleProps = {
    allowedRoles?: UserRole[];
};

export function RequireRole({
    allowedRoles,
}: RequireRoleProps) {
    const { user } = useAuth();

    if (!user) {
        return <AuthGate />;
    }

    if (
        allowedRoles &&
        !allowedRoles.includes(user.role)
    ) {
        return <AuthGate variant="unauthorized" />;
    }

    return <Outlet />;
}