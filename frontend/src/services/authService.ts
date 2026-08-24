import api from './api'

export interface LoginRequest {
    email: string
    password: string
}

export interface SignupRequest extends LoginRequest {
    username: string
    phoneNumber?: string
}

export interface ActionResponse {
    message: string
}

export interface AuthUser {
    id: number
    username: string
    email: string
    status: string
    roles: string[]
}

export interface AuthResponse {
    accessToken: string
    refreshToken: string
    tokenType: string
    expiresIn: number
    user: AuthUser
}

export const authService = {
    login: (data: LoginRequest) =>
        api.post<AuthResponse>('/auth/login', data),
    signup: (data: SignupRequest) =>
        api.post<AuthResponse>('/auth/signup', data),
    refresh: (refreshToken: string) =>
        api.post<AuthResponse>('/auth/refresh', { refreshToken }),
    logout: (refreshToken: string) =>
        api.post('/auth/logout', { refreshToken }),
    me: () =>
        api.get<AuthUser>('/auth/me'),
    forgotPassword: (email: string) =>
        api.post<ActionResponse>('/auth/forgot-password', { email }),
    resetPassword: (token: string, newPassword: string, confirmPassword: string) =>
        api.post<ActionResponse>('/auth/reset-password', { token, newPassword, confirmPassword }),
    verifyEmail: (token: string) =>
        api.post<ActionResponse>('/auth/verify-email', { token }),
    resendVerification: (email: string) =>
        api.post<ActionResponse>('/auth/resend-verification', { email }),
}
