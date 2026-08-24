import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import type { AppRole } from '../lib/authorization'
import { hasRole } from '../lib/authorization'

const ProtectedRoute = ({
    children,
    allowedRoles,
}: {
    children: React.ReactNode
    allowedRoles?: AppRole[]
}) => {
    const { isLoggedIn, isLoading, user } = useAuth()
    const location = useLocation()

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-600 border-t-transparent"></div>
            </div>
        )
    }

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />
    }

    if (!hasRole(user, allowedRoles)) {
        return <Navigate to="/dashboard" replace state={{ from: location.pathname }} />
    }

    return <>{children}</>
}

export default ProtectedRoute
