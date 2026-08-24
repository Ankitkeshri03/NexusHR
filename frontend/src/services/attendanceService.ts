import api from './api'

export interface AttendanceRecord {
    id: number
    employeeId: number
    employeeName: string
    employeeCode: string
    department: string
    attendanceDate: string
    checkIn: string | null
    checkOut: string | null
    status: string
    workingHours: number | null
    overtime: number | null
    notes: string | null
}

export interface AttendanceFormData {
    employeeId: number

    attendanceDate: string

    checkIn: string

    checkOut: string

    status: string

    notes?: string

    workingHours?: number

    workMode?: string
}

export const attendanceService = {
    getAll: (date?: string) =>
        api.get<AttendanceRecord[]>(`/attendance${date ? `?date=${date}` : ''}`),
    create: (data: AttendanceFormData) =>
        api.post<AttendanceRecord>('/attendance', data),
    update: (id: number, data: Partial<AttendanceFormData>) =>
        api.put<AttendanceRecord>(`/attendance/${id}`, data),
    delete: (id: number) =>
        api.delete(`/attendance/${id}`),
}