import { useState, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    CheckCircle, DollarSign, Plus, X, Search, Download,
    TrendingUp, Clock, AlertCircle, FileText,
    ChevronLeft, ChevronRight, Filter, Printer
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

// ─── Types ──────────────────────────────────────────────────
interface PayrollRecord {
    id: number
    employeeId: number
    payrollMonth: number
    payrollYear: number
    basicSalary: number
    allowances: number
    deductions: number
    bonus: number
    netSalary: number
    paymentStatus: string
    paymentDate: string | null
    notes: string | null
}

interface Employee {
    id: number
    name: string
    employeeCode: string
    department?: string
}

const MONTHS = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
]

const getApiErrorMessage = (error: unknown, fallback: string) => {
    const e = error as { response?: { data?: { message?: string } } }
    return e?.response?.data?.message || fallback
}

// ─── Gradient Avatar ─────────────────────────────────────────
const gradients = [
    'from-purple-500 to-indigo-600',
    'from-blue-500 to-cyan-600',
    'from-green-500 to-emerald-600',
    'from-orange-500 to-red-500',
    'from-pink-500 to-rose-600',
]
const getGradient = (id: number) => gradients[id % gradients.length]

// ─── Payslip Modal ────────────────────────────────────────────
const PayslipModal = ({
                          record, employee, onClose
                      }: {
    record: PayrollRecord
    employee: Employee | undefined
    onClose: () => void
}) => {
    const handlePrint = () => window.print()

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-800">Payslip</h3>
                    <div className="flex gap-2">
                        <button onClick={handlePrint}
                                className="flex items-center gap-1.5 text-sm px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50">
                            <Printer size={15} /> Print
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
                            <X size={18} />
                        </button>
                    </div>
                </div>
                <div className="p-6" id="payslip-content">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold">NexusHR</h2>
                                <p className="text-purple-200 text-sm mt-0.5">Payslip</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-purple-200">Pay Period</p>
                                <p className="font-semibold">{MONTHS[record.payrollMonth - 1]} {record.payrollYear}</p>
                            </div>
                        </div>
                    </div>

                    {/* Employee Info */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-slate-50 rounded-xl p-4">
                            <p className="text-xs text-slate-500 mb-1">Employee Name</p>
                            <p className="font-semibold text-slate-800">{employee?.name || `EMP${record.employeeId}`}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4">
                            <p className="text-xs text-slate-500 mb-1">Employee Code</p>
                            <p className="font-semibold text-slate-800">{employee?.employeeCode || '—'}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4">
                            <p className="text-xs text-slate-500 mb-1">Department</p>
                            <p className="font-semibold text-slate-800">{employee?.department || '—'}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4">
                            <p className="text-xs text-slate-500 mb-1">Payment Status</p>
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                record.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                {record.paymentStatus === 'PAID' ? 'Paid' : 'Pending'}
              </span>
                        </div>
                    </div>

                    {/* Salary Breakdown */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
                        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
                            <p className="text-xs font-medium text-slate-600 uppercase">Salary Breakdown</p>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {[
                                { label: 'Basic Salary', value: record.basicSalary, color: 'text-slate-800' },
                                { label: 'Allowances', value: record.allowances, color: 'text-green-600', prefix: '+' },
                                { label: 'Bonus', value: record.bonus, color: 'text-emerald-600', prefix: '+' },
                                { label: 'Deductions', value: record.deductions, color: 'text-red-500', prefix: '-' },
                            ].map(item => (
                                <div key={item.label} className="flex justify-between px-4 py-3">
                                    <span className="text-sm text-slate-600">{item.label}</span>
                                    <span className={`text-sm font-medium ${item.color}`}>
                    {item.prefix || ''}₹{item.value.toLocaleString()}
                  </span>
                                </div>
                            ))}
                            <div className="flex justify-between px-4 py-3 bg-purple-50">
                                <span className="font-semibold text-purple-800">Net Salary</span>
                                <span className="font-bold text-purple-700 text-lg">₹{record.netSalary.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {record.paymentDate && (
                        <p className="text-xs text-slate-400 text-center">
                            Paid on {new Date(record.paymentDate).toLocaleDateString()}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

// ─── Main Page ────────────────────────────────────────────────
const PayrollPage = () => {
    const queryClient = useQueryClient()
    const [showModal, setShowModal] = useState(false)
    const [showPayslip, setShowPayslip] = useState<PayrollRecord | null>(null)

    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('All')
    const [page, setPage] = useState(1)
    const perPage = 8

    const [form, setForm] = useState({
        employeeId: '',
        month: MONTHS[new Date().getMonth()],
        year: new Date().getFullYear(),
        basicSalary: '',
        allowances: '',
        deductions: '',
        bonus: '',
    })

    const [selectedYear, selectedMonthNumber] = selectedMonth.split('-')

    // ── Queries ──
    const { data: payrolls = [], isLoading } = useQuery({
        queryKey: ['payroll', selectedMonth],
        queryFn: () =>
            api.get<PayrollRecord[]>('/payrolls', {
                params: { month: Number(selectedMonthNumber), year: Number(selectedYear) },
            }).then(r => r.data).catch(() => []),
    })

    const { data: employees = [] } = useQuery({
        queryKey: ['employees'],
        queryFn: () => api.get<Employee[]>('/employees').then(r => r.data),
    })

    const employeeMap = useMemo(
        () => new Map(employees.map(e => [e.id, e])),
        [employees]
    )

    // ── Mutations ──
    const createMutation = useMutation({
        mutationFn: () => api.post('/payrolls', {
            employeeId: Number(form.employeeId),
            payrollMonth: MONTHS.indexOf(form.month) + 1,
            payrollYear: form.year,
            basicSalary: Number(form.basicSalary),
            allowances: Number(form.allowances || 0),
            deductions: Number(form.deductions || 0),
            bonus: Number(form.bonus || 0),
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payroll'] })
            toast.success('Payroll generated!')
            setShowModal(false)
            resetForm()
        },
        onError: err => toast.error(getApiErrorMessage(err, 'Failed to generate payroll')),
    })

    const markPaidMutation = useMutation({
        mutationFn: (id: number) => api.patch(`/payrolls/${id}/mark-paid`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payroll'] })
            toast.success('Marked as paid!')
        },
        onError: err => toast.error(getApiErrorMessage(err, 'Failed to update')),
    })

    const resetForm = () => setForm({
        employeeId: '', month: MONTHS[new Date().getMonth()],
        year: new Date().getFullYear(), basicSalary: '',
        allowances: '', deductions: '', bonus: '',
    })

    // ── Filter ──
    const filtered = useMemo(() => payrolls.filter(p => {
        const emp = employeeMap.get(p.employeeId)
        const name = emp?.name?.toLowerCase() || ''
        const code = emp?.employeeCode?.toLowerCase() || ''
        const matchSearch = !search || name.includes(search.toLowerCase()) || code.includes(search.toLowerCase())
        const matchStatus = filterStatus === 'All' ||
            (filterStatus === 'Paid' && p.paymentStatus === 'PAID') ||
            (filterStatus === 'Pending' && p.paymentStatus !== 'PAID')
        return matchSearch && matchStatus
    }), [payrolls, search, filterStatus, employeeMap])

    const paginated = filtered.slice((page - 1) * perPage, page * perPage)
    const totalPages = Math.ceil(filtered.length / perPage)

    // ── Stats ──
    const totalPayroll = payrolls.reduce((s, p) => s + p.netSalary, 0)
    const paid = payrolls.filter(p => p.paymentStatus === 'PAID').length
    const pending = payrolls.filter(p => p.paymentStatus !== 'PAID').length
    const avgSalary = payrolls.length ? Math.round(totalPayroll / payrolls.length) : 0

    const netPreview =
        (Number(form.basicSalary) || 0) +
        (Number(form.allowances) || 0) +
        (Number(form.bonus) || 0) -
        (Number(form.deductions) || 0)

    // ── Export CSV ──
    const exportCSV = () => {
        const rows = [
            ['Employee', 'Code', 'Month', 'Basic', 'Allowances', 'Bonus', 'Deductions', 'Net Salary', 'Status'],
            ...filtered.map(p => {
                const e = employeeMap.get(p.employeeId)
                return [
                    e?.name || '', e?.employeeCode || '',
                    `${MONTHS[p.payrollMonth - 1]} ${p.payrollYear}`,
                    p.basicSalary, p.allowances, p.bonus, p.deductions,
                    p.netSalary, p.paymentStatus
                ]
            })
        ]
        const csv = rows.map(r => r.join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `payroll-${selectedMonth}.csv`; a.click()
        toast.success('CSV exported!')
    }

    return (
        <div className="space-y-6">

            {/* ── Header ── */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Payroll Management</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Manage and process employee salaries</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={exportCSV}
                            className="flex items-center gap-2 border border-slate-200 text-slate-600 px-3 py-2 rounded-lg text-sm hover:bg-slate-50">
                        <Download size={15} /> Export
                    </button>
                    <button onClick={() => { resetForm(); setShowModal(true) }}
                            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700">
                        <Plus size={16} /> Generate Payroll
                    </button>
                </div>
            </div>

            {/* ── Stats Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Payroll', value: `₹${totalPayroll.toLocaleString()}`, icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
                    { label: 'Employees Paid', value: paid, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
                    { label: 'Pending', value: pending, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
                    { label: 'Avg Salary', value: `₹${avgSalary.toLocaleString()}`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                ].map(s => (
                    <div key={s.label} className={`bg-white rounded-xl border ${s.border} shadow-sm p-4`}>
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center`}>
                                <s.icon size={20} className={s.color} />
                            </div>
                        </div>
                        <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* ── Filters ── */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        <Filter size={14} className="text-slate-400" />
                        <input type="month" value={selectedMonth}
                               onChange={e => setSelectedMonth(e.target.value)}
                               className="text-sm text-slate-700 bg-transparent focus:outline-none" />
                    </div>

                    <div className="relative flex-1 min-w-48">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Search employee..."
                               value={search} onChange={e => setSearch(e.target.value)}
                               className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    </div>

                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option>All</option>
                        <option>Paid</option>
                        <option>Pending</option>
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
                            <div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse" />
                        ))}
                    </div>
                ) : paginated.length === 0 ? (
                    <div className="text-center py-20">
                        <DollarSign size={48} className="mx-auto text-slate-200 mb-3" />
                        <p className="text-slate-500 font-medium">No payroll records</p>
                        <p className="text-sm text-slate-400 mt-1">
                            {search || filterStatus !== 'All' ? 'Try adjusting filters' : 'Generate payroll for this month'}
                        </p>
                        {!search && filterStatus === 'All' && (
                            <button onClick={() => setShowModal(true)}
                                    className="mt-4 text-sm text-purple-600 hover:underline">
                                + Generate Payroll
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="sticky top-0 z-10">
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    {['Employee', 'Period', 'Basic', 'Allowances', 'Bonus', 'Deductions', 'Net Salary', 'Status', 'Actions']
                                        .map(h => (
                                            <th key={h} className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3 whitespace-nowrap">
                                                {h}
                                            </th>
                                        ))}
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                {paginated.map(p => {
                                    const emp = employeeMap.get(p.employeeId)
                                    const isPaid = p.paymentStatus === 'PAID'
                                    return (
                                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getGradient(p.employeeId)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                                                        {(emp?.name || '?').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-800 whitespace-nowrap">
                                                            {emp?.name || `Employee #${p.employeeId}`}
                                                        </p>
                                                        <p className="text-xs text-slate-400">{emp?.employeeCode || '—'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 text-sm text-slate-600 whitespace-nowrap">
                                                {MONTHS[p.payrollMonth - 1]} {p.payrollYear}
                                            </td>
                                            <td className="px-4 py-3.5 text-sm text-slate-700">₹{p.basicSalary.toLocaleString()}</td>
                                            <td className="px-4 py-3.5 text-sm text-green-600 font-medium">+₹{p.allowances.toLocaleString()}</td>
                                            <td className="px-4 py-3.5 text-sm text-emerald-600 font-medium">+₹{p.bonus.toLocaleString()}</td>
                                            <td className="px-4 py-3.5 text-sm text-red-500 font-medium">-₹{p.deductions.toLocaleString()}</td>
                                            <td className="px-4 py-3.5">
                                                <span className="text-sm font-bold text-slate-800">₹{p.netSalary.toLocaleString()}</span>
                                            </td>
                                            <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              isPaid ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                            {isPaid ? <CheckCircle size={11} /> : <AlertCircle size={11} />}
                              {isPaid ? 'Paid' : 'Pending'}
                          </span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-1.5">
                                                    <button onClick={() => setShowPayslip(p)}
                                                            title="View Payslip"
                                                            className="p-1.5 hover:bg-purple-100 rounded-lg text-purple-600 text-xs">
                                                        <FileText size={14} />
                                                    </button>
                                                    {!isPaid && (
                                                        <button onClick={() => markPaidMutation.mutate(p.id)}
                                                                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 whitespace-nowrap">
                                                            <CheckCircle size={12} /> Mark Paid
                                                        </button>
                                                    )}
                                                    {isPaid && (
                                                        <span className="text-xs text-slate-400 whitespace-nowrap">
                                {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : 'Paid'}
                              </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                                <p className="text-xs text-slate-500">
                                    Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
                                </p>
                                <div className="flex items-center gap-1">
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

            {/* ── Generate Payroll Modal ── */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between p-5 border-b border-slate-100">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800">Generate Payroll</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Fill salary details below</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={e => { e.preventDefault(); createMutation.mutate() }} className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Employee *</label>
                                <select value={form.employeeId} required
                                        onChange={e => setForm({ ...form, employeeId: e.target.value })}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                                    <option value="">Select Employee</option>
                                    {employees.map(e => (
                                        <option key={e.id} value={e.id}>{e.name} ({e.employeeCode})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Month</label>
                                    <select value={form.month}
                                            onChange={e => setForm({ ...form, month: e.target.value })}
                                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                                        {MONTHS.map(m => <option key={m}>{m}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Year</label>
                                    <input type="number" value={form.year} min="2020" max="2035"
                                           onChange={e => setForm({ ...form, year: Number(e.target.value) })}
                                           className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Basic Salary (₹) *</label>
                                <input type="number" value={form.basicSalary} required placeholder="50000"
                                       onChange={e => setForm({ ...form, basicSalary: e.target.value })}
                                       className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { key: 'allowances', label: 'Allowances', placeholder: '5000' },
                                    { key: 'bonus', label: 'Bonus', placeholder: '0' },
                                    { key: 'deductions', label: 'Deductions', placeholder: '2000' },
                                ].map(f => (
                                    <div key={f.key}>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">{f.label}</label>
                                        <input type="number" value={form[f.key as keyof typeof form]}
                                               placeholder={f.placeholder}
                                               onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                               className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                    </div>
                                ))}
                            </div>

                            {form.basicSalary && (
                                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-xl p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-purple-600 font-medium">Net Salary Preview</p>
                                            <p className="text-2xl font-bold text-purple-700 mt-0.5">
                                                ₹{netPreview.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="text-right text-xs text-purple-500 space-y-0.5">
                                            <p>Basic: ₹{Number(form.basicSalary || 0).toLocaleString()}</p>
                                            <p className="text-green-600">+Allow: ₹{Number(form.allowances || 0).toLocaleString()}</p>
                                            <p className="text-red-500">-Ded: ₹{Number(form.deductions || 0).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-1">
                                <button type="button" onClick={() => setShowModal(false)}
                                        className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm hover:bg-slate-50">
                                    Cancel
                                </button>
                                <button type="submit" disabled={createMutation.isPending}
                                        className="flex-1 bg-purple-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-70">
                                    {createMutation.isPending ? 'Generating...' : 'Generate Payroll'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Payslip Modal ── */}
            {showPayslip && (
                <PayslipModal
                    record={showPayslip}
                    employee={employeeMap.get(showPayslip.employeeId)}
                    onClose={() => setShowPayslip(null)}
                />
            )}
        </div>
    )
}

export default PayrollPage