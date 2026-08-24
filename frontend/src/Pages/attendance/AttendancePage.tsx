import { useCallback, useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    Plus, Search, ChevronLeft, ChevronRight,
    Users, UserCheck, UserX, Clock, Calendar, Pencil, Trash2,
    FileSpreadsheet, X, Save, AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import type { AttendanceRecord, AttendanceFormData } from '../../services/attendanceService'

// ─── Helpers ───────────────────────────────────────────────
const formatTime = (t: string | null | undefined) =>
    t ? t.substring(0, 5) : '—'

const calcWorkingHours = (checkIn: string, checkOut: string): string => {
    if (!checkIn || !checkOut) return '—'
    const [ih, im] = checkIn.split(':').map(Number)
    const [oh, om] = checkOut.split(':').map(Number)
    const diff = (oh * 60 + om) - (ih * 60 + im)
    if (diff <= 0) return '—'
    const h = Math.floor(diff / 60)
    const m = diff % 60
    return `${h}h ${m}m`
}

const calcOvertime = (checkIn: string, checkOut: string): string => {
    if (!checkIn || !checkOut) return '—'
    const [ih, im] = checkIn.split(':').map(Number)
    const [oh, om] = checkOut.split(':').map(Number)
    const diff = (oh * 60 + om) - (ih * 60 + im)
    const ot = diff - 480 // 8 hours = 480 min
    if (ot <= 0) return '—'
    return `${Math.floor(ot / 60)}h ${ot % 60}m`
}

const autoStatus = (checkIn: string): string => {
    if (!checkIn) return 'ABSENT'
    const [h, m] = checkIn.split(':').map(Number)
    if (h > 9 || (h === 9 && m > 30)) return 'LATE'
    return 'PRESENT'
}

const statusStyle = (status: string) => {
    switch (status) {
        case 'PRESENT': return 'bg-green-100 text-green-700'
        case 'ABSENT': return 'bg-red-100 text-red-700'
        case 'LATE': return 'bg-yellow-100 text-yellow-700'
        case 'HALF DAY': return 'bg-orange-100 text-orange-700'
        case 'ON LEAVE': return 'bg-blue-100 text-blue-700'
        default: return 'bg-slate-100 text-slate-600'
    }
}

interface Employee { id: number; name: string; employeeCode: string }

// ─── Main Component ────────────────────────────────────────
const AttendancePage = () => {

    const queryClient = useQueryClient()
    const { data: employees = [] } = useQuery({
        queryKey: ['employees'],
        queryFn: () =>
            api.get<Employee[]>('/employees').then(r => r.data),
    })

    const today = new Date().toISOString().split('T')[0]

    const [selectedDate, setSelectedDate] = useState(today)
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('All')
    const [filterDept, setFilterDept] = useState('All')
    const [showModal, setShowModal] = useState(false)
    const [editRecord, setEditRecord] = useState<AttendanceRecord | null>(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleteId, setDeleteId] = useState<number | null>(null)
    const [page, setPage] = useState(1)
    const perPage = 10

    const [form, setForm] = useState<AttendanceFormData>({
        employeeId: 0,
        attendanceDate: today,
        checkIn: '09:00',
        checkOut: '18:00',
        status: 'PRESENT',
        notes: '',
    })

    // Queries
    const { data: attendance = [], isLoading } = useQuery({
        queryKey: ['attendance', selectedDate],
        queryFn: () =>
            api.get<AttendanceRecord[]>(`/attendance?date=${selectedDate}`)
                .then(r => r.data).catch(() => []),
    })



    // Mutations
    const createMutation = useMutation({
        mutationFn: (d: AttendanceFormData) => api.post('/attendance', d),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance'] })
            toast.success('Attendance marked!')
            closeModal()
        },
        onError: () => toast.error('Failed to mark attendance'),
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<AttendanceFormData> }) =>
            api.put(`/attendance/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance'] })
            toast.success('Attendance updated!')
            closeModal()
        },
        onError: () => toast.error('Failed to update'),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.delete(`/attendance/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance'] })
            toast.success('Record deleted!')
            setShowDeleteModal(false)
        },
        onError: () => toast.error('Failed to delete'),
    })

    // Helpers
    const closeModal = () => {
        setShowModal(false)
        setEditRecord(null)
        setForm({ employeeId: 0, attendanceDate: today, checkIn: '09:00', checkOut: '18:00', status: 'PRESENT', notes: '' })
    }

    const openEdit = (rec: AttendanceRecord) => {
        setEditRecord(rec)
        setForm({
            employeeId: rec.employeeId,
            attendanceDate: rec.attendanceDate,
            checkIn: rec.checkIn || '09:00',
            checkOut: rec.checkOut || '18:00',
            status: rec.status,
            notes: rec.notes || '',
        })
        setShowModal(true)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const payload = {
            employeeId: form.employeeId,
            attendanceDate: form.attendanceDate,

            checkIn: form.checkIn,
            checkOut: form.checkOut,

            workingHours: Number(form.workingHours || 0),

            status: form.status,
            workMode: form.workMode
        }
        if (editRecord) {
            updateMutation.mutate({ id: editRecord.id, data: payload })
        } else {
            createMutation.mutate(payload)
        }
    }
    const getEmpName = useCallback((rec: AttendanceRecord) => {
        if (rec.employeeName) return rec.employeeName
        return employees.find(e => e.id === rec.employeeId)?.name || `EMP${rec.employeeId}`
    }, [employees])

    // Filtering
    const filtered = useMemo(() => {
        return attendance.filter(r => {
            const name = getEmpName(r).toLowerCase()
            const matchSearch = !search || name.includes(search.toLowerCase()) || r.employeeCode?.toLowerCase().includes(search.toLowerCase())
            const matchStatus = filterStatus === 'All' || r.status === filterStatus
            const matchDept = filterDept === 'All' || r.department === filterDept
            return matchSearch && matchStatus && matchDept
        })
    }, [attendance, search, filterStatus, filterDept, getEmpName])

    const paginated = filtered.slice((page - 1) * perPage, page * perPage)
    const totalPages = Math.ceil(filtered.length / perPage)

    // Stats
    const stats = {
        present: attendance.filter(r => r.status === 'PRESENT').length,
        absent: attendance.filter(r => r.status === 'ABSENT').length,
        late: attendance.filter(r => r.status === 'LATE').length,
        leave: attendance.filter(r => r.status === 'ON LEAVE').length,
    }

    // Departments
    const departments = ['All', ...new Set(attendance.map(r => r.department).filter(Boolean))]

    // Export CSV
    const exportCSV = () => {
        const rows = [
            ['Name', 'Code', 'Date', 'Check In', 'Check Out', 'Working Hours', 'Status'],
            ...filtered.map(r => [
                getEmpName(r), r.employeeCode || '',
                r.attendanceDate, formatTime(r.checkIn),
                formatTime(r.checkOut),
                calcWorkingHours(r.checkIn || '', r.checkOut || ''),
                r.status
            ])
        ]
        const csv = rows.map(r => r.join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `attendance-${selectedDate}.csv`
        a.click()
        toast.success('CSV exported!')
    }

    return (
        <div className="space-y-6">

            {/* ── Header ── */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Attendance</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Track and manage daily attendance</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={exportCSV}
                            className="flex items-center gap-2 border border-slate-200 text-slate-600 px-3 py-2 rounded-lg text-sm hover:bg-slate-50">
                        <FileSpreadsheet size={16} /> Export CSV
                    </button>
                    <button onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700">
                        <Plus size={16} /> Mark Attendance
                    </button>
                </div>
            </div>

            {/* ── Stats Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'PRESENT', value: stats.present, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
                    { label: 'ABSENT', value: stats.absent, icon: UserX, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
                    { label: 'LATE', value: stats.late, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100' },
                    { label: 'ON LEAVE', value: stats.leave, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                ].map(s => (
                    <div key={s.label} className={`bg-white rounded-xl border ${s.border} shadow-sm p-4`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center`}>
                                <s.icon size={20} className={s.color} />
                            </div>
                            <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
                        </div>
                        <p className="text-sm text-slate-500">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* ── Filters ── */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                <div className="flex flex-wrap items-center gap-3">
                    {/* Date nav */}
                    <div className="flex items-center gap-1 bg-slate-50 rounded-lg border border-slate-200 p-1">
                        <button onClick={() => {
                            const d = new Date(selectedDate)
                            d.setDate(d.getDate() - 1)
                            setSelectedDate(d.toISOString().split('T')[0])
                        }} className="p-1.5 hover:bg-white rounded">
                            <ChevronLeft size={16} className="text-slate-500" />
                        </button>
                        <input type="date" value={selectedDate}
                               onChange={e => setSelectedDate(e.target.value)}
                               className="text-sm text-slate-700 bg-transparent focus:outline-none px-1" />
                        <button onClick={() => {
                            const d = new Date(selectedDate)
                            d.setDate(d.getDate() + 1)
                            setSelectedDate(d.toISOString().split('T')[0])
                        }} className="p-1.5 hover:bg-white rounded">
                            <ChevronRight size={16} className="text-slate-500" />
                        </button>
                    </div>

                    <button onClick={() => setSelectedDate(today)}
                            className="text-xs px-3 py-2 bg-purple-50 text-purple-600 rounded-lg border border-purple-100 font-medium">
                        Today
                    </button>

                    {/* Search */}
                    <div className="relative flex-1 min-w-48">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Search employee..."
                               value={search} onChange={e => setSearch(e.target.value)}
                               className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    </div>

                    {/* Status filter */}
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                            className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
                        {['All', 'PRESENT', 'ABSENT', 'LATE', 'HALF DAY', 'ON LEAVE'].map(s => (
                            <option key={s}>{s}</option>
                        ))}
                    </select>

                    {/* Dept filter */}
                    <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
                            className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
                        {departments.map(d => <option key={d}>{d}</option>)}
                    </select>

                    <div className="ml-auto text-sm text-slate-500">
                        <span className="font-medium text-slate-800">{filtered.length}</span> records
                    </div>
                </div>
            </div>

            {/* ── Table ── */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="space-y-3 p-6">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
                        ))}
                    </div>
                ) : paginated.length === 0 ? (
                    <div className="text-center py-20">
                        <Users size={48} className="mx-auto text-slate-200 mb-3" />
                        <p className="text-slate-500 font-medium">No attendance records</p>
                        <p className="text-sm text-slate-400 mt-1">Mark attendance for {selectedDate}</p>
                        <button onClick={() => setShowModal(true)}
                                className="mt-4 text-sm text-purple-600 hover:underline">
                            + Mark Attendance
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="sticky top-0 z-10">
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    {['Employee', 'Dept', 'Date', 'Check In', 'Check Out', 'Hours', 'Overtime', 'Status', 'Notes', 'Actions']
                                        .map(h => (
                                            <th key={h} className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3 whitespace-nowrap">
                                                {h}
                                            </th>
                                        ))}
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                {paginated.map(rec => (
                                    <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 text-xs font-bold flex-shrink-0">
                                                    {getEmpName(rec).charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-800 whitespace-nowrap">{getEmpName(rec)}</p>
                                                    <p className="text-xs text-slate-400">{rec.employeeCode}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">{rec.department || '—'}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                                            {new Date(rec.attendanceDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                                            <span className="text-green-600 font-medium">{formatTime(rec.checkIn)}</span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                                            <span className="text-red-500 font-medium">{formatTime(rec.checkOut)}</span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                                            {calcWorkingHours(rec.checkIn || '', rec.checkOut || '')}
                                        </td>
                                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <span className={calcOvertime(rec.checkIn || '', rec.checkOut || '') !== '—' ? 'text-purple-600 font-medium' : 'text-slate-400'}>
                          {calcOvertime(rec.checkIn || '', rec.checkOut || '')}
                        </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle(rec.status)}`}>
                          {rec.status}
                        </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-500 max-w-32 truncate">{rec.notes || '—'}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => openEdit(rec)}
                                                        className="p-1.5 hover:bg-purple-100 rounded-lg text-purple-600" title="Edit">
                                                    <Pencil size={13} />
                                                </button>
                                                <button onClick={() => { setDeleteId(rec.id); setShowDeleteModal(true) }}
                                                        className="p-1.5 hover:bg-red-100 rounded-lg text-red-500" title="Delete">
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                                <p className="text-xs text-slate-500">
                                    Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
                                </p>
                                <div className="flex gap-1">
                                    <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                                            className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-40">
                                        <ChevronLeft size={16} />
                                    </button>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button key={i} onClick={() => setPage(i + 1)}
                                                className={`w-7 h-7 text-xs rounded ${page === i + 1 ? 'bg-purple-600 text-white' : 'hover:bg-slate-100 text-slate-600'}`}>
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                                            className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-40">
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ── Mark/Edit Modal ── */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
                        <div className="flex items-center justify-between p-5 border-b border-slate-100">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800">
                                    {editRecord ? 'Edit Attendance' : 'Mark Attendance'}
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">Fill details below</p>
                            </div>
                            <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-lg">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Employee *</label>
                                <select value={form.employeeId} required
                                        onChange={e => setForm({ ...form, employeeId: Number(e.target.value) })}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                                    <option value={0}>Select Employee</option>

                                    {employees.map((e: Employee) => (
                                        <option key={e.id} value={e.id}>
                                            {e.name} ({e.employeeCode})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Date *</label>
                                <input type="date" value={form.attendanceDate} required
                                       onChange={e => setForm({ ...form, attendanceDate: e.target.value })}
                                       className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Check In</label>
                                    <input type="time" value={form.checkIn || ''}
                                           onChange={e => {
                                               const newStatus = autoStatus(e.target.value)
                                               setForm({ ...form, checkIn: e.target.value, status: newStatus })
                                           }}
                                           className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Check Out</label>
                                    <input type="time" value={form.checkOut || ''}
                                           onChange={e => setForm({ ...form, checkOut: e.target.value })}
                                           className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                </div>
                            </div>

                            {/* Live preview */}
                            {form.checkIn && form.checkOut && (
                                <div className="bg-purple-50 rounded-xl p-3 flex items-center justify-between">
                                    <span className="text-xs text-purple-700">Working Hours</span>
                                    <span className="text-sm font-bold text-purple-700">
                    {calcWorkingHours(form.checkIn, form.checkOut)}
                  </span>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                                <select value={form.status}
                                        onChange={e => setForm({ ...form, status: e.target.value })}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                                    {['PRESENT', 'ABSENT', 'LATE', 'HALF DAY', 'ON LEAVE'].map(s => (
                                        <option key={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
                                <textarea value={form.notes || ''} rows={2}
                                          onChange={e => setForm({ ...form, notes: e.target.value })}
                                          placeholder="Optional notes..."
                                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
                            </div>

                            <div className="flex gap-3 pt-1">
                                <button type="button" onClick={closeModal}
                                        className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm hover:bg-slate-50">
                                    Cancel
                                </button>
                                <button type="submit"
                                        className="flex-1 bg-purple-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-purple-700 flex items-center justify-center gap-2">
                                    <Save size={16} />
                                    {editRecord ? 'Update' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Delete Confirm Modal ── */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle size={24} className="text-red-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">Delete Record?</h3>
                        <p className="text-sm text-slate-500 mb-6">This attendance record will be permanently deleted.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm hover:bg-slate-50">
                                Cancel
                            </button>
                            <button onClick={() => deleteId && deleteMutation.mutate(deleteId)}
                                    className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-600">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AttendancePage
