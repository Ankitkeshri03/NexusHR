import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, ClipboardList, Plus, X, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import api, { getApiErrorMessage } from '../../services/api'
import { useAuth } from '../../context/useAuth'

interface LeaveRecord {
    id: number
    employeeId: number
    leaveType: string
    startDate: string
    endDate: string
    reason: string
    approvalStatus: string
    approvedBy: number | null
    createdAt: string
}

interface Employee {
    id: number
    name: string
    employeeCode: string
}

const normalizeStatus = (status: string | null | undefined) => (status ?? '').trim().toUpperCase()

const statusLabel = (status: string | null | undefined) => {
    const normalized = normalizeStatus(status)
    if (!normalized) {
        return 'Unknown'
    }

    return normalized.charAt(0) + normalized.slice(1).toLowerCase()
}

const LeavePage = () => {
    const { user } = useAuth()
    const queryClient = useQueryClient()
    const [showModal, setShowModal] = useState(false)
    const [activeTab, setActiveTab] = useState('ALL')
    const [form, setForm] = useState({
        employeeId: '',
        leaveType: 'Casual Leave',
        startDate: '',
        endDate: '',
        reason: '',
    })

    const { data: leaves = [], isLoading } = useQuery({
        queryKey: ['leaves'],
        queryFn: () => api.get<LeaveRecord[]>('/leaves').then(r => r.data),
    })

    const { data: employees = [] } = useQuery({
        queryKey: ['employees'],
        queryFn: () => api.get<Employee[]>('/employees').then(r => r.data),
    })

    const employeeMap = new Map(employees.map(employee => [employee.id, employee]))

    const createMutation = useMutation({
        mutationFn: () =>
            api.post('/leaves', {
                employeeId: Number(form.employeeId),
                leaveType: form.leaveType,
                startDate: form.startDate,
                endDate: form.endDate,
                reason: form.reason,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leaves'] })
            toast.success('Leave applied!')
            setShowModal(false)
            resetForm()
        },
        onError: error => toast.error(getApiErrorMessage(error, 'Failed to apply leave')),
    })

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) => {
            if (!user?.id) {
                throw new Error('Current user is unavailable')
            }

            return api.put(`/leaves/${id}/status`, {
                status,
                approvedBy: user.id,
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leaves'] })
            toast.success('Leave status updated!')
        },
        onError: error => toast.error(getApiErrorMessage(error, 'Failed to update leave status')),
    })

    const resetForm = () => {
        setForm({
            employeeId: '',
            leaveType: 'Casual Leave',
            startDate: '',
            endDate: '',
            reason: '',
        })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        createMutation.mutate()
    }

    const tabs = ['ALL', 'PENDING', 'APPROVED', 'REJECTED']

    const filtered = leaves.filter(leave => (activeTab === 'ALL' ? true : normalizeStatus(leave.approvalStatus) === activeTab))
    const pending = leaves.filter(leave => normalizeStatus(leave.approvalStatus) === 'PENDING').length
    const approved = leaves.filter(leave => normalizeStatus(leave.approvalStatus) === 'APPROVED').length
    const rejected = leaves.filter(leave => normalizeStatus(leave.approvalStatus) === 'REJECTED').length

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Leave Management</h2>
                    <p className="mt-0.5 text-sm text-slate-500">Manage employee leaves</p>
                </div>
                <button
                    onClick={() => {
                        resetForm()
                        setShowModal(true)
                    }}
                    className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700"
                >
                    <Plus size={16} />
                    Apply Leave
                </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-100 bg-white p-4 text-center shadow-sm">
                    <p className="text-2xl font-bold text-orange-500">{pending}</p>
                    <p className="mt-1 text-xs text-slate-500">Pending</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-white p-4 text-center shadow-sm">
                    <p className="text-2xl font-bold text-green-600">{approved}</p>
                    <p className="mt-1 text-xs text-slate-500">Approved</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-white p-4 text-center shadow-sm">
                    <p className="text-2xl font-bold text-red-500">{rejected}</p>
                    <p className="mt-1 text-xs text-slate-500">Rejected</p>
                </div>
            </div>

            <div className="flex gap-2">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                            activeTab === tab
                                ? 'bg-purple-600 text-white'
                                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        {statusLabel(tab)}
                    </button>
                ))}
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-20 text-center">
                        <ClipboardList size={40} className="mx-auto mb-3 text-slate-300" />
                        <p className="font-medium text-slate-500">No leave requests</p>
                        <p className="mt-1 text-sm text-slate-400">No {statusLabel(activeTab).toLowerCase()} leaves found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    <th className="px-5 py-3 text-left text-xs font-medium uppercase text-slate-500">Employee</th>
                                    <th className="px-5 py-3 text-left text-xs font-medium uppercase text-slate-500">Type</th>
                                    <th className="px-5 py-3 text-left text-xs font-medium uppercase text-slate-500">From</th>
                                    <th className="px-5 py-3 text-left text-xs font-medium uppercase text-slate-500">To</th>
                                    <th className="px-5 py-3 text-left text-xs font-medium uppercase text-slate-500">Reason</th>
                                    <th className="px-5 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                                    <th className="px-5 py-3 text-left text-xs font-medium uppercase text-slate-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.map(leave => {
                                    const employee = employeeMap.get(leave.employeeId)
                                    const normalized = normalizeStatus(leave.approvalStatus)
                                    return (
                                        <tr key={leave.id} className="hover:bg-slate-50">
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">
                                                        {(employee?.name ?? '?').charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-800">{employee?.name ?? `Employee #${leave.employeeId}`}</p>
                                                        <p className="text-xs text-slate-400">{employee?.employeeCode ?? 'Code unavailable'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-sm text-slate-600">{leave.leaveType}</span>
                                            </td>
                                            <td className="px-5 py-3.5 text-sm text-slate-600">{leave.startDate}</td>
                                            <td className="px-5 py-3.5 text-sm text-slate-600">{leave.endDate}</td>
                                            <td className="max-w-[200px] truncate px-5 py-3.5 text-sm text-slate-600">{leave.reason}</td>
                                            <td className="px-5 py-3.5">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                        normalized === 'APPROVED'
                                                            ? 'bg-green-100 text-green-700'
                                                            : normalized === 'PENDING'
                                                              ? 'bg-orange-100 text-orange-700'
                                                              : 'bg-red-100 text-red-700'
                                                    }`}
                                                >
                                                    {statusLabel(leave.approvalStatus)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                {normalized === 'PENDING' && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => updateStatusMutation.mutate({ id: leave.id, status: 'APPROVED' })}
                                                            className="rounded-lg p-1.5 text-green-600 hover:bg-green-100"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => updateStatusMutation.mutate({ id: leave.id, status: 'REJECTED' })}
                                                            className="rounded-lg p-1.5 text-red-500 hover:bg-red-100"
                                                            title="Reject"
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 p-5">
                            <h3 className="text-lg font-semibold text-slate-800">Apply Leave</h3>
                            <button onClick={() => setShowModal(false)} className="rounded-lg p-1.5 hover:bg-slate-100">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4 p-5">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">Employee</label>
                                <select
                                    value={form.employeeId}
                                    onChange={e => setForm({ ...form, employeeId: e.target.value })}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    required
                                >
                                    <option value="">Select Employee</option>
                                    {employees.map(employee => (
                                        <option key={employee.id} value={employee.id}>
                                            {employee.name} ({employee.employeeCode})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">Leave Type</label>
                                <select
                                    value={form.leaveType}
                                    onChange={e => setForm({ ...form, leaveType: e.target.value })}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option>Casual Leave</option>
                                    <option>Sick Leave</option>
                                    <option>Earned Leave</option>
                                    <option>Maternity Leave</option>
                                    <option>Paternity Leave</option>
                                    <option>Emergency Leave</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-slate-600">From Date</label>
                                    <input
                                        type="date"
                                        value={form.startDate}
                                        onChange={e => setForm({ ...form, startDate: e.target.value })}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-slate-600">To Date</label>
                                    <input
                                        type="date"
                                        value={form.endDate}
                                        onChange={e => setForm({ ...form, endDate: e.target.value })}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">Reason</label>
                                <textarea
                                    value={form.reason}
                                    onChange={e => setForm({ ...form, reason: e.target.value })}
                                    className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Reason for leave..."
                                    rows={3}
                                    required
                                />
                            </div>
                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 rounded-lg border border-slate-200 py-2 text-sm text-slate-600 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="flex-1 rounded-lg bg-purple-600 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {createMutation.isPending ? 'Submitting...' : 'Apply Leave'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default LeavePage
