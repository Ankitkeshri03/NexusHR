import api from './api'

export interface Employee {
    id?: number

    name?: string
    firstName?: string
    lastName?: string

    employeeCode: string

    email: string
    phoneNumber?: string

    gender?: string

    dateOfBirth?: string
    joiningDate?: string

    department?: string
    departmentId?: number

    designation?: string
    designationId?: number

    employmentType?: string
    employmentStatus?: string

    salary?: number

    address?: string
    emergencyContact?: string

    profileImage?: string
}

const employeeService = {
    getAll: async () => {
        const response = await api.get<Employee[]>('/employees')
        return response.data
    },

    getById: async (id: number) => {
        const response = await api.get<Employee>(`/employees/${id}`)
        return response.data
    },

    create: async (data: Partial<Employee>) => {
        const response = await api.post<Employee>('/employees', data)
        return response.data
    },

    update: async (id: number, data: Partial<Employee>) => {
        const response = await api.put<Employee>(`/employees/${id}`, data)
        return response.data
    },

    delete: async (id: number) => {
        const response = await api.delete(`/employees/${id}`)
        return response.data
    }
}

export default employeeService