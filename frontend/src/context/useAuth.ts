import { useContext } from 'react'
import { AuthContext } from './AuthContext'

export const useAuth = () => {
    const ctx = useContext(AuthContext)

    if (!ctx) {
        throw new Error('useAuth must be inside AuthProvider')
    }

    return ctx
}