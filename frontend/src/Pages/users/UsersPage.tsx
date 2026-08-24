import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    Pencil, Plus, ShieldCheck, Trash2, UserCog, X,
    Search, Filter, Users, UserCheck, UserX, Mail,
    ChevronDown, AlertTriangle, Eye, ArrowUpDown,
    ChevronLeft, ChevronRight, Lock, RefreshCw,
    Shield, Phone, Briefcase, Calendar,
    Download, MoreHorizontal, CheckSquare
} from 'lucide-react'
import toast from 'react-hot-toast'
import { adminService, type Role, type UserRecord } from '../../services/adminService'
import { getApiErrorMessage } from '../../services/api'

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface UserForm {
    username: string
    fullName: string
    email: string
    phoneNumber: string
    designation: string
    status: string
    password: string
}

interface FormErrors {
    [key: string]: string
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_FORM: UserForm = {
    username: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    designation: '',
    status: 'ACTIVE',
    password: '',
}

const ROWS_OPTIONS = [10, 25, 50]

const ROLE_COLORS: Record<string, string> = {
    SUPER_ADMIN:     'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
    ADMIN:           'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
    HR:              'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    MANAGER:         'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    TEAM_LEAD:       'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
    EMPLOYEE:        'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    INTERN:          'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200',
    PAYROLL_MANAGER: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
}

const getRoleColor = (name: string) =>
    ROLE_COLORS[name.toUpperCase().replace(/\s+/g, '_')] ?? 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const getInitials = (name: string) =>
    (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

const AVATAR_COLORS = [
    'from-purple-500 to-violet-600',
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-500',
    'from-amber-400 to-orange-500',
    'from-rose-500 to-pink-600',
    'from-cyan-500 to-sky-600',
]

const getAvatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length]

// ─────────────────────────────────────────────────────────────────────────────
// SMALL COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const Avatar = ({ user, size = 'md' }: { user: UserRecord; size?: 'sm' | 'md' | 'lg' }) => {
    const name  = user.fullName || user.username
    const sz    = size === 'lg' ? 'w-16 h-16 text-xl' : size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'
    const color = getAvatarColor(user.id)
    return (
        <div className={`${sz} flex-shrink-0 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold ring-2 ring-white`}>
            {getInitials(name)}
        </div>
    )
}

const StatusBadge = ({ status }: { status: string }) => (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${
        status === 'ACTIVE'
            ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
            : 'bg-slate-100 text-slate-500 ring-slate-200'
    }`}>
        <span className={`h-1.5 w-1.5 rounded-full ${status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
        {status}
    </span>
)

const VerifyBadge = ({ verified }: { verified: boolean }) => (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${
        verified
            ? 'bg-blue-50 text-blue-700 ring-blue-200'
            : 'bg-amber-50 text-amber-700 ring-amber-200'
    }`}>
        {verified ? <UserCheck size={10} /> : <Mail size={10} />}
        {verified ? 'Verified' : 'Pending'}
    </span>
)

const RoleChip = ({ name }: { name: string }) => (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${getRoleColor(name)}`}>
        {name}
    </span>
)

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON ROW
// ─────────────────────────────────────────────────────────────────────────────

const SkeletonRow = () => (
    <tr className="animate-pulse">
        {Array.from({ length: 7 }).map((_, i) => (
            <td key={i} className="px-4 py-4">
                <div className="h-3.5 rounded-full bg-slate-200" style={{ width: `${45 + (i * 15) % 40}%` }} />
            </td>
        ))}
    </tr>
)

// ─────────────────────────────────────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────────────────────────────────────

const StatCard = ({
                      icon: Icon, label, value, color, sub,
                  }: {
    icon: React.ElementType
    label: string
    value: number | string
    color: string
    sub?: string
}) => (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
        <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${color}`}>
            <Icon size={20} className="text-white" />
        </div>
        <div className="min-w-0">
            <p className="text-xl font-extrabold leading-none text-slate-800 tabular-nums">{value}</p>
            <p className="mt-0.5 truncate text-xs font-medium text-slate-500">{label}</p>
            {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
        </div>
    </div>
)

// ─────────────────────────────────────────────────────────────────────────────
// DELETE MODAL
// ─────────────────────────────────────────────────────────────────────────────

const DeleteModal = ({
                         name, onConfirm, onCancel, loading,
                     }: {
    name: string
    onConfirm: () => void
    onCancel: () => void
    loading: boolean
}) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100">
                <AlertTriangle size={28} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Delete User?</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
                You are about to permanently delete{' '}
                <span className="font-semibold text-slate-700">{name}</span>.
                This cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
                <button
                    onClick={onCancel}
                    className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    disabled={loading}
                    className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-60"
                >
                    {loading ? 'Deleting...' : 'Yes, Delete'}
                </button>
            </div>
        </div>
    </div>
)

// ─────────────────────────────────────────────────────────────────────────────
// USER DETAIL DRAWER
// ─────────────────────────────────────────────────────────────────────────────

const UserDrawer = ({
                        user,
                        onClose,
                        onEdit,
                    }: {
    user: UserRecord
    onClose: () => void
    onEdit: () => void
}) => {
    const name = user.fullName || user.username

    const infoRows = [
        { icon: Mail,      label: 'Email',       value: user.email },
        { icon: Phone,     label: 'Phone',       value: user.phoneNumber },
        { icon: Briefcase, label: 'Designation', value: user.designation },
        { icon: Calendar,  label: 'Status',      value: user.status },
    ].filter(r => r.value)

    const summaryCards = [
        { label: 'Leave Balance', value: '12 days', sub: 'Remaining' },
        { label: 'Attendance',    value: '94%',     sub: 'This month' },
        { label: 'Last Login',    value: 'Today',   sub: '9:00 AM' },
        { label: 'Sessions',      value: '1',       sub: 'Active' },
    ]

    const activityLog = [
        { text: 'Password changed',       time: '2 days ago' },
        { text: 'Role updated to Admin',  time: '1 week ago' },
        { text: 'Email verified',         time: '2 weeks ago' },
        { text: 'Account created',        time: '1 month ago' },
    ]

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
            <div className="flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl">

                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur">
                    <h3 className="text-sm font-bold text-slate-800">User Profile</h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onEdit}
                            className="flex items-center gap-1.5 rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 transition-colors hover:bg-purple-100"
                        >
                            <Pencil size={12} /> Edit
                        </button>
                        <button onClick={onClose} className="rounded-lg p-1.5 transition-colors hover:bg-slate-100">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Profile Hero */}
                <div className="border-b border-slate-100 bg-gradient-to-br from-purple-50 to-violet-50 p-6">
                    <div className="flex items-center gap-4">
                        <Avatar user={user} size="lg" />
                        <div>
                            <h4 className="text-xl font-bold text-slate-800">{name}</h4>
                            <p className="text-sm text-purple-600 font-medium">@{user.username}</p>
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                                <StatusBadge status={user.status} />
                                <VerifyBadge verified={user.emailVerified} />
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                        {user.roles.map(r => <RoleChip key={r.roleName} name={r.roleName} />)}
                    </div>
                </div>

                {/* Info List */}
                <div className="space-y-3 border-b border-slate-100 p-5">
                    {infoRows.map(({ icon: Icon, label, value }) => (
                        <div key={label} className="flex items-start gap-3">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-purple-50">
                                <Icon size={13} className="text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">{label}</p>
                                <p className="text-sm font-medium text-slate-800">{value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary Cards */}
                <div className="border-b border-slate-100 p-5">
                    <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Summary</p>
                    <div className="grid grid-cols-2 gap-3">
                        {summaryCards.map(c => (
                            <div key={c.label} className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                                <p className="text-xs text-slate-400">{c.label}</p>
                                <p className="mt-0.5 text-base font-bold text-slate-800">{c.value}</p>
                                <p className="text-xs text-slate-400">{c.sub}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Security */}
                <div className="border-b border-slate-100 p-5">
                    <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Security</p>
                    <div className="flex flex-wrap gap-2">
                        <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50">
                            <RefreshCw size={12} /> Reset Password
                        </button>
                        <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50">
                            <Lock size={12} /> Force Logout
                        </button>
                        <button className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100">
                            <Shield size={12} /> {user.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </button>
                    </div>
                </div>

                {/* Activity Timeline */}
                <div className="p-5">
                    <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">Audit Log</p>
                    <div className="relative space-y-4 pl-4">
                        <div className="absolute bottom-1.5 left-0 top-1.5 w-px bg-slate-200" />
                        {activityLog.map((log, i) => (
                            <div key={i} className="relative flex items-start gap-3">
                                <div className="absolute -left-4 top-1.5 h-2 w-2 rounded-full bg-purple-400 ring-2 ring-white" />
                                <div>
                                    <p className="text-sm text-slate-700">{log.text}</p>
                                    <p className="mt-0.5 text-xs text-slate-400">{log.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// FORM FIELD
// ─────────────────────────────────────────────────────────────────────────────

const Field = ({
                   label, required, error, children,
               }: {
    label: string
    required?: boolean
    error?: string
    children: React.ReactNode
}) => (
    <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            {label}{required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
        {children}
        {error && (
            <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                <AlertTriangle size={10} />{error}
            </p>
        )}
    </div>
)

const inputCls = (hasError = false) =>
    `w-full rounded-xl border px-3 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
        hasError ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white hover:border-slate-300'
    }`

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

const UsersPage = () => {
    const queryClient = useQueryClient()

    // UI state
    const [search, setSearch]               = useState('')
    const [filterRole, setFilterRole]       = useState('')
    const [filterStatus, setFilterStatus]   = useState('')
    const [filterVerify, setFilterVerify]   = useState('')
    const [sortBy, setSortBy]               = useState<'name' | 'newest' | 'status'>('name')
    const [showFilters, setShowFilters]     = useState(false)
    const [page, setPage]                   = useState(1)
    const [rowsPerPage, setRowsPerPage]     = useState(10)
    const [selected, setSelected]           = useState<number[]>([])

    // Modal / drawer state
    const [showModal, setShowModal]         = useState(false)
    const [editUser, setEditUser]           = useState<UserRecord | null>(null)
    const [viewUser, setViewUser]           = useState<UserRecord | null>(null)
    const [deleteTarget, setDeleteTarget]   = useState<UserRecord | null>(null)
    const [form, setForm]                   = useState<UserForm>(DEFAULT_FORM)
    const [errors, setErrors]               = useState<FormErrors>({})
    const [selectedRole, setSelectedRole]   = useState<Record<number, string>>({})

    // ── Queries ───────────────────────────────────────────────────────────────

    const { data: users = [], isLoading } = useQuery({
        queryKey: ['admin-users'],
        queryFn: () => adminService.getUsers().then(r => r.data),
    })

    const { data: roles = [] } = useQuery({
        queryKey: ['roles'],
        queryFn: () => adminService.getRoles().then(r => r.data),
    })

    const availableRoleNames = useMemo(() => roles.map((r: Role) => r.roleName), [roles])

    // ── Mutations ─────────────────────────────────────────────────────────────

    const createMutation = useMutation({
        mutationFn: () => adminService.createUser(form),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] })
            toast.success('User created!')
            closeModal()
        },
        onError: (err: Error) => toast.error(getApiErrorMessage(err, 'Failed to create user')),
    })

    const updateMutation = useMutation({
        mutationFn: () =>
            adminService.updateUser(editUser!.id, {
                username:    form.username,
                fullName:    form.fullName,
                email:       form.email,
                phoneNumber: form.phoneNumber,
                designation: form.designation,
                status:      form.status,
                password:    form.password || undefined,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] })
            toast.success('User updated!')
            closeModal()
        },
        onError: (err: Error) => toast.error(getApiErrorMessage(err, 'Failed to update user')),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => adminService.deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] })
            toast.success('User deleted.')
            setDeleteTarget(null)
        },
        onError: (err: Error) => toast.error(getApiErrorMessage(err, 'Failed to delete user')),
    })

    const assignRoleMutation = useMutation({
        mutationFn: ({ userId, roleName }: { userId: number; roleName: string }) =>
            adminService.assignRole(userId, roleName),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] })
            toast.success('Role assigned!')
        },
        onError: (err: Error) => toast.error(getApiErrorMessage(err, 'Failed to assign role')),
    })

    // ── Helpers ───────────────────────────────────────────────────────────────

    const closeModal = () => {
        setShowModal(false)
        setEditUser(null)
        setForm(DEFAULT_FORM)
        setErrors({})
    }

    const openCreate = () => {
        setEditUser(null)
        setForm(DEFAULT_FORM)
        setErrors({})
        setShowModal(true)
    }

    const openEdit = (user: UserRecord) => {
        setEditUser(user)
        setForm({
            username:    user.username,
            fullName:    user.fullName ?? '',
            email:       user.email,
            phoneNumber: user.phoneNumber ?? '',
            designation: user.designation ?? '',
            status:      user.status,
            password:    '',
        })
        setErrors({})
        setShowModal(true)
        setViewUser(null)
    }

    const handleFieldChange = (field: keyof UserForm, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }))
        setErrors(prev => ({ ...prev, [field]: '' }))
    }

    const validate = (): boolean => {
        const e: FormErrors = {}
        if (!form.username.trim())  e.username = 'Username is required'
        if (!form.email.trim())     e.email    = 'Email is required'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'

        // Duplicate email check
        const dup = users.find(u => u.email === form.email && u.id !== editUser?.id)
        if (dup) e.email = 'This email is already in use'

        if (!editUser && !form.password.trim()) e.password = 'Password is required'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return
        if (editUser) updateMutation.mutate()
        else createMutation.mutate()
    }

    const handleExportCSV = () => {
        if (!users.length) return
        const headers = ['ID', 'Username', 'Full Name', 'Email', 'Phone', 'Designation', 'Status', 'Verified', 'Roles']
        const rows = users.map(u => [
            u.id, u.username, u.fullName, u.email, u.phoneNumber,
            u.designation, u.status, u.emailVerified,
            u.roles.map((r: Role) => r.roleName).join(';'),
        ].map(v => `"${v ?? ''}"`).join(','))
        const csv  = [headers.join(','), ...rows].join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url  = URL.createObjectURL(blob)
        Object.assign(document.createElement('a'), { href: url, download: 'users.csv' }).click()
        URL.revokeObjectURL(url)
        toast.success('CSV exported!')
    }

    // Toggle select all on current page
    const toggleSelectAll = () => {
        const ids = paginated.map(u => u.id)
        const allSelected = ids.every(id => selected.includes(id))
        setSelected(allSelected ? selected.filter(id => !ids.includes(id)) : [...new Set([...selected, ...ids])])
    }

    // ── Filter + Sort + Paginate ──────────────────────────────────────────────

    const filtered = useMemo(() => {
        const q = search.toLowerCase()
        return users
            .filter(u => {
                const matchSearch =
                    !q ||
                    u.username.toLowerCase().includes(q) ||
                    (u.fullName?.toLowerCase().includes(q) ?? false) ||
                    u.email.toLowerCase().includes(q)
                const matchRole   = !filterRole   || u.roles.some((r: Role) => r.roleName === filterRole)
                const matchStatus = !filterStatus || u.status === filterStatus
                const matchVerify = !filterVerify ||
                    (filterVerify === 'verified' ? u.emailVerified : !u.emailVerified)
                return matchSearch && matchRole && matchStatus && matchVerify
            })
            .sort((a, b) => {
                if (sortBy === 'name')   return (a.fullName || a.username).localeCompare(b.fullName || b.username)
                if (sortBy === 'status') return a.status.localeCompare(b.status)
                return b.id - a.id // newest
            })
    }, [users, search, filterRole, filterStatus, filterVerify, sortBy])

    const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage))
    const safePage   = Math.min(page, totalPages)
    const paginated  = filtered.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage)

    const clearFilters = () => {
        setSearch(''); setFilterRole(''); setFilterStatus(''); setFilterVerify(''); setPage(1)
    }
    const hasFilters = !!(search || filterRole || filterStatus || filterVerify)

    // ── Stats ─────────────────────────────────────────────────────────────────

    const totalUsers    = users.length
    const activeUsers   = users.filter(u => u.status === 'ACTIVE').length
    const pendingVerify = users.filter(u => !u.emailVerified).length
    const adminCount    = users.filter(u => u.roles.some((r: Role) => r.roleName === 'ADMIN')).length

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-5 pb-8">

            {/* PAGE HEADER */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">Users</h2>
                    <p className="mt-0.5 text-sm text-slate-500">Manage platform users, roles, and access control</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                    >
                        <Download size={14} /> Export
                    </button>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-purple-200 transition-all hover:from-purple-700 hover:to-violet-700"
                    >
                        <Plus size={15} /> Add User
                    </button>
                </div>
            </div>

            {/* STAT CARDS */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard icon={Users}     label="Total Users"         value={totalUsers}    color="from-purple-500 to-violet-600" />
                <StatCard icon={UserCheck} label="Active"              value={activeUsers}   color="from-emerald-500 to-teal-500" />
                <StatCard icon={Mail}      label="Pending Verification" value={pendingVerify} color="from-amber-400 to-orange-500" />
                <StatCard icon={Shield}    label="Admins"              value={adminCount}    color="from-blue-500 to-indigo-600" />
            </div>

            {/* SEARCH & FILTERS */}
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative min-w-[200px] flex-1">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1) }}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(f => !f)}
                        className={`flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                            showFilters
                                ? 'border-purple-200 bg-purple-50 text-purple-700'
                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <Filter size={14} /> Filters
                        {hasFilters && <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />}
                    </button>

                    {/* Sort */}
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value as typeof sortBy)}
                            className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-8 pr-8 text-sm font-medium text-slate-600 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="name">Name A–Z</option>
                            <option value="newest">Newest First</option>
                            <option value="status">By Status</option>
                        </select>
                        <ArrowUpDown size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>

                    {hasFilters && (
                        <button onClick={clearFilters} className="px-2 text-sm font-medium text-purple-600 hover:text-purple-700">
                            Clear all
                        </button>
                    )}
                    <span className="ml-auto whitespace-nowrap text-sm text-slate-400">
                        <span className="font-bold text-slate-700">{filtered.length}</span> of {totalUsers}
                    </span>
                </div>

                {showFilters && (
                    <div className="mt-3 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-3">
                        {/* Role filter */}
                        <div className="relative">
                            <select
                                value={filterRole}
                                onChange={e => { setFilterRole(e.target.value); setPage(1) }}
                                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-8 text-sm text-slate-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="">All Roles</option>
                                {availableRoleNames.map((rn: string) => <option key={rn} value={rn}>{rn}</option>)}
                            </select>
                            <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>

                        {/* Status filter */}
                        <div className="relative">
                            <select
                                value={filterStatus}
                                onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
                                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-8 text-sm text-slate-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="">All Statuses</option>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                            <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>

                        {/* Verification filter */}
                        <div className="relative">
                            <select
                                value={filterVerify}
                                onChange={e => { setFilterVerify(e.target.value); setPage(1) }}
                                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-8 text-sm text-slate-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="">All Verification</option>
                                <option value="verified">Verified</option>
                                <option value="pending">Pending</option>
                            </select>
                            <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>
                )}

                {/* Bulk actions bar */}
                {selected.length > 0 && (
                    <div className="mt-3 flex items-center gap-3 rounded-xl border border-purple-200 bg-purple-50 px-4 py-2.5">
                        <CheckSquare size={16} className="text-purple-600" />
                        <span className="text-sm font-semibold text-purple-700">{selected.length} selected</span>
                        <div className="ml-auto flex gap-2">
                            <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                                <UserCheck size={12} className="mr-1 inline" /> Activate
                            </button>
                            <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                                <UserX size={12} className="mr-1 inline" /> Deactivate
                            </button>
                            <button
                                onClick={() => setSelected([])}
                                className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-600"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* TABLE */}
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/70">
                            <th className="w-10 px-4 py-3.5">
                                <input
                                    type="checkbox"
                                    checked={paginated.length > 0 && paginated.every(u => selected.includes(u.id))}
                                    onChange={toggleSelectAll}
                                    className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                                />
                            </th>
                            {['User', 'Roles', 'Status', 'Verification', 'Assign Role', 'Actions'].map(h => (
                                <th key={h} className="whitespace-nowrap px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    {h}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                        {isLoading
                            ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                            : paginated.length === 0
                                ? (
                                    <tr><td colSpan={7}>
                                        <div className="flex flex-col items-center justify-center py-20 text-center">
                                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50">
                                                <UserCog size={28} className="text-purple-300" />
                                            </div>
                                            <p className="text-base font-semibold text-slate-600">No users found</p>
                                            <p className="mt-1 text-sm text-slate-400">
                                                {hasFilters ? 'Try adjusting your filters' : 'Click "Add User" to get started'}
                                            </p>
                                            {hasFilters && (
                                                <button onClick={clearFilters} className="mt-3 text-sm font-medium text-purple-600 hover:text-purple-700">
                                                    Clear filters
                                                </button>
                                            )}
                                        </div>
                                    </td></tr>
                                )
                                : paginated.map(user => (
                                    <tr key={user.id} className="group transition-colors hover:bg-purple-50/20">
                                        <td className="px-4 py-3.5">
                                            <input
                                                type="checkbox"
                                                checked={selected.includes(user.id)}
                                                onChange={() =>
                                                    setSelected(prev =>
                                                        prev.includes(user.id)
                                                            ? prev.filter(id => id !== user.id)
                                                            : [...prev, user.id]
                                                    )
                                                }
                                                className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                                            />
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <Avatar user={user} size="sm" />
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-800">
                                                        {user.fullName || user.username}
                                                    </p>
                                                    <p className="text-xs text-slate-400">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex flex-wrap gap-1">
                                                {user.roles.length > 0
                                                    ? user.roles.map((r: Role) => <RoleChip key={r.roleName} name={r.roleName} />)
                                                    : <span className="text-xs text-slate-400">No roles</span>
                                                }
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <StatusBadge status={user.status} />
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <VerifyBadge verified={user.emailVerified} />
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <div className="relative">
                                                    <select
                                                        value={selectedRole[user.id] ?? ''}
                                                        onChange={e => setSelectedRole(prev => ({ ...prev, [user.id]: e.target.value }))}
                                                        className="appearance-none rounded-lg border border-slate-200 py-1.5 pl-2.5 pr-7 text-xs text-slate-700 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-purple-400"
                                                    >
                                                        <option value="">Select role</option>
                                                        {availableRoleNames.map((rn: string) => (
                                                            <option key={rn} value={rn}>{rn}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown size={11} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const rn = selectedRole[user.id]
                                                        if (!rn) { toast.error('Select a role first'); return }
                                                        assignRoleMutation.mutate({ userId: user.id, roleName: rn })
                                                    }}
                                                    className="rounded-lg bg-purple-50 p-1.5 text-purple-700 transition-colors hover:bg-purple-100"
                                                    title="Assign role"
                                                >
                                                    <ShieldCheck size={15} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-0.5 opacity-60 transition-opacity group-hover:opacity-100">
                                                <button
                                                    onClick={() => setViewUser(user)}
                                                    title="View profile"
                                                    className="rounded-lg p-1.5 text-purple-600 transition-colors hover:bg-purple-100"
                                                >
                                                    <Eye size={14} />
                                                </button>
                                                <button
                                                    onClick={() => openEdit(user)}
                                                    title="Edit"
                                                    className="rounded-lg p-1.5 text-blue-500 transition-colors hover:bg-blue-100"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(user)}
                                                    title="Delete"
                                                    className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-100"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                                <button
                                                    title="More actions"
                                                    className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100"
                                                >
                                                    <MoreHorizontal size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                        }
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                {!isLoading && filtered.length > 0 && (
                    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/40 px-4 py-3 sm:flex-row">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span>Show</span>
                            <select
                                value={rowsPerPage}
                                onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(1) }}
                                className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-purple-500"
                            >
                                {ROWS_OPTIONS.map(r => <option key={r}>{r}</option>)}
                            </select>
                            <span>
                                per page ·{' '}
                                <strong className="text-slate-700">{(safePage - 1) * rowsPerPage + 1}–{Math.min(safePage * rowsPerPage, filtered.length)}</strong>
                                {' '}of{' '}
                                <strong className="text-slate-700">{filtered.length}</strong>
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={safePage === 1}
                                className="rounded-lg p-1.5 text-slate-600 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
                                <button
                                    key={pg}
                                    onClick={() => setPage(pg)}
                                    className={`h-8 w-8 rounded-lg text-xs font-semibold transition-colors ${
                                        pg === safePage
                                            ? 'bg-purple-600 text-white shadow-sm shadow-purple-200'
                                            : 'text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {pg}
                                </button>
                            ))}
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={safePage === totalPages}
                                className="rounded-lg p-1.5 text-slate-600 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ADD / EDIT MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="flex max-h-[92vh] w-full max-w-xl flex-col rounded-2xl bg-white shadow-2xl">

                        {/* Header */}
                        <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
                            <div>
                                <h3 className="text-base font-bold text-slate-800">
                                    {editUser ? 'Edit User' : 'Add New User'}
                                </h3>
                                <p className="mt-0.5 text-xs text-slate-400">
                                    {editUser ? 'Update user details and permissions' : 'Fill in details to create a new user'}
                                </p>
                            </div>
                            <button onClick={closeModal} className="rounded-xl p-1.5 transition-colors hover:bg-slate-100">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto px-6 py-5">
                            <form onSubmit={handleSubmit} id="user-form" className="space-y-5">

                                {/* Identity */}
                                <section>
                                    <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Identity</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Field label="Username" required error={errors.username}>
                                            <input
                                                value={form.username}
                                                onChange={e => handleFieldChange('username', e.target.value)}
                                                placeholder="e.g. ankit_yadav"
                                                className={inputCls(!!errors.username)}
                                            />
                                        </Field>
                                        <Field label="Full Name">
                                            <input
                                                value={form.fullName}
                                                onChange={e => handleFieldChange('fullName', e.target.value)}
                                                placeholder="Ankit Yadav"
                                                className={inputCls()}
                                            />
                                        </Field>
                                        <Field label="Email" required error={errors.email}>
                                            <input
                                                type="email"
                                                value={form.email}
                                                onChange={e => handleFieldChange('email', e.target.value)}
                                                placeholder="ankit@nexushr.com"
                                                className={inputCls(!!errors.email)}
                                            />
                                        </Field>
                                        <Field label="Phone">
                                            <input
                                                value={form.phoneNumber}
                                                onChange={e => handleFieldChange('phoneNumber', e.target.value)}
                                                placeholder="9876543210"
                                                className={inputCls()}
                                            />
                                        </Field>
                                    </div>
                                </section>

                                {/* Role & Status */}
                                <section>
                                    <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Role & Status</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Field label="Designation">
                                            <input
                                                value={form.designation}
                                                onChange={e => handleFieldChange('designation', e.target.value)}
                                                placeholder="e.g. Senior Engineer"
                                                className={inputCls()}
                                            />
                                        </Field>
                                        <Field label="Status">
                                            <div className="relative">
                                                <select
                                                    value={form.status}
                                                    onChange={e => handleFieldChange('status', e.target.value)}
                                                    className={`${inputCls()} appearance-none pr-8`}
                                                >
                                                    <option value="ACTIVE">ACTIVE</option>
                                                    <option value="INACTIVE">INACTIVE</option>
                                                </select>
                                                <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            </div>
                                        </Field>
                                    </div>
                                </section>

                                {/* Security */}
                                <section>
                                    <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Security</p>
                                    <Field
                                        label={editUser ? 'New Password (leave blank to keep current)' : 'Password'}
                                        required={!editUser}
                                        error={errors.password}
                                    >
                                        <input
                                            type="password"
                                            value={form.password}
                                            onChange={e => handleFieldChange('password', e.target.value)}
                                            placeholder={editUser ? '••••••••' : 'Min 8 characters'}
                                            className={inputCls(!!errors.password)}
                                        />
                                    </Field>
                                </section>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="flex flex-shrink-0 gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
                            >
                                Cancel
                            </button>
                            <button
                                form="user-form"
                                type="submit"
                                disabled={createMutation.isPending || updateMutation.isPending}
                                className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-purple-200 transition-all hover:from-purple-700 hover:to-violet-700 disabled:opacity-60"
                            >
                                {createMutation.isPending || updateMutation.isPending
                                    ? 'Saving...'
                                    : editUser ? 'Update User' : 'Create User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE MODAL */}
            {deleteTarget && (
                <DeleteModal
                    name={deleteTarget.fullName || deleteTarget.username}
                    loading={deleteMutation.isPending}
                    onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}

            {/* USER DETAIL DRAWER */}
            {viewUser && (
                <UserDrawer
                    user={viewUser}
                    onClose={() => setViewUser(null)}
                    onEdit={() => openEdit(viewUser)}
                />
            )}
        </div>
    )
}

export default UsersPage