import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { KeyRound, Pencil, Plus, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminService, type Permission } from '../../services/adminService'
import { getApiErrorMessage } from '../../services/api'

const emptyForm = { permissionName: '', description: '' }

const PermissionsPage = () => {
    const queryClient = useQueryClient()
    const [showModal, setShowModal] = useState(false)
    const [editPermission, setEditPermission] = useState<Permission | null>(null)
    const [form, setForm] = useState(emptyForm)

    const { data: permissions = [], isLoading } = useQuery({
        queryKey: ['permissions'],
        queryFn: () => adminService.getPermissions().then(response => response.data),
    })

    const createMutation = useMutation({
        mutationFn: () => adminService.createPermission(form),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['permissions'] })
            toast.success('Permission created!')
            closeModal()
        },
        onError: error => toast.error(getApiErrorMessage(error, 'Failed to create permission')),
    })

    const updateMutation = useMutation({
        mutationFn: () => adminService.updatePermission(editPermission!.id, form),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['permissions'] })
            toast.success('Permission updated!')
            closeModal()
        },
        onError: error => toast.error(getApiErrorMessage(error, 'Failed to update permission')),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => adminService.deletePermission(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['permissions'] })
            toast.success('Permission deleted!')
        },
        onError: error => toast.error(getApiErrorMessage(error, 'Failed to delete permission')),
    })

    const closeModal = () => {
        setShowModal(false)
        setEditPermission(null)
        setForm(emptyForm)
    }

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault()
        if (editPermission) {
            updateMutation.mutate()
            return
        }
        createMutation.mutate()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Permissions</h2>
                    <p className="mt-0.5 text-sm text-slate-500">Manage system capabilities and access keys</p>
                </div>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700">
                    <Plus size={16} />
                    Add Permission
                </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
                    </div>
                ) : permissions.length === 0 ? (
                    <div className="py-20 text-center text-slate-500">
                        <KeyRound size={40} className="mx-auto mb-3 text-slate-300" />
                        <p className="font-medium">No permissions found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    <th className="px-5 py-3 text-left text-xs font-medium uppercase text-slate-500">Permission</th>
                                    <th className="px-5 py-3 text-left text-xs font-medium uppercase text-slate-500">Description</th>
                                    <th className="px-5 py-3 text-left text-xs font-medium uppercase text-slate-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {permissions.map(permission => (
                                    <tr key={permission.id} className="hover:bg-slate-50">
                                        <td className="px-5 py-3.5 text-sm font-medium text-slate-800">{permission.permissionName}</td>
                                        <td className="px-5 py-3.5 text-sm text-slate-600">{permission.description || '—'}</td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditPermission(permission)
                                                        setForm({ permissionName: permission.permissionName, description: permission.description ?? '' })
                                                        setShowModal(true)
                                                    }}
                                                    className="rounded-lg p-1.5 text-purple-600 hover:bg-purple-100"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Delete this permission?')) {
                                                            deleteMutation.mutate(permission.id)
                                                        }
                                                    }}
                                                    className="rounded-lg p-1.5 text-red-500 hover:bg-red-100"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 p-5">
                            <h3 className="text-lg font-semibold text-slate-800">{editPermission ? 'Edit Permission' : 'Add Permission'}</h3>
                            <button onClick={closeModal} className="rounded-lg p-1.5 hover:bg-slate-100">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4 p-5">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">Permission Name</label>
                                <input value={form.permissionName} onChange={e => setForm({ ...form, permissionName: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" required />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">Description</label>
                                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                            </div>
                            <div className="flex gap-3 pt-1">
                                <button type="button" onClick={closeModal} className="flex-1 rounded-lg border border-slate-200 py-2 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
                                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 rounded-lg bg-purple-600 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-70">
                                    {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editPermission ? 'Update Permission' : 'Create Permission'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PermissionsPage
