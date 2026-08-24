/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    Bell, Building2, Eye, EyeOff, Lock, MailCheck, Save, User,
    Shield, CheckCircle, AlertTriangle, Camera, Phone,
    Globe, MapPin, CreditCard, RefreshCw, Activity
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api, { getApiErrorMessage } from '../../services/api'
import { useAuth } from '../../context/useAuth'
import { authService } from '../../services/authService'
import { hasRole } from '../../lib/authorization'

type TabType = 'profile' | 'security' | 'notifications' | 'company'

interface SettingsProfile {
    id: number
    username: string
    fullName: string
    email: string
    phoneNumber: string
    designation: string
    status: string
    emailVerified: boolean
}

interface PasswordForm {
    currentPassword: string
    newPassword: string
    confirmPassword: string
}

interface NotificationPreferences {
    emailNotifications: boolean
    pushNotifications: boolean
    leaveAlerts: boolean
    payrollAlerts: boolean
    attendanceAlerts: boolean
    weeklyReports: boolean
    darkMode: boolean
    twoFactorEnabled: boolean
}

interface CompanySettings {
    id?: number
    companyName: string
    companyEmail: string
    companyPhone: string
    address: string
    website: string
    taxId: string
}

const defaultPasswordForm: PasswordForm = {
    currentPassword: '', newPassword: '', confirmPassword: '',
}

// ─── Password Strength ────────────────────────────────────────
const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: '', color: '' }
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    const map = [
        { label: 'Weak', color: 'bg-red-500' },
        { label: 'Fair', color: 'bg-orange-500' },
        { label: 'Good', color: 'bg-yellow-500' },
        { label: 'Strong', color: 'bg-green-500' },
        { label: 'Very Strong', color: 'bg-emerald-500' },
    ]
    return { score, ...map[score] }
}

// ─── Toggle ───────────────────────────────────────────────────
const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button onClick={onChange} type="button"
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${value ? 'bg-purple-600' : 'bg-slate-200'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${value ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
)

// ─── Skeleton ─────────────────────────────────────────────────
const Skeleton = () => (
    <div className="space-y-4 p-6">
        {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
        ))}
    </div>
)

// ─── Main Component ───────────────────────────────────────────
const SettingsPage = () => {
    const { user, logout, refreshUser } = useAuth()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const canManageCompany = hasRole(user, ['ADMIN'])

    const [activeTab, setActiveTab] = useState<TabType>('profile')
    const [profile, setProfile] = useState<SettingsProfile | null>(null)
    const [security, setSecurity] = useState<PasswordForm>(defaultPasswordForm)
    const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false })
    const [notifications, setNotifications] = useState<NotificationPreferences>({
        emailNotifications: true, pushNotifications: false, leaveAlerts: true,
        payrollAlerts: true, attendanceAlerts: false, weeklyReports: true,
        darkMode: false, twoFactorEnabled: false,
    })
    const [company, setCompany] = useState<CompanySettings>({
        companyName: '', companyEmail: '', companyPhone: '', address: '', website: '', taxId: '',
    })

    // Queries
    const profileQuery = useQuery({
        queryKey: ['settings-profile'],
        queryFn: () => api.get<SettingsProfile>('/settings/profile').then(r => r.data),
    })
    const notificationsQuery = useQuery({
        queryKey: ['settings-notifications'],
        queryFn: () => api.get<NotificationPreferences>('/settings/notifications').then(r => r.data),
    })
    const companyQuery = useQuery({
        queryKey: ['settings-company'],
        queryFn: () => api.get<CompanySettings>('/settings/company').then(r => r.data),
        enabled: canManageCompany,
    })

    useEffect(() => {
        if (profileQuery.data && profile === null) {
            setProfile(profileQuery.data)
        }
    }, [profileQuery.data, profile])

    useEffect(() => {
        if (notificationsQuery.data) {
            setNotifications(notificationsQuery.data)
        }
    }, [notificationsQuery.data])

    useEffect(() => {
        if (companyQuery.data ) setCompany({
            companyName: companyQuery.data.companyName ?? '',
            companyEmail: companyQuery.data.companyEmail ?? '',
            companyPhone: companyQuery.data.companyPhone ?? '',
            address: companyQuery.data.address ?? '',
            website: companyQuery.data.website ?? '',
            taxId: companyQuery.data.taxId ?? '',
            id: companyQuery.data.id,
        })
    }, [companyQuery.data])

    // Mutations
    const updateProfileMutation = useMutation({
        mutationFn: (data: SettingsProfile) => api.put<SettingsProfile>('/settings/profile', data),
        onSuccess: async (response) => {
            const previousEmail = profile?.email
            setProfile(response.data)
            queryClient.setQueryData(['settings-profile'], response.data)
            await refreshUser()
            if (previousEmail && previousEmail !== response.data.email) {
                toast.success('Email changed. Please sign in again.')
                await logout(); navigate('/login', { replace: true }); return
            }
            toast.success('Profile updated successfully!')
        },
        onError: err => toast.error(getApiErrorMessage(err, 'Failed to update profile')),
    })

    const updatePasswordMutation = useMutation({
        mutationFn: (data: PasswordForm) => api.put('/settings/password', data),
        onSuccess: async () => {
            setSecurity(defaultPasswordForm)
            toast.success('Password changed. Please sign in again.')
            await logout(); navigate('/login', { replace: true })
        },
        onError: err => toast.error(getApiErrorMessage(err, 'Failed to change password')),
    })

    const updateNotificationsMutation = useMutation({
        mutationFn: (data: NotificationPreferences) => api.put<NotificationPreferences>('/settings/notifications', data),
        onSuccess: (response) => {
            setNotifications(response.data)
            queryClient.setQueryData(['settings-notifications'], response.data)
            toast.success('Preferences saved!')
        },
        onError: err => toast.error(getApiErrorMessage(err, 'Failed to save')),
    })

    const updateCompanyMutation = useMutation({
        mutationFn: (data: CompanySettings) => api.put<CompanySettings>('/settings/company', data),
        onSuccess: (response) => {
            queryClient.setQueryData(['settings-company'], response.data)
            setCompany(response.data); toast.success('Company updated!')
        },
        onError: err => toast.error(getApiErrorMessage(err, 'Failed to update company')),
    })

    const resendVerificationMutation = useMutation({
        mutationFn: (email: string) => authService.resendVerification(email),
        onSuccess: (response) => toast.success(response.data.message),
        onError: err => toast.error(getApiErrorMessage(err, 'Failed to resend')),
    })

    const passwordStrength = getPasswordStrength(security.newPassword)

    const tabs = [
        { id: 'profile' as TabType, label: 'Profile', icon: User },
        { id: 'security' as TabType, label: 'Security', icon: Shield },
        { id: 'notifications' as TabType, label: 'Notifications', icon: Bell },
        { id: 'company' as TabType, label: 'Company', icon: Building2 },
    ].filter(tab => tab.id === 'company' ? canManageCompany : true)

    if (profileQuery.isLoading && !profile) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
            </div>
        )
    }

    if (!profile) return (
        <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-sm text-red-700 flex items-center gap-2">
            <AlertTriangle size={16} /> Unable to load settings.
        </div>
    )

    // Profile completion
    const completedFields = [profile.username, profile.fullName, profile.email, profile.phoneNumber, profile.designation].filter(Boolean).length
    const completionPct = Math.round((completedFields / 5) * 100)

    return (
        <div className="space-y-6">

            {/* ── Header ── */}
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
                <p className="text-sm text-slate-500 mt-0.5">Manage your account and application settings</p>
            </div>

            {/* ── Overview Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-slate-500">Profile Complete</p>
                        <Activity size={14} className="text-purple-500" />
                    </div>
                    <p className="text-2xl font-bold text-purple-600">{completionPct}%</p>
                    <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${completionPct}%` }} />
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-slate-500">Email Status</p>
                        <MailCheck size={14} className={profile.emailVerified ? 'text-green-500' : 'text-amber-500'} />
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        profile.emailVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
            {profile.emailVerified ? <CheckCircle size={11} /> : <AlertTriangle size={11} />}
                        {profile.emailVerified ? 'Verified' : 'Pending'}
          </span>
                </div>
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-slate-500">2FA Status</p>
                        <Lock size={14} className={notifications.twoFactorEnabled ? 'text-green-500' : 'text-slate-400'} />
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        notifications.twoFactorEnabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    }`}>
            {notifications.twoFactorEnabled ? 'Enabled' : 'Disabled'}
          </span>
                </div>
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-slate-500">Account Role</p>
                        <Shield size={14} className="text-purple-500" />
                    </div>
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
            {user?.roles?.[0] || 'EMPLOYEE'}
          </span>
                </div>
            </div>

            {/* ── Email Verification Banner ── */}
            {!profile.emailVerified && (
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start gap-3">
                        <MailCheck className="mt-0.5 text-amber-600 flex-shrink-0" size={18} />
                        <div>
                            <p className="text-sm font-semibold text-amber-900">Email verification pending</p>
                            <p className="text-sm text-amber-700 mt-0.5">
                                Verify <span className="font-medium">{profile.email}</span> to secure your account.
                            </p>
                        </div>
                    </div>
                    <button onClick={() => resendVerificationMutation.mutate(profile.email)}
                            disabled={resendVerificationMutation.isPending}
                            className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-70 whitespace-nowrap">
                        <RefreshCw size={14} className={resendVerificationMutation.isPending ? 'animate-spin' : ''} />
                        {resendVerificationMutation.isPending ? 'Sending...' : 'Resend'}
                    </button>
                </div>
            )}

            {/* ── Main Layout ── */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                        {/* User card */}
                        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-5 text-white">
                            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold mb-3">
                                {(profile.username || 'A').charAt(0).toUpperCase()}
                            </div>
                            <p className="font-semibold">{profile.fullName || profile.username}</p>
                            <p className="text-purple-200 text-xs mt-0.5">{profile.designation || 'No designation'}</p>
                            <p className="text-purple-200 text-xs mt-0.5">{profile.email}</p>
                        </div>
                        <div className="p-2">
                            {tabs.map(tab => {
                                const Icon = tab.icon
                                return (
                                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                                                activeTab === tab.id
                                                    ? 'bg-purple-50 text-purple-700 border-l-2 border-purple-600'
                                                    : 'text-slate-600 hover:bg-slate-50'
                                            }`}>
                                        <Icon size={17} />
                                        {tab.label}
                                        {tab.id === 'security' && !notifications.twoFactorEnabled && (
                                            <span className="ml-auto w-2 h-2 bg-amber-400 rounded-full" />
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="lg:col-span-3 space-y-5">

                    {/* ── PROFILE TAB ── */}
                    {activeTab === 'profile' && (
                        // Change karo
                        <form onSubmit={(e) => {
                            e.preventDefault()
                            if (profile) updateProfileMutation.mutate(profile)
                        }}
                              className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-slate-800">Profile Information</h3>
                                    <p className="text-xs text-slate-400 mt-0.5">Update your personal details</p>
                                </div>
                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                    profile.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                                }`}>{profile.status}</span>
                            </div>

                            {profileQuery.isLoading ? <Skeleton /> : (
                                <div className="p-6 space-y-5">
                                    {/* Avatar */}
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                                {(profile.username || 'A').charAt(0).toUpperCase()}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full border border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-50">
                                                <Camera size={12} className="text-slate-500" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">{profile.fullName || profile.username}</p>
                                            <p className="text-xs text-slate-400">{profile.email}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { label: 'Username', field: 'username', type: 'text', icon: User },
                                            { label: 'Full Name', field: 'fullName', type: 'text', icon: User },
                                            { label: 'Email Address', field: 'email', type: 'email', icon: MailCheck },
                                            { label: 'Phone Number', field: 'phoneNumber', type: 'text', icon: Phone },
                                            { label: 'Designation', field: 'designation', type: 'text', icon: Activity },
                                        ].map(f => (
                                            <div key={f.field}>
                                                <label className="block text-xs font-medium text-slate-600 mb-1">{f.label}</label>
                                                <div className="relative">
                                                    <f.icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input type={f.type}
                                                           value={(profile[f.field as keyof SettingsProfile] as string ?? '') }
                                                           onChange={e => setProfile({ ...profile, [f.field]: e.target.value })}
                                                           className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                                </div>
                                            </div>
                                        ))}
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Account Status</label>
                                            <div className="relative">
                                                <Activity size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input value={profile.status} disabled
                                                       className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-400 cursor-not-allowed" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <button type="submit" disabled={updateProfileMutation.isPending}
                                                className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-70">
                                            <Save size={15} />
                                            {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>
                    )}

                    {/* ── SECURITY TAB ── */}
                    {activeTab === 'security' && (
                        <div className="space-y-5">
                            {/* Change Password */}
                            <form onSubmit={e => {
                                e.preventDefault()
                                if (security.newPassword !== security.confirmPassword) { toast.error('Passwords do not match'); return }
                                if (security.newPassword.length < 8) { toast.error('Min 8 characters required'); return }
                                updatePasswordMutation.mutate(security)
                            }} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100">
                                    <h3 className="font-semibold text-slate-800">Change Password</h3>
                                    <p className="text-xs text-slate-400 mt-0.5">Use a strong password to keep your account secure</p>
                                </div>
                                <div className="p-6 space-y-4">
                                    {[
                                        { key: 'current', label: 'Current Password', field: 'currentPassword' },
                                        { key: 'new', label: 'New Password', field: 'newPassword' },
                                        { key: 'confirm', label: 'Confirm New Password', field: 'confirmPassword' },
                                    ].map(item => (
                                        <div key={item.key}>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">{item.label}</label>
                                            <div className="relative">
                                                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type={showPassword[item.key as keyof typeof showPassword] ? 'text' : 'password'}
                                                    value={security[item.field as keyof PasswordForm]}
                                                    onChange={e => setSecurity({ ...security, [item.field]: e.target.value })}
                                                    className="w-full pl-9 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    required />
                                                <button type="button"
                                                        onClick={() => setShowPassword({ ...showPassword, [item.key]: !showPassword[item.key as keyof typeof showPassword] })}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                    {showPassword[item.key as keyof typeof showPassword] ? <EyeOff size={15} /> : <Eye size={15} />}
                                                </button>
                                            </div>
                                            {/* Password strength */}
                                            {item.key === 'new' && security.newPassword && (
                                                <div className="mt-2">
                                                    <div className="flex gap-1 mb-1">
                                                        {[0,1,2,3].map(i => (
                                                            <div key={i} className={`h-1 flex-1 rounded-full ${i < passwordStrength.score ? passwordStrength.color : 'bg-slate-200'}`} />
                                                        ))}
                                                    </div>
                                                    <p className="text-xs text-slate-500">{passwordStrength.label}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <div className="flex justify-end pt-1">
                                        <button type="submit" disabled={updatePasswordMutation.isPending}
                                                className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-70">
                                            <Save size={15} />
                                            {updatePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                                        </button>
                                    </div>
                                </div>
                            </form>

                            {/* 2FA */}
                            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Shield size={18} className="text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">Two-Factor Authentication</p>
                                            <p className="text-xs text-slate-500 mt-0.5">Add extra layer of security to your account</p>
                                        </div>
                                    </div>
                                    <Toggle
                                        value={notifications.twoFactorEnabled}
                                        onChange={() => setNotifications({ ...notifications, twoFactorEnabled: !notifications.twoFactorEnabled })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── NOTIFICATIONS TAB ── */}
                    {activeTab === 'notifications' && (
                        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100">
                                <h3 className="font-semibold text-slate-800">Notification Preferences</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Choose what notifications you want to receive</p>
                            </div>
                            <div className="p-6">
                                {[
                                    { group: 'Communication', items: [
                                            { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
                                            { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser push notifications' },
                                        ]},
                                    { group: 'HR Alerts', items: [
                                            { key: 'leaveAlerts', label: 'Leave Alerts', desc: 'Leave requests and approvals' },
                                            { key: 'payrollAlerts', label: 'Payroll Alerts', desc: 'Payroll processing updates' },
                                            { key: 'attendanceAlerts', label: 'Attendance Alerts', desc: 'Daily attendance reminders' },
                                        ]},
                                    { group: 'Reports', items: [
                                            { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Weekly HR summary reports' },
                                        ]},
                                ].map(section => (
                                    <div key={section.group} className="mb-6 last:mb-0">
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">{section.group}</p>
                                        <div className="space-y-0 divide-y divide-slate-50">
                                            {section.items.map(item => (
                                                <div key={item.key} className="flex items-center justify-between py-3.5">
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-800">{item.label}</p>
                                                        <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                                                    </div>
                                                    <Toggle
                                                        value={notifications[item.key as keyof NotificationPreferences] as boolean}
                                                        onChange={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof NotificationPreferences] })}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <div className="pt-4 border-t border-slate-100 flex justify-end">
                                    <button onClick={() => updateNotificationsMutation.mutate(notifications)}
                                            disabled={updateNotificationsMutation.isPending}
                                            className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-70">
                                        <Save size={15} />
                                        {updateNotificationsMutation.isPending ? 'Saving...' : 'Save Preferences'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── COMPANY TAB ── */}
                    {activeTab === 'company' && canManageCompany && (
                        <form onSubmit={e => { e.preventDefault(); updateCompanyMutation.mutate(company) }}
                              className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100">
                                <h3 className="font-semibold text-slate-800">Company Information</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Manage your organization details</p>
                            </div>
                            {companyQuery.isLoading ? <Skeleton /> : (
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { label: 'Company Name', field: 'companyName', type: 'text', icon: Building2 },
                                            { label: 'Company Email', field: 'companyEmail', type: 'email', icon: MailCheck },
                                            { label: 'Company Phone', field: 'companyPhone', type: 'text', icon: Phone },
                                            { label: 'Website', field: 'website', type: 'text', icon: Globe },
                                        ].map(f => (
                                            <div key={f.field}>
                                                <label className="block text-xs font-medium text-slate-600 mb-1">{f.label}</label>
                                                <div className="relative">
                                                    <f.icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input type={f.type}
                                                           value={company[f.field as keyof CompanySettings] as string ?? '' }
                                                           onChange={e => setCompany({ ...company, [f.field]: e.target.value })}
                                                           className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                                </div>
                                            </div>
                                        ))}
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Address</label>
                                            <div className="relative">
                                                <MapPin size={14} className="absolute left-3 top-3 text-slate-400" />
                                                <textarea value={company.address} rows={2} placeholder="Company address..."
                                                          onChange={e => setCompany({ ...company, address: e.target.value })}
                                                          className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Tax ID / GSTIN</label>
                                            <div className="relative">
                                                <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input type="text" value={company.taxId}
                                                       onChange={e => setCompany({ ...company, taxId: e.target.value })}
                                                       className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-5 border-t border-slate-100 mt-5">
                                        <button type="submit" disabled={updateCompanyMutation.isPending}
                                                className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-70">
                                            <Save size={15} />
                                            {updateCompanyMutation.isPending ? 'Saving...' : 'Save Company Info'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

export default SettingsPage