import api from './api'

export interface DashboardRecentEmployee {
    id: number
    name: string
    department: string
    status: string
    joined: string
}

export interface DashboardSummary {
    totalEmployees: number
    presentToday: number
    onLeave: number
    newJoinees: number
    recentEmployees: DashboardRecentEmployee[]
}

export interface Role {
    id: number
    roleName: string
    description: string
}

export interface UserRecord {
    id: number
    username: string
    fullName: string | null
    email: string
    phoneNumber: string | null
    designation: string | null
    status: string
    emailVerified: boolean
    roles: Role[]
    createdAt: string | null
    lastLoginAt: string | null
}

export interface Permission {
    id: number
    permissionName: string
    description: string | null
}

export interface Designation {
    id: number
    designationName: string
    designationCode?: string | null
    description: string | null
    departmentId: number
    level?: string | null
    salaryRangeMin?: number | null
    salaryRangeMax?: number | null
    status?: 'ACTIVE' | 'INACTIVE' | null
}

export interface Department {
    id: number
    departmentName: string
    description: string | null
    status?: boolean | string | null
}

export const adminService = {
    getDashboard: () => api.get<DashboardSummary>('/dashboard'),
    getUsers: () => api.get<UserRecord[]>('/users'),
    createUser: (data: Partial<UserRecord> & { password: string }) => api.post<UserRecord>('/users', data),
    updateUser: (id: number, data: Partial<UserRecord> & { password?: string }) => api.put<UserRecord>(`/users/${id}`, data),
    deleteUser: (id: number) => api.delete(`/users/${id}`),
    assignRole: (userId: number, roleName: string) =>
        api.post<UserRecord>(`/users/${userId}/assign-role`, null, { params: { roleName } }),
    getRoles: () => api.get<Role[]>('/roles'),
    getPermissions: () => api.get<Permission[]>('/permissions'),
    createPermission: (data: Partial<Permission>) => api.post<Permission>('/permissions', data),
    updatePermission: (id: number, data: Partial<Permission>) => api.put<Permission>(`/permissions/${id}`, data),
    deletePermission: (id: number) => api.delete(`/permissions/${id}`),
    getDesignations: () => api.get<Designation[]>('/designations'),
    createDesignation: (data: Partial<Designation>) => api.post<Designation>('/designations', data),
    updateDesignation: (id: number, data: Partial<Designation>) => api.put<Designation>(`/designations/${id}`, data),
    deleteDesignation: (id: number) => api.delete(`/designations/${id}`),
    getDepartments: () => api.get<Department[]>('/departments'),
}
