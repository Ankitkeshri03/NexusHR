import { useState, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '../../services/adminService'

import {
    Plus, Search, Pencil, Trash2, X, Eye, Download, Upload,
    Users, UserCheck, Clock, UserPlus, ChevronLeft, ChevronRight,
    AlertTriangle, Filter, ArrowUpDown, CheckCircle, XCircle,
    Image as ImageIcon, Phone, Mail, MapPin, Calendar,
    Briefcase, DollarSign, Shield, FileText, ChevronDown
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import type { Employee } from '../../services/employeeService'

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface EmployeeFormData {
    firstName: string
    lastName: string
    employeeCode: string
    email: string
    phoneNumber: string
    gender: string
    dateOfBirth: string
    joiningDate: string
    departmentId: string
    designationId: string
    employmentType: string
    salary: string
    address: string
    emergencyContact: string
    employmentStatus: string
    profileImage?: string
}

interface FormErrors { [key: string]: string }

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────────────────────


const employeeService = {
    getAll: () => api.get<Employee[]>('/employees'),

    create: (data: Partial<Employee>) =>
        api.post<Employee>('/employees', data),

    update: (id: number, data: Partial<Employee>) =>
        api.put<Employee>(`/employees/${id}`, data),

    delete: (id: number) =>
        api.delete(`/employees/${id}`),
}



// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

//const DEPARTMENTS  = ['Engineering', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations', 'Design', 'Legal']

//const DESIGNATIONS = ['Manager', 'Senior Engineer', 'Junior Engineer', 'Analyst', 'Executive', 'Director', 'VP', 'Intern']
const EMP_TYPES    = ['Full Time', 'Part Time', 'Intern', 'Contract']
const STATUSES     = ['Active', 'On Leave', 'Resigned', 'Inactive']
const ROWS_OPTIONS = [10, 25, 50, 100]

const EMPTY_FORM: EmployeeFormData = {
    firstName: '', lastName: '', employeeCode: '', email: '',
    phoneNumber: '', gender: 'Male', dateOfBirth: '', joiningDate: '',
    departmentId: '', designationId: '', employmentType: 'Full Time',
    salary: '', address: '', emergencyContact: '', employmentStatus: 'Active',
}




// ─────────────────────────────────────────────────────────────────────────────
// SMALL COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const SkeletonRow = () => (
    <tr className="animate-pulse">
        {Array.from({ length: 9 }).map((_, i) => (
            <td key={i} className="px-4 py-4">
                <div className="h-3.5 bg-slate-200 rounded-full" style={{ width: `${50 + (i * 13) % 40}%` }} />
            </td>
        ))}
    </tr>
)

const statusStyle: Record<string, string> = {
    Active:     'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    'On Leave': 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    Resigned:   'bg-red-50 text-red-600 ring-1 ring-red-200',
    Inactive:   'bg-slate-100 text-slate-500 ring-1 ring-slate-200',
}
const dotColor: Record<string, string> = {
    Active: 'bg-emerald-500', 'On Leave': 'bg-amber-500',
    Resigned: 'bg-red-400', Inactive: 'bg-slate-400',
}

const StatusBadge = ({ status }: { status: string }) => (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle[status] ?? statusStyle.Inactive}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor[status] ?? dotColor.Inactive}`} />
        {status}
    </span>
)

const Avatar = ({ name, image, size = 'md' }: { name: string; image?: string; size?: 'sm' | 'md' | 'lg' }) => {
    const sz = size === 'lg' ? 'w-16 h-16 text-xl' : size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'
    const initials = (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    if (image) return <img src={image} alt={name} className={`${sz} rounded-full object-cover flex-shrink-0 ring-2 ring-white`} />
    return (
        <div className={`${sz} rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-bold flex-shrink-0 ring-2 ring-white`}>
            {initials}
        </div>
    )
}

const StatCard = ({ icon: Icon, label, value, color }: {
    icon: React.ElementType; label: string; value: number; color: string
}) => (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
            <Icon size={22} className="text-white" />
        </div>
        <div>
            <p className="text-2xl font-extrabold text-slate-800 leading-none tabular-nums">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">{label}</p>
        </div>
    </div>
)

// ─────────────────────────────────────────────────────────────────────────────
// DELETE MODAL
// ─────────────────────────────────────────────────────────────────────────────

const DeleteModal = ({ name, onConfirm, onCancel, loading }: {
    name: string; onConfirm: () => void; onCancel: () => void; loading: boolean
}) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={28} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Delete Employee?</h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                You're about to permanently delete <span className="font-semibold text-slate-700">{name}</span>. This cannot be undone.
            </p>
            <div className="flex gap-3 mt-6">
                <button onClick={onCancel} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm hover:bg-slate-50 transition-colors font-medium">
                    Cancel
                </button>
                <button onClick={onConfirm} disabled={loading}
                        className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm hover:bg-red-600 transition-colors font-medium disabled:opacity-60">
                    {loading ? 'Deleting...' : 'Yes, Delete'}
                </button>
            </div>
        </div>
    </div>
)

// ─────────────────────────────────────────────────────────────────────────────
// DETAILS DRAWER
// ─────────────────────────────────────────────────────────────────────────────

const DetailsDrawer = ({ emp, onClose }: { emp: Employee; onClose: () => void }) => {
    const fullName = emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim()

    const infoItems = [
        { icon: Mail,      label: 'Email',             value: emp.email },
        { icon: Phone,     label: 'Phone',             value: emp.phoneNumber },
        { icon: Briefcase, label: 'Department',        value: emp.department },
        { icon: Shield,    label: 'Employee Code',     value: emp.employeeCode },
        { icon: Calendar,  label: 'Joining Date',      value: emp.joiningDate },
        { icon: MapPin,    label: 'Address',           value: emp.address },
        { icon: DollarSign,label: 'Salary',            value: emp.salary ? `₹${Number(emp.salary).toLocaleString('en-IN')}` : undefined },
        { icon: Phone,     label: 'Emergency Contact', value: emp.emergencyContact },
    ].filter(i => i.value)

    const summaryCards = [
        { label: 'Attendance',    value: '94%',      sub: 'This month' },
        { label: 'Leave Balance', value: '12',        sub: 'Days remaining' },
        { label: 'Last Payroll',  value: '₹45,000',  sub: 'Apr 2025' },
        { label: 'Reporting To',  value: 'Manager',  sub: 'Direct report' },
    ]

    const activity = [
        { text: 'Applied for casual leave',        time: '1 day ago' },
        { text: 'Completed performance review',    time: '3 days ago' },
        { text: 'Onboarded to Engineering team',   time: '2 weeks ago' },
        { text: 'Completed onboarding checklist',  time: '1 month ago' },
    ]

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-end z-50">
            <div className="bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl flex flex-col">
                <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-slate-100 px-5 py-4 flex items-center justify-between z-10">
                    <h3 className="text-sm font-bold text-slate-800">Employee Profile</h3>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Hero */}
                <div className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <Avatar name={fullName} image={emp.profileImage} size="lg" />
                        <div>
                            <h4 className="text-xl font-bold text-slate-800">{fullName}</h4>
                            <p className="text-sm text-purple-600 font-medium">{emp.designation || 'N/A'}</p>
                            <div className="mt-1.5"><StatusBadge status={emp.employmentStatus || 'Inactive'} /></div>
                        </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {[emp.department, emp.employmentType, emp.gender].filter(Boolean).map(tag => (
                            <span key={tag} className="text-xs bg-white text-slate-600 px-2.5 py-1 rounded-full border border-slate-200 font-medium">{tag}</span>
                        ))}
                    </div>
                </div>

                {/* Info */}
                <div className="p-5 space-y-3 border-b border-slate-100">
                    {infoItems.map(({ icon: Icon, label, value }) => (
                        <div key={label} className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Icon size={13} className="text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">{label}</p>
                                <p className="text-sm text-slate-800 font-medium">{value as string}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="p-5 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Summary</p>
                    <div className="grid grid-cols-2 gap-3">
                        {summaryCards.map(c => (
                            <div key={c.label} className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                                <p className="text-xs text-slate-400">{c.label}</p>
                                <p className="text-base font-bold text-slate-800 mt-0.5">{c.value}</p>
                                <p className="text-xs text-slate-400">{c.sub}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Timeline */}
                <div className="p-5">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Recent Activity</p>
                    <div className="relative pl-4 space-y-5">
                        <div className="absolute left-0 top-1.5 bottom-1.5 w-px bg-slate-200" />
                        {activity.map((act, i) => (
                            <div key={i} className="relative flex items-start gap-3">
                                <div className="absolute -left-4 top-1.5 w-2 h-2 rounded-full bg-purple-400 ring-2 ring-white" />
                                <div>
                                    <p className="text-sm text-slate-700">{act.text}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{act.time}</p>
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
                   label, name, type = 'text', placeholder, required, options, colSpan, form, errors, setForm, setErrors
               }: {
    label: string; name: keyof EmployeeFormData; type?: string; placeholder?: string;
    required?: boolean; options?: string[]; colSpan?: boolean;
    form: EmployeeFormData; errors: FormErrors;
    setForm: React.Dispatch<React.SetStateAction<EmployeeFormData>>;
    setErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
}) => {
    const onChange = (val: string) => {
        setForm(f => ({ ...f, [name]: val }))
        setErrors(e => ({ ...e, [name]: '' }))
    }
    const base = `w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${errors[name] ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white hover:border-slate-300'}`

    return (
        <div className={colSpan ? 'col-span-2' : ''}>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                {label}{required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {options ? (
                <div className="relative">
                    <select value={form[name] as string} onChange={e => onChange(e.target.value)} className={`${base} appearance-none pr-8`}>
                        <option value="">Select {label}</option>
                        {options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
            ) : (
                <input type={type} value={form[name] as string} placeholder={placeholder}
                       onChange={e => onChange(e.target.value)} className={base} />
            )}
            {errors[name] && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertTriangle size={10} />{errors[name]}
                </p>
            )}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

const EmployeesPage = () => {

    const queryClient = useQueryClient()

    const [search, setSearch]             = useState('')
    const [filterDept, setFilterDept]     = useState('')
    const [filterStatus, setFilterStatus] = useState('')
    const [filterDesig, setFilterDesig]   = useState('')
    const [sortOrder, setSortOrder]       = useState<'newest' | 'oldest'>('newest')
    const [showFilters, setShowFilters]   = useState(false)
    const [page, setPage]                 = useState(1)
    const [rowsPerPage, setRowsPerPage]   = useState(10)

    const [showModal, setShowModal]         = useState(false)
    const [editEmployee, setEditEmployee]   = useState<Employee | null>(null)
    const [viewEmployee, setViewEmployee]   = useState<Employee | null>(null)
    const [deleteTarget, setDeleteTarget]   = useState<Employee | null>(null)
    const [form, setForm]                   = useState<EmployeeFormData>(EMPTY_FORM)
    const [errors, setErrors]               = useState<FormErrors>({})
    const [imagePreview, setImagePreview]   = useState('')
    const fileRef   = useRef<HTMLInputElement>(null)
    const importRef = useRef<HTMLInputElement>(null)

    // ── Queries ───────────────────────────────────────────────────────────────
    const { data: departments = [] } = useQuery({
        queryKey: ['departments'],
        queryFn: () =>
            adminService.getDepartments().then(r => r.data)
    })

    const { data: designations = [] } = useQuery({
        queryKey: ['designations'],
        queryFn: () =>
            adminService.getDesignations().then(r => r.data),
    })

    const { data, isLoading } = useQuery({
        queryKey: ['employees'],
        queryFn: () => employeeService.getAll().then(r => r.data),
    })

    const departmentOptions = departments
        .filter(dep => dep.status === 'Active')
        .map(dep => dep.departmentName)

    const designationOptions = designations.map(des => des.designationName)

    const createMutation = useMutation({
        mutationFn: employeeService.create,
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['employees'] }); toast.success('Employee added!'); closeModal() },
        onError: () => toast.error('Failed to add employee.'),
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Employee> }) => employeeService.update(id, data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['employees'] }); toast.success('Employee updated!'); closeModal() },
        onError: () => toast.error('Failed to update employee.'),
    })

    const deleteMutation = useMutation({
        mutationFn: employeeService.delete,
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['employees'] }); toast.success('Employee deleted.'); setDeleteTarget(null) },
        onError: () => toast.error('Failed to delete employee.'),
    })

    const toggleStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) => employeeService.update(id, { employmentStatus: status }),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['employees'] }); toast.success('Status updated!') },
        onError: () => toast.error('Failed to update status.'),
    })

    // ── Helpers ───────────────────────────────────────────────────────────────
    const getDepartmentName = (departmentId: number) =>
        departments.find(dep => dep.id === departmentId)?.departmentName || '-'

    const getDesignationName = (designationId: number) =>
        designations.find(des => des.id === designationId)?.designationName || '-'

    const closeModal = useCallback(() => {
        setShowModal(false); setEditEmployee(null); setForm(EMPTY_FORM); setErrors({}); setImagePreview('')
    }, [])

    const openEdit = useCallback((emp: Employee) => {
        setEditEmployee(emp)
        setForm({
            firstName:        emp.firstName || '',
            lastName:         emp.lastName || '',
            employeeCode:     emp.employeeCode || '',
            email:            emp.email || '',
            phoneNumber:      emp.phoneNumber || '',
            gender:           emp.gender || 'Male',
            dateOfBirth:      emp.dateOfBirth || '',
            joiningDate:      emp.joiningDate || '',
            departmentId: String(emp.departmentId || ''),
            designationId: String(emp.designationId || ''),
            employmentType:   emp.employmentType || 'Full Time',
            salary:           emp.salary?.toString() || '',
            address:          emp.address || '',
            emergencyContact: emp.emergencyContact || '',
            employmentStatus: emp.employmentStatus || 'Active',
            profileImage:     emp.profileImage || '',
        })
        if (emp.profileImage) setImagePreview(emp.profileImage)
        setShowModal(true)
    }, [])

    const validate = useCallback((): boolean => {
        const e: FormErrors = {}
        if (!form.firstName.trim())    e.firstName    = 'First name is required'
        if (!form.lastName.trim())     e.lastName     = 'Last name is required'
        if (!form.employeeCode.trim()) e.employeeCode = 'Employee code is required'
        else if (data && !editEmployee && data.some(emp => emp.employeeCode === form.employeeCode))
            e.employeeCode = 'This employee code already exists'
        if (!form.email.trim())   e.email = 'Email is required'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address'
        if (form.phoneNumber && !/^\d{10}$/.test(form.phoneNumber.replace(/\s/g, '')))
            e.phoneNumber = 'Enter a valid 10-digit phone number'
        setErrors(e)
        return Object.keys(e).length === 0
    }, [form, data, editEmployee])

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return
        const payload: Partial<Employee> = {
            name: `${form.firstName} ${form.lastName}`.trim(),

            firstName: form.firstName,
            lastName: form.lastName,

            employeeCode: form.employeeCode,

            email: form.email,
            phoneNumber: form.phoneNumber,

            gender: form.gender,

            dateOfBirth: form.dateOfBirth,
            joiningDate: form.joiningDate,
            departmentId: Number(form.departmentId),
            designationId: Number(form.designationId),
            employmentType: form.employmentType,
            employmentStatus: form.employmentStatus,

            salary: form.salary
                ? Number(form.salary)
                : undefined,

            address: form.address,

            emergencyContact: form.emergencyContact,

            profileImage: form.profileImage
        }
        if (editEmployee && editEmployee.id) {
            updateMutation.mutate({
                id: editEmployee.id,
                data: payload
            })
        } else {
            createMutation.mutate(payload)
        }
    }, [form, editEmployee, validate, createMutation, updateMutation])

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return }
        const reader = new FileReader()
        reader.onloadend = () => {
            const result = reader.result as string
            setImagePreview(result)
            setForm(f => ({ ...f, profileImage: result }))
        }
        reader.readAsDataURL(file)
    }

    const handleExportCSV = () => {
        const source = filtered.length ? filtered : (data ?? [])
        if (!source.length) { toast.error('No data to export'); return }
        const headers = ['ID', 'Name', 'Code', 'Email', 'Phone', 'Department', 'Designation', 'Type', 'Status', 'Salary', 'Joined']
        const rows = source.map(e => [
            e.id, e.name || `${e.firstName} ${e.lastName}`,
            e.employeeCode, e.email, e.phoneNumber,
            e.department, e.designation, e.employmentType,
            e.employmentStatus, e.salary, e.joiningDate,
        ].map(v => `"${v ?? ''}"`).join(','))
        const csv  = [headers.join(','), ...rows].join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url  = URL.createObjectURL(blob)
        Object.assign(document.createElement('a'), {
            href: url, download: `employees_${new Date().toISOString().slice(0,10)}.csv`
        }).click()
        URL.revokeObjectURL(url)
        toast.success('CSV exported!')
    }

    const handleExportPDF = () => {
        const source = filtered.length ? filtered : (data ?? [])
        if (!source.length) { toast.error('No data to export'); return }
        const rows = source.map(e =>
            `<tr>
                <td>${e.name || `${e.firstName} ${e.lastName}`}</td>
                <td>${e.employeeCode ?? ''}</td>
                <td>${e.email ?? ''}</td>
                <td>${e.department ?? ''}</td>
                <td>${e.employmentStatus ?? ''}</td>
                <td>${e.joiningDate ?? ''}</td>
             </tr>`
        ).join('')
        const html = `<html><head><style>
            body{font-family:Arial,sans-serif;font-size:12px;padding:24px;color:#1e293b}
            h1{color:#7c3aed;margin:0 0 4px} p{color:#64748b;margin:0 0 16px;font-size:11px}
            table{width:100%;border-collapse:collapse}
            th{background:#f5f3ff;color:#6d28d9;text-align:left;padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:.05em}
            td{padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:12px}
            tr:nth-child(even) td{background:#fafafa}
        </style></head><body>
        <h1>NexusHR — Employee Report</h1>
        <p>Generated on ${new Date().toLocaleDateString('en-IN')} · ${source.length} employees</p>
        <table><thead><tr><th>Name</th><th>Code</th><th>Email</th><th>Department</th><th>Status</th><th>Joined</th></tr></thead>
        <tbody>${rows}</tbody></table></body></html>`
        const w = window.open('', '_blank')
        if (w) { w.document.write(html); w.document.close(); w.print() }
        toast.success('PDF print dialog opened!')
    }

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        toast('Connect your backend to parse and import this file.', { icon: 'ℹ️' })
        e.target.value = ''
    }

    // ── Filter & Paginate ─────────────────────────────────────────────────────

    const allEmployees = data ?? []

    const filtered = allEmployees.filter(emp => {
        const q = search.toLowerCase()
        const matchSearch = !q || [emp.name, emp.email, emp.employeeCode, emp.firstName, emp.lastName].some(v => v?.toLowerCase().includes(q))
        const matchDept   = !filterDept   || emp.department === filterDept
        const matchStatus = !filterStatus || emp.employmentStatus === filterStatus
        const matchDesig  = !filterDesig  || emp.designation === filterDesig
        return matchSearch && matchDept && matchStatus && matchDesig
    }).sort((a, b) => {
        const da = new Date(a.joiningDate || 0).getTime()
        const db = new Date(b.joiningDate || 0).getTime()
        return sortOrder === 'newest' ? db - da : da - db
    })

    const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage))
    const safePage   = Math.min(page, totalPages)
    const paginated  = filtered.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage)

    const clearFilters = () => { setFilterDept(''); setFilterStatus(''); setFilterDesig(''); setSearch(''); setPage(1) }
    const hasFilters   = !!(filterDept || filterStatus || filterDesig || search)

    const total     = allEmployees.length
    const active    = allEmployees.filter(e => e.employmentStatus === 'Active').length
    const onLeave   = allEmployees.filter(e => e.employmentStatus === 'On Leave').length
    const thisMonth = allEmployees.filter(e => {
        const d = new Date(e.joiningDate || ''), n = new Date()
        return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear()
    }).length

    const getPageNums = (): (number | string)[] => {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
        if (safePage <= 4)   return [1, 2, 3, 4, 5, '...', totalPages]
        if (safePage >= totalPages - 3) return [1, '...', totalPages-4, totalPages-3, totalPages-2, totalPages-1, totalPages]
        return [1, '...', safePage - 1, safePage, safePage + 1, '...', totalPages]
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-5 pb-8">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Employees</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Manage your workforce across all departments</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={handleExportCSV} className="flex items-center gap-1.5 border border-slate-200 text-slate-600 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium">
                        <Download size={14} /> CSV
                    </button>
                    <button onClick={handleExportPDF} className="flex items-center gap-1.5 border border-slate-200 text-slate-600 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium">
                        <FileText size={14} /> PDF
                    </button>
                    <label className="flex items-center gap-1.5 border border-slate-200 text-slate-600 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium cursor-pointer">
                        <Upload size={14} /> Import
                        <input ref={importRef} type="file" accept=".xlsx,.csv,.xls" className="hidden" onChange={handleImport} />
                    </label>
                    <button
                        onClick={() => { setForm(EMPTY_FORM); setEditEmployee(null); setErrors({}); setImagePreview(''); setShowModal(true) }}
                        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white px-4 py-2 rounded-xl hover:from-purple-700 hover:to-violet-700 transition-all text-sm font-semibold shadow-sm shadow-purple-200 whitespace-nowrap"
                    >
                        <Plus size={15} /> Add Employee
                    </button>
                </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Users}     label="Total Employees" value={total}     color="bg-gradient-to-br from-purple-500 to-violet-600" />
                <StatCard icon={UserCheck} label="Active"          value={active}    color="bg-gradient-to-br from-emerald-500 to-teal-500" />
                <StatCard icon={Clock}     label="On Leave"        value={onLeave}   color="bg-gradient-to-br from-amber-400 to-orange-500" />
                <StatCard icon={UserPlus}  label="New This Month"  value={thisMonth} color="bg-gradient-to-br from-blue-500 to-indigo-600" />
            </div>

            {/* SEARCH & FILTERS */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email or code..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1) }}
                            className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(f => !f)}
                        className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${showFilters ? 'bg-purple-50 border-purple-200 text-purple-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                        <Filter size={14} /> Filters
                        {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />}
                    </button>
                    <button
                        onClick={() => setSortOrder(s => s === 'newest' ? 'oldest' : 'newest')}
                        className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors"
                    >
                        <ArrowUpDown size={14} />
                        {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
                    </button>
                    {hasFilters && (
                        <button onClick={clearFilters} className="text-sm text-purple-600 hover:text-purple-700 font-medium px-2">
                            Clear all
                        </button>
                    )}
                    <span className="text-sm text-slate-400 ml-auto whitespace-nowrap">
                        <span className="font-bold text-slate-700">{filtered.length}</span> of {total} employees
                    </span>
                </div>

                {showFilters && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                        {[
                            { label: 'Department', value: filterDept,   setter: (v: string) => { setFilterDept(v);   setPage(1) }, options: departmentOptions },
                            { label: 'Status',     value: filterStatus, setter: (v: string) => { setFilterStatus(v); setPage(1) }, options: STATUSES     },
                            { label: 'Designation',value: filterDesig,  setter: (v: string) => { setFilterDesig(v);  setPage(1) }, options: designationOptions },
                        ].map(({ label, value, setter, options }) => (
                            <div key={label} className="relative">
                                <select value={value} onChange={e => setter(e.target.value)}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white appearance-none pr-8">
                                    <option value="">All {label}s</option>
                                    {options.map(o => <option key={o}>{o}</option>)}
                                </select>
                                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                        <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/70">
                            {['Employee', 'Code', 'Email', 'Phone', 'Department', 'Designation', 'Status', 'Joined', 'Actions'].map(h => (
                                <th key={h} className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider px-4 py-3.5 whitespace-nowrap">
                                    {h}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                        {isLoading
                            ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                            : paginated.length === 0
                                ? (
                                    <tr><td colSpan={9}>
                                        <div className="flex flex-col items-center justify-center py-24 text-center">
                                            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-4">
                                                <Users size={28} className="text-purple-300" />
                                            </div>
                                            <p className="text-base font-semibold text-slate-600">No employees found</p>
                                            <p className="text-sm text-slate-400 mt-1">
                                                {hasFilters ? 'Try adjusting your filters or search query' : 'Click "Add Employee" to get started'}
                                            </p>
                                            {hasFilters && (
                                                <button onClick={clearFilters} className="mt-3 text-sm text-purple-600 font-medium hover:text-purple-700">
                                                    Clear filters
                                                </button>
                                            )}
                                        </div>
                                    </td></tr>
                                )
                                : paginated.map(emp => {
                                    const fullName = emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim()
                                    const isActive = emp.employmentStatus === 'Active'
                                    return (
                                        <tr key={emp.id} className="hover:bg-purple-50/20 transition-colors group">
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <Avatar name={fullName} image={emp.profileImage} size="sm" />
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-800 whitespace-nowrap">{fullName}</p>
                                                        <p className="text-xs text-slate-400">{emp.gender}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{emp.employeeCode}</span>
                                            </td>
                                            <td className="px-4 py-3.5 text-sm text-slate-600 max-w-[160px] truncate">{emp.email}</td>
                                            <td className="px-4 py-3.5 text-sm text-slate-500 whitespace-nowrap">{emp.phoneNumber || '—'}</td>
                                            <td className="px-4 py-3.5 text-sm text-slate-600 whitespace-nowrap">{emp.departmentId ? getDepartmentName(emp.departmentId) : '—'}</td>
                                            <td className="px-4 py-3.5 text-sm text-slate-500 whitespace-nowrap">{emp.designationId ? getDesignationName(emp.designationId) : '—'}</td>
                                            <td className="px-4 py-3.5"><StatusBadge status={emp.employmentStatus || 'Inactive'} /></td>
                                            <td className="px-4 py-3.5 text-sm text-slate-500 whitespace-nowrap">
                                                {emp.joiningDate
                                                    ? new Date(emp.joiningDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                                    : '—'}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => setViewEmployee(emp)} title="View Profile"
                                                            className="p-1.5 hover:bg-purple-100 rounded-lg text-purple-600 transition-colors">
                                                        <Eye size={14} />
                                                    </button>
                                                    <button onClick={() => openEdit(emp)} title="Edit"
                                                            className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-500 transition-colors">
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (emp.id) {
                                                                toggleStatusMutation.mutate({
                                                                    id: emp.id,
                                                                    status: isActive ? 'Inactive' : 'Active'
                                                                })
                                                            }
                                                        }}
                                                        className="p-1.5 hover:bg-amber-100 rounded-lg text-amber-500 transition-colors">
                                                        {isActive ? <XCircle size={14} /> : <CheckCircle size={14} />}
                                                    </button>
                                                    <button onClick={() => setDeleteTarget(emp)} title="Delete"
                                                            className="p-1.5 hover:bg-red-100 rounded-lg text-red-500 transition-colors">
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
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 bg-slate-50/40">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span>Show</span>
                            <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(1) }}
                                    className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium">
                                {ROWS_OPTIONS.map(r => <option key={r}>{r}</option>)}
                            </select>
                            <span>
                                · Showing <strong className="text-slate-700">{(safePage - 1) * rowsPerPage + 1}–{Math.min(safePage * rowsPerPage, filtered.length)}</strong> of <strong className="text-slate-700">{filtered.length}</strong>
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setPage(1)} disabled={safePage === 1}
                                    className="px-2 py-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-xs text-slate-600 font-medium transition-colors">«</button>
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
                                    className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                                <ChevronLeft size={14} className="text-slate-600" />
                            </button>
                            {getPageNums().map((pg, idx) =>
                                pg === '...'
                                    ? <span key={`dots-${idx}`} className="px-1 text-slate-400 text-sm">…</span>
                                    : (
                                        <button key={pg} onClick={() => setPage(pg as number)}
                                                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${pg === safePage ? 'bg-purple-600 text-white shadow-sm shadow-purple-200' : 'text-slate-600 hover:bg-slate-200'}`}>
                                            {pg}
                                        </button>
                                    )
                            )}
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                                    className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                                <ChevronRight size={14} className="text-slate-600" />
                            </button>
                            <button onClick={() => setPage(totalPages)} disabled={safePage === totalPages}
                                    className="px-2 py-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-xs text-slate-600 font-medium transition-colors">»</button>
                        </div>
                    </div>
                )}
            </div>

            {/* ADD / EDIT MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[92vh] flex flex-col">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
                            <div>
                                <h3 className="text-base font-bold text-slate-800">
                                    {editEmployee ? 'Edit Employee' : 'Add New Employee'}
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {editEmployee ? 'Update the employee details below' : 'Fill in the details to create a new employee'}
                                </p>
                            </div>
                            <button onClick={closeModal} className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1 px-6 py-5">
                            <form onSubmit={handleSubmit} id="emp-form" className="space-y-6">

                                {/* Photo upload */}
                                <div className="flex items-center gap-4 p-4 bg-purple-50/50 rounded-2xl border border-purple-100">
                                    <div
                                        className="w-16 h-16 rounded-2xl bg-white border-2 border-dashed border-purple-200 flex items-center justify-center overflow-hidden cursor-pointer hover:border-purple-400 transition-colors flex-shrink-0"
                                        onClick={() => fileRef.current?.click()}>
                                        {imagePreview
                                            ? <img src={imagePreview} className="w-full h-full object-cover" alt="preview" />
                                            : <ImageIcon size={22} className="text-purple-300" />}
                                    </div>
                                    <div>
                                        <button type="button" onClick={() => fileRef.current?.click()}
                                                className="text-sm text-purple-600 font-semibold hover:text-purple-700 transition-colors">
                                            {imagePreview ? 'Change photo' : 'Upload photo'}
                                        </button>
                                        <p className="text-xs text-slate-400 mt-0.5">JPG or PNG, max 2MB</p>
                                        {imagePreview && (
                                            <button type="button" onClick={() => { setImagePreview(''); setForm(f => ({ ...f, profileImage: '' })) }}
                                                    className="text-xs text-red-400 hover:text-red-500 block mt-0.5">Remove</button>
                                        )}
                                        <input ref={fileRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleImageUpload} />
                                    </div>
                                </div>

                                {/* Personal */}
                                <section>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Personal Information</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Field label="First Name"   name="firstName"   placeholder="Ankit"            required form={form} errors={errors} setForm={setForm} setErrors={setErrors} />
                                        <Field label="Last Name"    name="lastName"    placeholder="Yadav"            required form={form} errors={errors} setForm={setForm} setErrors={setErrors} />
                                        <Field label="Email"        name="email"       type="email" placeholder="ankit@nexushr.com" required form={form} errors={errors} setForm={setForm} setErrors={setErrors} />
                                        <Field label="Phone Number" name="phoneNumber" placeholder="9876543210"       form={form} errors={errors} setForm={setForm} setErrors={setErrors} />
                                        <Field label="Gender"       name="gender"      options={['Male','Female','Other']} form={form} errors={errors} setForm={setForm} setErrors={setErrors} />
                                        <Field label="Date of Birth" name="dateOfBirth" type="date"                  form={form} errors={errors} setForm={setForm} setErrors={setErrors} />
                                    </div>
                                </section>

                                {/* Employment */}
                                <section>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Employment Details</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Field label="Employee Code"    name="employeeCode"   placeholder="EMP001" required form={form} errors={errors} setForm={setForm} setErrors={setErrors} />
                                        <Field label="Joining Date"     name="joiningDate"    type="date"          form={form} errors={errors} setForm={setForm} setErrors={setErrors} />
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                                Department
                                            </label>

                                            <select
                                                value={form.departmentId}
                                                onChange={(e) =>
                                                    setForm(prev => ({
                                                        ...prev,
                                                        departmentId: e.target.value,
                                                        designationId: ''
                                                    }))
                                                }
                                                className="w-full border border-slate-200 rounded-xl px-3 py-2.5"
                                            >
                                                <option value="">Select Department</option>

                                                {departments
                                                    .filter(dep => dep.status === 'Active')
                                                    .map(dep => (
                                                        <option key={dep.id} value={dep.id}>
                                                            {dep.departmentName}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                                Designation
                                            </label>

                                            <select
                                                value={form.designationId}
                                                onChange={(e) =>
                                                    setForm(prev => ({
                                                        ...prev,
                                                        designationId: e.target.value
                                                    }))
                                                }
                                                className="w-full border border-slate-200 rounded-xl px-3 py-2.5"
                                            >
                                                <option value="">Select Designation</option>

                                                {designations
                                                    .filter(
                                                        des =>
                                                            des.departmentId === Number(form.departmentId)
                                                    )
                                                    .map(des => (
                                                        <option key={des.id} value={des.id}>
                                                            {des.designationName}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>
                                        <Field label="Employment Type"  name="employmentType" options={EMP_TYPES}  form={form} errors={errors} setForm={setForm} setErrors={setErrors} />
                                        <Field label="Status"           name="employmentStatus" options={STATUSES} form={form} errors={errors} setForm={setForm} setErrors={setErrors} />
                                        <Field label="Salary (₹)"      name="salary"         type="number" placeholder="50000" colSpan form={form} errors={errors} setForm={setForm} setErrors={setErrors} />
                                    </div>
                                </section>

                                {/* Additional */}
                                <section>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Additional Information</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Field label="Address"                name="address"          placeholder="123 Street, City, State" colSpan form={form} errors={errors} setForm={setForm} setErrors={setErrors} />
                                        <Field label="Emergency Contact Number" name="emergencyContact" placeholder="9876543210"             colSpan form={form} errors={errors} setForm={setForm} setErrors={setErrors} />
                                    </div>
                                </section>
                            </form>
                        </div>

                        <div className="flex gap-3 px-6 py-4 border-t border-slate-100 flex-shrink-0 bg-slate-50/50">
                            <button type="button" onClick={closeModal}
                                    className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-100 transition-colors">
                                Cancel
                            </button>
                            <button form="emp-form" type="submit"
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                    className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:from-purple-700 hover:to-violet-700 transition-all disabled:opacity-60 shadow-sm shadow-purple-200">
                                {(createMutation.isPending || updateMutation.isPending)
                                    ? 'Saving…'
                                    : editEmployee ? 'Update Employee' : 'Save Employee'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE MODAL */}
            {deleteTarget && (
                <DeleteModal
                    name={deleteTarget.name || `${deleteTarget.firstName} ${deleteTarget.lastName}`}
                    loading={deleteMutation.isPending}
                    onConfirm={() => {
                        if (deleteTarget.id) {
                            deleteMutation.mutate(deleteTarget.id)
                        }
                    }}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}

            {/* DETAILS DRAWER */}
            {viewEmployee && <DetailsDrawer emp={viewEmployee} onClose={() => setViewEmployee(null)} />}
        </div>
    )
}

export default EmployeesPage
