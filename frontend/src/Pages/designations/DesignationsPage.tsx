import { useState, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    BadgeCheck, Pencil, Plus, Trash2, X, Search, Filter,
    ChevronLeft, ChevronRight, ArrowUpDown, AlertTriangle,
    Users, Building2, Layers, ChevronDown,
    ToggleLeft, ToggleRight, Hash
} from 'lucide-react'
import toast from 'react-hot-toast'
import { adminService, type Department, type Designation } from '../../services/adminService'
import { getApiErrorMessage } from '../../services/api'

// ─────────────────────────────────────────────────────────────────────────────
// EXTENDED DESIGNATION TYPE
// Extends the base Designation from adminService with extra HR fields
// ─────────────────────────────────────────────────────────────────────────────

interface ExtendedDesignation extends Designation {
    level?: string
    salaryRangeMin?: number | null
    salaryRangeMax?: number | null
    designationCode?: string
    status?: 'ACTIVE' | 'INACTIVE'
    employeeCount?: number
}

// ─────────────────────────────────────────────────────────────────────────────
// FORM & ERROR TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface DesignationFormData {
    designationName: string
    description: string
    departmentId: string
    level: string
    salaryRangeMin: string
    salaryRangeMax: string
    designationCode: string
    status: 'ACTIVE' | 'INACTIVE'
}

interface FormErrors {
    [key: string]: string
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const LEVELS = ['Intern', 'Junior', 'Mid', 'Senior', 'Lead', 'Manager', 'Director', 'VP']

const LEVEL_STYLES: Record<string, string> = {
    Intern:   'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
    Junior:   'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    Mid:      'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
    Senior:   'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
    Lead:     'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    Manager:  'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
    Director: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
    VP:       'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
}

const EMPTY_FORM: DesignationFormData = {
    designationName: '',
    description: '',
    departmentId: '',
    level: 'Mid',
    salaryRangeMin: '',
    salaryRangeMax: '',
    designationCode: '',
    status: 'ACTIVE',
}

const ROWS_OPTIONS = [10, 25, 50]

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON ROW
// ─────────────────────────────────────────────────────────────────────────────

const SkeletonRow = () => (
    <tr className="animate-pulse">
        {Array.from({ length: 7 }).map((_, i) => (
            <td key={i} className="px-4 py-4">
                <div className="h-3.5 rounded-full bg-slate-200" style={{ width: `${45 + (i * 17) % 40}%` }} />
            </td>
        ))}
    </tr>
)

// ─────────────────────────────────────────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${
        status === 'ACTIVE'
            ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
            : 'bg-slate-100 text-slate-500 ring-slate-200'
    }`}>
        <span className={`h-1.5 w-1.5 rounded-full ${
            status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'
        }`} />
        {status === 'ACTIVE' ? 'Active' : 'Inactive'}
    </span>
)

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL BADGE
// ─────────────────────────────────────────────────────────────────────────────

const LevelBadge = ({ level }: { level?: string }) => {
    if (!level) return <span className="text-slate-300">—</span>
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${LEVEL_STYLES[level] ?? 'bg-slate-100 text-slate-600'}`}>
            {level}
        </span>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// DEPARTMENT BADGE
// ─────────────────────────────────────────────────────────────────────────────

const DeptBadge = ({ name }: { name: string }) => (
    <span className="inline-flex items-center gap-1 rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700 ring-1 ring-purple-100">
        <Building2 size={10} />
        {name}
    </span>
)

// ─────────────────────────────────────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────────────────────────────────────

const StatCard = ({
                      icon: Icon, label, value, color,
                  }: {
    icon: React.ElementType
    label: string
    value: number | string
    color: string
}) => (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
        <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${color}`}>
            <Icon size={22} className="text-white" />
        </div>
        <div>
            <p className="text-2xl font-extrabold leading-none text-slate-800 tabular-nums">{value}</p>
            <p className="mt-0.5 text-xs font-medium text-slate-500">{label}</p>
        </div>
    </div>
)

// ─────────────────────────────────────────────────────────────────────────────
// DELETE CONFIRM MODAL
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
            <h3 className="text-lg font-bold text-slate-800">Delete Designation?</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
                You are about to permanently delete{' '}
                <span className="font-semibold text-slate-700">{name}</span>.
                This action cannot be undone.
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
// FORM FIELD WRAPPER
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
            {label}
            {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
        {children}
        {error && (
            <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                <AlertTriangle size={10} />
                {error}
            </p>
        )}
    </div>
)

const inputClass = (hasError = false) =>
    `w-full rounded-xl border px-3 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
        hasError
            ? 'border-red-400 bg-red-50'
            : 'border-slate-200 bg-white hover:border-slate-300'
    }`

// ─────────────────────────────────────────────────────────────────────────────
// DESIGNATION CODE AUTO-GENERATOR
// ─────────────────────────────────────────────────────────────────────────────

const generateCode = (name: string, dept: string): string => {
    const namePart = name.replace(/\s+/g, '').slice(0, 3).toUpperCase()
    const deptPart = dept.replace(/\s+/g, '').slice(0, 2).toUpperCase()
    const num = Math.floor(100 + Math.random() * 900)
    return `${deptPart}-${namePart}-${num}`
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

const DesignationsPage = () => {
    const queryClient = useQueryClient()

    // UI state
    const [search, setSearch]             = useState('')
    const [filterDept, setFilterDept]     = useState('')
    const [filterStatus, setFilterStatus] = useState('')
    const [filterLevel, setFilterLevel]   = useState('')
    const [sortDir, setSortDir]           = useState<'asc' | 'desc'>('asc')
    const [showFilters, setShowFilters]   = useState(false)
    const [page, setPage]                 = useState(1)
    const [rowsPerPage, setRowsPerPage]   = useState(10)

    // Modal state
    const [showModal, setShowModal]             = useState(false)
    const [editDesignation, setEditDesignation] = useState<ExtendedDesignation | null>(null)
    const [deleteTarget, setDeleteTarget]       = useState<ExtendedDesignation | null>(null)
    const [form, setForm]                       = useState<DesignationFormData>(EMPTY_FORM)
    const [errors, setErrors]                   = useState<FormErrors>({})

    // ── Queries ───────────────────────────────────────────────────────────────

    const { data: rawDesignations = [], isLoading } = useQuery({
        queryKey: ['designations'],
        queryFn: () => adminService.getDesignations().then(r => r.data),
    })

    // Cast to ExtendedDesignation so we avoid (d as any) throughout
    const designations = rawDesignations as ExtendedDesignation[]

    const { data: departments = [] } = useQuery({
        queryKey: ['designation-departments'],
        queryFn: () => adminService.getDepartments().then(r => r.data),
    })

    const departmentMap = useMemo(
        () => new Map<number, Department>(departments.map(d => [d.id, d])),
        [departments]
    )

    // ── Mutations ─────────────────────────────────────────────────────────────

    const createMutation = useMutation({
        mutationFn: () =>
            adminService.createDesignation({
                designationName: form.designationName,
                designationCode: form.designationCode,
                description: form.description,
                departmentId: Number(form.departmentId),
                level: form.level,
                salaryRangeMin: form.salaryRangeMin ? Number(form.salaryRangeMin) : undefined,
                salaryRangeMax: form.salaryRangeMax ? Number(form.salaryRangeMax) : undefined,
                status: form.status,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['designations'] })
            toast.success('Designation created successfully!')
            closeModal()
        },
        onError: (err: Error) =>
            toast.error(getApiErrorMessage(err, 'Failed to create designation'))
    })

    const updateMutation = useMutation({
        mutationFn: () =>
            adminService.updateDesignation(editDesignation!.id, {
                designationName: form.designationName,
                designationCode: form.designationCode,
                description:     form.description,
                departmentId:    Number(form.departmentId),
                level: form.level,
                salaryRangeMin: form.salaryRangeMin ? Number(form.salaryRangeMin) : undefined,
                salaryRangeMax: form.salaryRangeMax ? Number(form.salaryRangeMax) : undefined,
                status: form.status
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['designations'] })
            toast.success('Designation updated successfully!')
            closeModal()
        },
        onError: (err: Error) =>
            toast.error(getApiErrorMessage(err, 'Failed to update designation')),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => adminService.deleteDesignation(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['designations'] })
            toast.success('Designation deleted.')
            setDeleteTarget(null)
        },
        onError: (err: Error) =>
            toast.error(getApiErrorMessage(err, 'Failed to delete designation')),
    })

    // ── Helpers ───────────────────────────────────────────────────────────────

    const closeModal = () => {
        setShowModal(false)
        setEditDesignation(null)
        setForm(EMPTY_FORM)
        setErrors({})
    }

    const openEdit = (d: ExtendedDesignation) => {
        setEditDesignation(d)
        setForm({
            designationName: d.designationName,
            designationCode: d.designationCode ?? '',
            description:     d.description ?? '',
            departmentId:    String(d.departmentId),
            level:           d.level ?? 'Mid',
            salaryRangeMin: d.salaryRangeMin != null ? String(d.salaryRangeMin) : '',
            salaryRangeMax: d.salaryRangeMax != null ? String(d.salaryRangeMax) : '',
            status: d.status ?? 'ACTIVE',
        })
        setShowModal(true)
    }

    const validate = (): boolean => {
        const e: FormErrors = {}

        if (!form.designationName.trim())
            e.designationName = 'Designation name is required'

        if (!form.departmentId)
            e.departmentId = 'Department is required'

        // Duplicate check within the same department
        const duplicate = designations.find(
            d =>
                d.designationName.toLowerCase() === form.designationName.toLowerCase() &&
                String(d.departmentId) === form.departmentId &&
                d.id !== editDesignation?.id
        )
        if (duplicate)
            e.designationName = 'This designation already exists in the selected department'

        if (form.salaryRangeMin && form.salaryRangeMax) {
            if (Number(form.salaryRangeMin) >= Number(form.salaryRangeMax))
                e.salaryRangeMin = 'Min salary must be less than max salary'
        }

        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return
        if (editDesignation) updateMutation.mutate()
        else createMutation.mutate()
    }

    const handleFieldChange = (field: keyof DesignationFormData, value: string) => {
        setForm(prev => {
            const updated = { ...prev, [field]: value }
            // Auto-generate code when name or dept changes (create mode only)
            if ((field === 'designationName' || field === 'departmentId') && !editDesignation) {
                const deptName =
                    departmentMap.get(Number(updated.departmentId))?.departmentName ?? ''
                if (updated.designationName && deptName) {
                    updated.designationCode = generateCode(updated.designationName, deptName)
                }
            }
            return updated
        })
        setErrors(prev => ({ ...prev, [field]: '' }))
    }

    // ── Filter + Sort + Paginate ──────────────────────────────────────────────

    const filtered = useMemo(() => {
        const q = search.toLowerCase()
        return designations
            .filter(d => {
                const matchSearch =
                    !q ||
                    d.designationName.toLowerCase().includes(q) ||
                    (d.description?.toLowerCase().includes(q) ?? false)
                const matchDept   = !filterDept   || String(d.departmentId) === filterDept
                const matchStatus = !filterStatus || (d.status ?? 'ACTIVE') === filterStatus
                const matchLevel  = !filterLevel  || (d.level ?? '') === filterLevel
                return matchSearch && matchDept && matchStatus && matchLevel
            })
            .sort((a, b) => {
                const va = a.designationName.toLowerCase()
                const vb = b.designationName.toLowerCase()
                return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
            })
    }, [designations, search, filterDept, filterStatus, filterLevel, sortDir])

    const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage))
    const safePage   = Math.min(page, totalPages)
    const paginated  = filtered.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage)

    const clearFilters = () => {
        setSearch(''); setFilterDept(''); setFilterStatus(''); setFilterLevel(''); setPage(1)
    }
    const hasFilters = !!(search || filterDept || filterStatus || filterLevel)

    // ── Stats ─────────────────────────────────────────────────────────────────

    const totalCount     = designations.length
    const activeCount    = designations.filter(d => (d.status ?? 'ACTIVE') === 'ACTIVE').length
    const deptsCovered   = new Set(designations.map(d => d.departmentId)).size
    const totalEmployees = designations.reduce((sum, d) => sum + (d.employeeCount ?? 0), 0)

    // ── Pagination numbers ────────────────────────────────────────────────────

    const pageNums = (): (number | string)[] => {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
        if (safePage <= 4)   return [1, 2, 3, 4, 5, '...', totalPages]
        if (safePage >= totalPages - 3)
            return [1, '...', totalPages-4, totalPages-3, totalPages-2, totalPages-1, totalPages]
        return [1, '...', safePage - 1, safePage, safePage + 1, '...', totalPages]
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-5 pb-8">

            {/* PAGE HEADER */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">Designations</h2>
                    <p className="mt-0.5 text-sm text-slate-500">
                        Organize job titles, levels, and salary bands by department
                    </p>
                </div>
                <button
                    onClick={() => {
                        setForm(EMPTY_FORM)
                        setEditDesignation(null)
                        setErrors({})
                        setShowModal(true)
                    }}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-purple-200 transition-all hover:from-purple-700 hover:to-violet-700"
                >
                    <Plus size={15} /> Add Designation
                </button>
            </div>

            {/* STAT CARDS */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard icon={Layers}    label="Total Designations"  value={totalCount}     color="bg-gradient-to-br from-purple-500 to-violet-600" />
                <StatCard icon={BadgeCheck} label="Active"             value={activeCount}    color="bg-gradient-to-br from-emerald-500 to-teal-500" />
                <StatCard icon={Building2} label="Departments Covered" value={deptsCovered}   color="bg-gradient-to-br from-blue-500 to-indigo-600" />
                <StatCard icon={Users}     label="Employees Assigned"  value={totalEmployees} color="bg-gradient-to-br from-amber-400 to-orange-500" />
            </div>

            {/* SEARCH & FILTERS */}
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative min-w-[200px] flex-1">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search designations..."
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
                    <button
                        onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                    >
                        <ArrowUpDown size={14} />
                        {sortDir === 'asc' ? 'A → Z' : 'Z → A'}
                    </button>
                    {hasFilters && (
                        <button
                            onClick={clearFilters}
                            className="px-2 text-sm font-medium text-purple-600 hover:text-purple-700"
                        >
                            Clear all
                        </button>
                    )}
                    <span className="ml-auto whitespace-nowrap text-sm text-slate-400">
                        <span className="font-bold text-slate-700">{filtered.length}</span> of {totalCount}
                    </span>
                </div>

                {showFilters && (
                    <div className="mt-3 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-3">
                        {/* Department filter */}
                        <div className="relative">
                            <select
                                value={filterDept}
                                onChange={e => { setFilterDept(e.target.value); setPage(1) }}
                                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-8 text-sm text-slate-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="">All Departments</option>
                                {departments.map(d => (
                                    <option key={d.id} value={String(d.id)}>{d.departmentName}</option>
                                ))}
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

                        {/* Level filter */}
                        <div className="relative">
                            <select
                                value={filterLevel}
                                onChange={e => { setFilterLevel(e.target.value); setPage(1) }}
                                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-8 text-sm text-slate-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="">All Levels</option>
                                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                            <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>
                )}
            </div>

            {/* TABLE */}
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[780px]">
                        <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/70">
                            {['Designation', 'Code', 'Department', 'Level', 'Salary Range', 'Status', 'Actions'].map(h => (
                                <th
                                    key={h}
                                    className="whitespace-nowrap px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400"
                                >
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
                                    <tr>
                                        <td colSpan={7}>
                                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50">
                                                    <BadgeCheck size={28} className="text-purple-300" />
                                                </div>
                                                <p className="text-base font-semibold text-slate-600">No designations found</p>
                                                <p className="mt-1 text-sm text-slate-400">
                                                    {hasFilters
                                                        ? 'Try adjusting your filters'
                                                        : 'Click "Add Designation" to get started'}
                                                </p>
                                                {hasFilters && (
                                                    <button
                                                        onClick={clearFilters}
                                                        className="mt-3 text-sm font-medium text-purple-600 hover:text-purple-700"
                                                    >
                                                        Clear filters
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                                : paginated.map(d => {
                                    const deptName = departmentMap.get(d.departmentId)?.departmentName ?? 'Unknown'
                                    const status   = d.status ?? 'ACTIVE'

                                    return (
                                        <tr key={d.id} className="group transition-colors hover:bg-purple-50/20">
                                            <td className="px-4 py-3.5">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-800">
                                                        {d.designationName}
                                                    </p>
                                                    {d.description && (
                                                        <p className="mt-0.5 max-w-[200px] truncate text-xs text-slate-400">
                                                            {d.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                {d.designationCode
                                                    ? <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-500">{d.designationCode}</span>
                                                    : <span className="text-slate-300">—</span>
                                                }
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <DeptBadge name={deptName} />
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <LevelBadge level={d.level} />
                                            </td>
                                            <td className="px-4 py-3.5 text-sm text-slate-600">
                                                {d.salaryRangeMin && d.salaryRangeMax
                                                    ? `₹${Number(d.salaryRangeMin).toLocaleString('en-IN')} – ₹${Number(d.salaryRangeMax).toLocaleString('en-IN')}`
                                                    : <span className="text-slate-300">—</span>
                                                }
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <StatusBadge status={status} />
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-0.5 opacity-60 transition-opacity group-hover:opacity-100">
                                                    <button
                                                        onClick={() => openEdit(d)}
                                                        title="Edit"
                                                        className="rounded-lg p-1.5 text-blue-500 transition-colors hover:bg-blue-100"
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteTarget(d)}
                                                        title="Delete"
                                                        className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-100"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
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
                                <strong className="text-slate-700">
                                    {(safePage - 1) * rowsPerPage + 1}–{Math.min(safePage * rowsPerPage, filtered.length)}
                                </strong>
                                {' '}of{' '}
                                <strong className="text-slate-700">{filtered.length}</strong>
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage(1)}
                                disabled={safePage === 1}
                                className="rounded-lg px-2 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                            >«</button>
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={safePage === 1}
                                className="rounded-lg p-1.5 text-slate-600 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            {pageNums().map((pg, i) =>
                                pg === '...'
                                    ? <span key={`dots-${i}`} className="px-1 text-sm text-slate-400">…</span>
                                    : (
                                        <button
                                            key={pg}
                                            onClick={() => setPage(pg as number)}
                                            className={`h-8 w-8 rounded-lg text-xs font-semibold transition-colors ${
                                                pg === safePage
                                                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-200'
                                                    : 'text-slate-600 hover:bg-slate-200'
                                            }`}
                                        >
                                            {pg}
                                        </button>
                                    )
                            )}
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={safePage === totalPages}
                                className="rounded-lg p-1.5 text-slate-600 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronRight size={14} />
                            </button>
                            <button
                                onClick={() => setPage(totalPages)}
                                disabled={safePage === totalPages}
                                className="rounded-lg px-2 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                            >»</button>
                        </div>
                    </div>
                )}
            </div>

            {/* ADD / EDIT MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="flex max-h-[92vh] w-full max-w-xl flex-col rounded-2xl bg-white shadow-2xl">

                        {/* Modal Header */}
                        <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
                            <div>
                                <h3 className="text-base font-bold text-slate-800">
                                    {editDesignation ? 'Edit Designation' : 'Add New Designation'}
                                </h3>
                                <p className="mt-0.5 text-xs text-slate-400">
                                    {editDesignation
                                        ? 'Update designation details'
                                        : 'Fill in the details to create a new designation'}
                                </p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="rounded-xl p-1.5 transition-colors hover:bg-slate-100"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto px-6 py-5">
                            <form onSubmit={handleSubmit} id="desig-form" className="space-y-5">

                                {/* Basic Information */}
                                <section>
                                    <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
                                        Basic Information
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Field label="Designation Name" required error={errors.designationName}>
                                            <input
                                                value={form.designationName}
                                                onChange={e => handleFieldChange('designationName', e.target.value)}
                                                placeholder="e.g. Senior Engineer"
                                                className={inputClass(!!errors.designationName)}
                                            />
                                        </Field>
                                        <Field label="Department" required error={errors.departmentId}>
                                            <div className="relative">
                                                <select
                                                    value={form.departmentId}
                                                    onChange={e => handleFieldChange('departmentId', e.target.value)}
                                                    className={`${inputClass(!!errors.departmentId)} appearance-none pr-8`}
                                                >
                                                    <option value="">Select Department</option>
                                                    {departments.filter(dep => dep.status === 'Active').map(dep => (
                                                        <option key={dep.id} value={dep.id}>
                                                            {dep.departmentName}
                                                        </option>
                                                    ))}
                                                </select>
                                                <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            </div>
                                        </Field>
                                        <Field label="Designation Code">
                                            <div className="relative">
                                                <Hash size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    value={form.designationCode}
                                                    onChange={e => handleFieldChange('designationCode', e.target.value)}
                                                    placeholder="Auto-generated"
                                                    className={`${inputClass()} pl-8`}
                                                />
                                            </div>
                                        </Field>
                                        <Field label="Level">
                                            <div className="relative">
                                                <select
                                                    value={form.level}
                                                    onChange={e => handleFieldChange('level', e.target.value)}
                                                    className={`${inputClass()} appearance-none pr-8`}
                                                >
                                                    {LEVELS.map(l => <option key={l}>{l}</option>)}
                                                </select>
                                                <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            </div>
                                        </Field>
                                    </div>
                                </section>

                                {/* Salary Band */}
                                <section>
                                    <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
                                        Salary Band (₹)
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Field label="Minimum Salary" error={errors.salaryRangeMin}>
                                            <input
                                                type="number"
                                                value={form.salaryRangeMin}
                                                onChange={e => handleFieldChange('salaryRangeMin', e.target.value)}
                                                placeholder="e.g. 500000"
                                                className={inputClass(!!errors.salaryRangeMin)}
                                            />
                                        </Field>
                                        <Field label="Maximum Salary">
                                            <input
                                                type="number"
                                                value={form.salaryRangeMax}
                                                onChange={e => handleFieldChange('salaryRangeMax', e.target.value)}
                                                placeholder="e.g. 1200000"
                                                className={inputClass()}
                                            />
                                        </Field>
                                    </div>
                                </section>

                                {/* Additional Details */}
                                <section>
                                    <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
                                        Additional Details
                                    </p>
                                    <div className="space-y-3">
                                        <Field label="Status">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleFieldChange(
                                                            'status',
                                                            form.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
                                                        )
                                                    }
                                                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                                                        form.status === 'ACTIVE'
                                                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                                                            : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'
                                                    }`}
                                                >
                                                    {form.status === 'ACTIVE'
                                                        ? <><ToggleRight size={18} /> Active</>
                                                        : <><ToggleLeft size={18} /> Inactive</>
                                                    }
                                                </button>
                                                <span className="text-xs text-slate-400">
                                                    {form.status === 'ACTIVE'
                                                        ? 'Designation is visible and assignable'
                                                        : 'Designation is hidden from employees'}
                                                </span>
                                            </div>
                                        </Field>
                                        <Field label="Description">
                                            <textarea
                                                value={form.description}
                                                onChange={e => handleFieldChange('description', e.target.value)}
                                                rows={3}
                                                placeholder="Brief description of this role..."
                                                className={`${inputClass()} resize-none`}
                                            />
                                        </Field>
                                    </div>
                                </section>
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex flex-shrink-0 gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
                            >
                                Cancel
                            </button>
                            <button
                                form="desig-form"
                                type="submit"
                                disabled={createMutation.isPending || updateMutation.isPending}
                                className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-purple-200 transition-all hover:from-purple-700 hover:to-violet-700 disabled:opacity-60"
                            >
                                {createMutation.isPending || updateMutation.isPending
                                    ? 'Saving...'
                                    : editDesignation ? 'Update Designation' : 'Save Designation'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {deleteTarget && (
                <DeleteModal
                    name={deleteTarget.designationName}
                    loading={deleteMutation.isPending}
                    onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </div>
    )
}

export default DesignationsPage
