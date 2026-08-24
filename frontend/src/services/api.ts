import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

export const getAccessToken = () => localStorage.getItem('token')
export const getRefreshToken = () => localStorage.getItem('refreshToken')

export const setAuthSession = (accessToken: string, refreshToken: string) => {
    localStorage.setItem('token', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
}

export const clearAuthSession = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
}

export const getApiErrorMessage = (error: unknown, fallback = 'Something went wrong') => {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data

        if (typeof data === 'string' && data.trim()) {
            return data
        }

        if (data && typeof data === 'object') {
            if ('message' in data && typeof data.message === 'string' && data.message.trim()) {
                return data.message
            }

            const firstValue = Object.values(data)[0]
            if (typeof firstValue === 'string' && firstValue.trim()) {
                return firstValue
            }
        }
    }

    return fallback
}

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
})

api.interceptors.request.use((config) => {
    const token = getAccessToken()

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config
        const refreshToken = getRefreshToken()

        if (
            error.response?.status === 401 &&
            refreshToken &&
            !originalRequest._retry &&
            !originalRequest.url?.includes('/auth/refresh')
        ) {
            originalRequest._retry = true

            try {
                const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken })
                setAuthSession(data.accessToken, data.refreshToken)
                localStorage.setItem('user', JSON.stringify(data.user))
                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`

                return api(originalRequest)
            } catch (refreshError) {
                clearAuthSession()
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login'
                }
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

export default api
