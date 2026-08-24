import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
    LayoutDashboard,
    Users,
    Building2,
    Calendar,
    ClipboardList,
    DollarSign,
    Settings,
    ChevronLeft,
    ChevronRight,
    Briefcase,
    ShieldCheck,
    UserCog,
    BadgeCheck,
    Trophy,
    Flag,
    MessageSquareText,
    ShieldAlert,
    Radar,
    Bell,
    FileBarChart2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '../../context/useAuth'
import type { AppRole } from '../../lib/authorization'
import { hasRole } from '../../lib/authorization'

const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'People IQ', icon: FileBarChart2, path: '/people-intelligence' },
    { label: 'Reviews', icon: Trophy, path: '/performance-reviews' },
    { label: 'Goals', icon: Flag, path: '/goals' },
    { label: 'Feedback', icon: MessageSquareText, path: '/feedback' },
    { label: 'Attrition', icon: ShieldAlert, path: '/attrition' },
    { label: 'Skill Gaps', icon: Radar, path: '/skill-gap-analysis' },
    { label: 'Insights', icon: Building2, path: '/workforce-insights' },
    { label: 'Alerts', icon: Bell, path: '/notifications' },
    { label: 'Reports', icon: FileBarChart2, path: '/reports' },
    { label: 'Employees', icon: Users, path: '/employees', roles: ['ADMIN'] as AppRole[] },
    { label: 'Users', icon: UserCog, path: '/users', roles: ['ADMIN'] as AppRole[] },
    { label: 'Permissions', icon: ShieldCheck, path: '/permissions', roles: ['ADMIN'] as AppRole[] },
    { label: 'Designations', icon: BadgeCheck, path: '/designations', roles: ['ADMIN'] as AppRole[] },
    { label: 'Departments', icon: Building2, path: '/departments', roles: ['ADMIN'] as AppRole[] },
    { label: 'Attendance', icon: Calendar, path: '/attendance' },
    { label: 'Leave', icon: ClipboardList, path: '/leave' },
    { label: 'Payroll', icon: DollarSign, path: '/payroll', roles: ['ADMIN'] as AppRole[] },
    { label: 'Settings', icon: Settings, path: '/settings' },
]

const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false)
    const { user } = useAuth()
    const visibleNavItems = navItems.filter(item => hasRole(user, item.roles))
    const displayName = user?.username || 'Admin'
    const primaryRole = user?.roles[0] || 'HR Manager'

    return (
        <div className={cn(
            'h-screen bg-slate-900 text-white flex flex-col transition-all duration-300 relative',
            collapsed ? 'w-16' : 'w-64'
        )}>

            {/* Logo */}
            <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase size={16} className="text-white" />
                </div>
                {!collapsed && (
                    <span className="font-bold text-lg tracking-tight">NexusHR</span>
                )}
            </div>

            {/* Nav Items */}
            <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
                {visibleNavItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                            isActive
                                ? 'bg-purple-600 text-white'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        )}
                    >
                        <item.icon size={18} className="flex-shrink-0" />
                        {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Collapse Button */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-8 w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors"
            >
                {collapsed
                    ? <ChevronRight size={12} />
                    : <ChevronLeft size={12} />
                }
            </button>

            {/* Bottom User */}
            <div className="border-t border-slate-700 p-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                        {displayName.charAt(0)}
                    </div>
                    {!collapsed && (
                        <div>
                            <p className="text-sm font-medium">{displayName}</p>
                            <p className="text-xs text-slate-400">{primaryRole}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Sidebar
