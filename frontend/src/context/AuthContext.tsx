import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from './AuthContextCore'
import type { AuthUser, SignupPayload } from './AuthContextCore'
import { authService } from '../services/authService'
import api, { clearAuthSession, setAuthSession } from '../services/api'

export { AuthContext } from './AuthContextCore'

const USER_STORAGE_KEY = 'user'

const readStoredUser = (): AuthUser | null => {
    const saved = localStorage.getItem(USER_STORAGE_KEY)

    if (!saved) {
        return null
    }

    try {
        return JSON.parse(saved) as AuthUser
    } catch {
        localStorage.removeItem(USER_STORAGE_KEY)
        return null
    }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
    const [user, setUser] = useState<AuthUser | null>(() => readStoredUser())
    const [isLoading, setIsLoading] = useState(false)

    const isLoggedIn = !!token

    useEffect(() => {
        if (token) {
            api.defaults.headers.common.Authorization = `Bearer ${token}`
        } else {
            delete api.defaults.headers.common.Authorization
        }
    }, [token])

    const applyAuth = (accessToken: string, refreshToken: string, userData: AuthUser) => {
        setToken(accessToken)
        setUser(userData)
        setAuthSession(accessToken, refreshToken)
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData))
    }

    const clearAuth = () => {
        setToken(null)
        setUser(null)
        clearAuthSession()
    }

    const refreshUser = async (): Promise<void> => {
        if (!localStorage.getItem('token')) {
            clearAuth()
            return
        }

        const { data } = await authService.me()
        setUser(data)
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data))
    }

    useEffect(() => {
        let isMounted = true

        const bootstrapAuth = async () => {
            if (!token) {
                setIsLoading(false)
                return
            }

            setIsLoading(true)

            try {
                const { data } = await authService.me()
                if (!isMounted) {
                    return
                }

                setUser(data)
                localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data))
            } catch {
                if (isMounted) {
                    clearAuth()
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false)
                }
            }
        }

        void bootstrapAuth()

        return () => {
            isMounted = false
        }
    }, [token])

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const { data } = await authService.login({ email, password })
            applyAuth(data.accessToken, data.refreshToken, data.user)
            return true
        } catch (err) {
            console.error('Login error:', err)
            return false
        }
    }

    const signup = async (payload: SignupPayload): Promise<boolean> => {
        try {
            const { data } = await authService.signup(payload)
            applyAuth(data.accessToken, data.refreshToken, data.user)
            return true
        } catch (err) {
            console.error('Signup error:', err)
            return false
        }
    }

    const logout = async (): Promise<void> => {
        try {
            const refreshToken = localStorage.getItem('refreshToken')
            if (refreshToken) {
                await authService.logout(refreshToken)
            }
        } catch {
            // Ignore logout API errors and clear local state either way.
        } finally {
            clearAuth()
        }
    }

    return (
        <AuthContext.Provider
            value={{ isLoading, isLoggedIn, user, token, login, signup, logout, refreshUser }}
        >
            {children}
        </AuthContext.Provider>
    )
}
