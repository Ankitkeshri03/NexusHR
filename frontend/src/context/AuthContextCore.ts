import { createContext } from 'react'

export interface AuthUser {
    id: number
    username: string
    email: string
    status: string
    roles: string[]
}

export interface SignupPayload {
    username: string
    email: string
    password: string
    phoneNumber?: string
}

export interface AuthContextType {
    isLoading: boolean
    isLoggedIn: boolean
    user: AuthUser | null
    token: string | null
    login: (email: string, password: string) => Promise<boolean>
    signup: (payload: SignupPayload) => Promise<boolean>
    logout: () => Promise<void>
    refreshUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | null>(null)
