

import { useMemo, useState } from 'react'
import {
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query'

import {
    Plus,
    Pencil,
    Trash2,
    X,
    Building2,
    Search,
    Users,
    Briefcase,
    TrendingUp,
    Activity,
} from 'lucide-react'

import toast from 'react-hot-toast'
import api from '../../services/api'

interface Department {
    id: number
    departmentCode?: string
    departmentName: string
    description: string
    createdAt: string
    departmentHead?: string
    totalEmployees?: number
    activeEmployees?: number
    status?: 'Active' | 'Inactive'
    budget?: number
}

const DepartmentsPage = () => {
    const queryClient = useQueryClient()

    const [showModal, setShowModal] = useState(false)
    const [editDept, setEditDept] = useState<Department | null>(null)

    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('All')

    const [form, setForm] = useState({
        departmentName: '',
        description: '',
        departmentHead: '',
        budget: '',
        status: 'Active' as 'Active' | 'Inactive',
    })

    const { data = [], isLoading } = useQuery({
        queryKey: ['departments'],
        queryFn: () =>
            api.get<Department[]>('/departments').then((r) => r.data),
    })

    const createMutation = useMutation({
        mutationFn: (data: Partial<Department>) =>
            api.post('/departments', data),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments'] })

            toast.success('Department created successfully')

            closeModal()
        },

        onError: () => {
            toast.error('Failed to create department')
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: number
            data: Partial<Department>
        }) => api.put(`/departments/${id}`, data),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments'] })

            toast.success('Department updated successfully')

            closeModal()
        },

        onError: () => {
            toast.error('Failed to update department')
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.delete(`/departments/${id}`),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments'] })

            toast.success('Department deleted successfully')
        },

        onError: () => {
            toast.error('Failed to delete department')
        },
    })

    const filteredDepartments = useMemo(() => {
        return data.filter((dept) => {
            const matchesSearch = dept.departmentName
                .toLowerCase()
                .includes(search.toLowerCase())

            const matchesStatus =
                statusFilter === 'All' ||
                (dept.status || 'Active') === statusFilter

            return matchesSearch && matchesStatus
        })
    }, [data, search, statusFilter])

    const stats = {
        totalDepartments: data.length,

        activeDepartments: data.filter(
            (d) => (d.status || 'Active') === 'Active'
        ).length,

        totalEmployees: data.reduce(
            (sum, d) => sum + (d.totalEmployees || 0),
            0
        ),

        avgEmployees:
            data.length > 0
                ? Math.round(
                      data.reduce(
                          (sum, d) => sum + (d.totalEmployees || 0),
                          0
                      ) / data.length
                  )
                : 0,
    }

    const openCreateModal = () => {
        setEditDept(null)

        setForm({
            departmentName: '',
            description: '',
            departmentHead: '',
            budget: '',
            status: 'Active',
        })

        setShowModal(true)
    }

    const openEditModal = (dept: Department) => {
        setEditDept(dept)

        setForm({
            departmentName: dept.departmentName,
            description: dept.description || '',
            departmentHead: dept.departmentHead || '',
            budget: String(dept.budget || ''),
            status: dept.status || 'Active',
        })

        setShowModal(true)
    }

    const closeModal = () => {
        setShowModal(false)

        setEditDept(null)

        setForm({
            departmentName: '',
            description: '',
            departmentHead: '',
            budget: '',
            status: 'Active',
        })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!form.departmentName.trim()) {
            toast.error('Department name is required')
            return
        }

        const payload = {
            departmentName: form.departmentName,
            description: form.description,
            departmentHead: form.departmentHead,
            budget: Number(form.budget || 0),
            status: form.status as 'Active' | 'Inactive',
        }

        if (editDept) {
            updateMutation.mutate({
                id: editDept.id,
                data: payload,
            })
        } else {
            createMutation.mutate(payload)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">
                        Departments
                    </h1>

                    <p className="text-slate-500 mt-1">
                        Manage company departments and teams
                    </p>
                </div>

                <button
                    onClick={openCreateModal}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white px-5 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                >
                    <Plus size={18} />
                    Add Department
                </button>
            </div>

            {/* Analytics */}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-purple-600 to-violet-700 text-white rounded-2xl p-5 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-100">
                                Total Departments
                            </p>

                            <h3 className="text-3xl font-bold mt-2">
                                {stats.totalDepartments}
                            </h3>
                        </div>

                        <Building2 className="opacity-80" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">
                                Active Departments
                            </p>

                            <h3 className="text-3xl font-bold text-slate-800 mt-2">
                                {stats.activeDepartments}
                            </h3>
                        </div>

                        <Activity className="text-green-500" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">
                                Total Employees
                            </p>

                            <h3 className="text-3xl font-bold text-slate-800 mt-2">
                                {stats.totalEmployees}
                            </h3>
                        </div>

                        <Users className="text-blue-500" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">
                                Avg Employees
                            </p>

                            <h3 className="text-3xl font-bold text-slate-800 mt-2">
                                {stats.avgEmployees}
                            </h3>
                        </div>

                        <TrendingUp className="text-orange-500" />
                    </div>
                </div>
            </div>

            {/* Filters */}

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                <div className="relative w-full lg:max-w-sm">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                        type="text"
                        placeholder="Search department..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
            </div>

            {/* Loading */}

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="bg-white rounded-2xl h-64 animate-pulse border border-slate-200"
                        />
                    ))}
                </div>
            ) : filteredDepartments.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 py-20 text-center shadow-sm">
                    <Building2
                        size={48}
                        className="mx-auto text-slate-300 mb-4"
                    />

                    <h3 className="text-lg font-semibold text-slate-700">
                        No departments found
                    </h3>

                    <p className="text-slate-400 mt-1">
                        Create your first department to get started.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredDepartments.map((dept) => (
                        <div
                            key={dept.id}
                            className="group relative overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-5"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-violet-600" />

                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center shadow-inner">
                                        <Building2 className="text-purple-600" />
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-lg text-slate-800">
                                            {dept.departmentName}
                                        </h3>

                                        <p className="text-sm text-slate-400">
                                            {dept.departmentCode || 'DEP-101'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => openEditModal(dept)}
                                        className="p-2 rounded-lg hover:bg-purple-100 text-purple-600 transition-colors"
                                    >
                                        <Pencil size={16} />
                                    </button>

                                    <button
                                        onClick={() => {
                                            const confirmDelete = window.confirm(
                                                'Delete this department?'
                                            )

                                            if (confirmDelete) {
                                                deleteMutation.mutate(dept.id)
                                            }
                                        }}
                                        className="p-2 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <p className="text-slate-500 text-sm mt-4 line-clamp-2 min-h-[40px]">
                                {dept.description ||
                                    'No description available'}
                            </p>

                            <div className="grid grid-cols-2 gap-4 mt-5">
                                <div className="bg-slate-50 rounded-xl p-3">
                                    <p className="text-xs text-slate-400">
                                        Employees
                                    </p>

                                    <h4 className="font-bold text-slate-800 mt-1">
                                        {dept.totalEmployees || 12}
                                    </h4>
                                </div>

                                <div className="bg-slate-50 rounded-xl p-3">
                                    <p className="text-xs text-slate-400">
                                        Budget
                                    </p>

                                    <h4 className="font-bold text-slate-800 mt-1">
                                        ₹{dept.budget || 500000}
                                    </h4>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-5">
                                <div>
                                    <p className="text-xs text-slate-400">
                                        Department Head
                                    </p>

                                    <h4 className="font-medium text-slate-700 mt-1">
                                        {dept.departmentHead || 'Admin'}
                                    </h4>
                                </div>

                                <span
                                    className={`px-3 py-1 text-xs rounded-full font-medium ${
    (dept.status || 'Active') ===
    'Active'
        ? 'bg-green-100 text-green-700'
        : 'bg-red-100 text-red-700'
}`}
                                >
                                    {dept.status || 'Active'}
                                </span>
                            </div>

                            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                                <span>
                                    Created:{' '}
                                    {dept.createdAt
                                        ? new Date(
                                              dept.createdAt
                                          ).toLocaleDateString()
                                        : 'N/A'}
                                </span>

                                <div className="flex items-center gap-1 text-purple-600 font-medium">
                                    <Briefcase size={14} />
                                    Department
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}

            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">
                                    {editDept
                                        ? 'Edit Department'
                                        : 'Create Department'}
                                </h3>

                                <p className="text-sm text-slate-400 mt-1">
                                    Manage your organization structure
                                </p>
                            </div>

                            <button
                                onClick={closeModal}
                                className="p-2 rounded-xl hover:bg-slate-100"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="p-6 space-y-5"
                        >
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Department Name
                                </label>

                                <input
                                    type="text"
                                    value={form.departmentName}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            departmentName:
                                                e.target.value,
                                        })
                                    }
                                    placeholder="Engineering"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Department Head
                                </label>

                                <input
                                    type="text"
                                    value={form.departmentHead}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            departmentHead: e.target.value,
                                        })
                                    }
                                    placeholder="John Doe"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Budget
                                    </label>

                                    <input
                                        type="number"
                                        value={form.budget}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                budget: e.target.value,
                                            })
                                        }
                                        placeholder="500000"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Status
                                    </label>

                                    <select
                                        value={form.status}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                status: e.target.value as 'Active' | 'Inactive',
                                            })
                                        }
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="Active">
                                            Active
                                        </option>

                                        <option value="Inactive">
                                            Inactive
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Description
                                </label>

                                <textarea
                                    rows={4}
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            description: e.target.value,
                                        })
                                    }
                                    placeholder="Write department description..."
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white font-medium hover:shadow-lg transition-all"
                                >
                                    {editDept
                                        ? 'Update Department'
                                        : 'Create Department'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DepartmentsPage