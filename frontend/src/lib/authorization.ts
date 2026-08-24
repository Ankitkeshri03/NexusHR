import type { AuthUser } from '../services/authService'

export type AppRole = 'ADMIN' | 'EMPLOYEE'

export const hasRole = (user: AuthUser | null, allowedRoles?: AppRole[]) => {
    if (!allowedRoles || allowedRoles.length === 0) {
        return true
    }

    if (!user) {
        return false
    }

    return allowedRoles.some(role => user.roles.includes(role))
}
