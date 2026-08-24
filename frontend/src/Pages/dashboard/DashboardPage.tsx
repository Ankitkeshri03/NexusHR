import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    Users, UserCheck, UserX, UserPlus, TrendingUp, ClipboardList,
    ArrowUpRight, ArrowDownRight, Building2, DollarSign,
    Bell, CalendarDays, Zap, CheckCircle2, Clock,
    AlertCircle, BarChart2, Activity, ChevronRight,
    Briefcase, Shield, RefreshCw
} from 'lucide-react'
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'
import { adminService } from '../../services/adminService'

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface DashboardData {
    totalEmployees: number
    presentToday: number
    onLeave: number
    newJoinees: number
    recentEmployees: {
        id: number
        name: string
        department: string
        status: string
        joined: string
    }[]
}

// ─────────────────────────────────────────────────────────────────────────────
// MOCK CHART DATA  (replace with real API data when backend is ready)
// ─────────────────────────────────────────────────────────────────────────────

const GROWTH_DATA = [
    { month: 'Jan', employees: 42 },
    { month: 'Feb', employees: 48 },
    { month: 'Mar', employees: 51 },
    { month: 'Apr', employees: 55 },
    { month: 'May', employees: 60 },
    { month: 'Jun', employees: 63 },
    { month: 'Jul', employees: 70 },
]

const ATTENDANCE_DATA = [
    { day: 'Mon', present: 88, absent: 12 },
    { day: 'Tue', present: 92, absent: 8 },
    { day: 'Wed', present: 85, absent: 15 },
    { day: 'Thu', present: 94, absent: 6 },
    { day: 'Fri', present: 78, absent: 22 },
]

const DEPT_DATA = [
    { dept: 'Eng',     count: 24 },
    { dept: 'HR',      count: 8  },
    { dept: 'Sales',   count: 15 },
    { dept: 'Finance', count: 10 },
    { dept: 'Ops',     count: 12 },
    { dept: 'Design',  count: 6  },
]

const LEAVE_PIE = [
    { name: 'Present', value: 68, color: '#7c3aed' },
    { name: 'On Leave', value: 12, color: '#f59e0b' },
    { name: 'Remote',   value: 14, color: '#3b82f6' },
    { name: 'Absent',   value: 6,  color: '#ef4444' },
]

const ACTIVITY_FEED = [
    { id: 1, icon: UserPlus,   color: 'bg-emerald-100 text-emerald-600', text: 'Riya Sharma joined Engineering', time: '2 min ago' },
    { id: 2, icon: CheckCircle2, color: 'bg-blue-100 text-blue-600',   text: 'Leave approved for Rahul Verma', time: '18 min ago' },
    { id: 3, icon: DollarSign, color: 'bg-purple-100 text-purple-600', text: 'May payroll generated — ₹8.2L', time: '1 hr ago' },
    { id: 4, icon: Building2,  color: 'bg-amber-100 text-amber-600',   text: 'Department "Design" created', time: '3 hr ago' },
    { id: 5, icon: Shield,     color: 'bg-rose-100 text-rose-600',     text: 'Admin role assigned to Priya', time: '5 hr ago' },
    { id: 6, icon: UserCheck,  color: 'bg-teal-100 text-teal-600',     text: 'Attendance marked for 94 employees', time: 'Yesterday' },
]

const PENDING_TASKS = [
    { id: 1, label: 'Leave requests awaiting approval',  count: 5,  priority: 'high',   icon: CalendarDays },
    { id: 2, label: 'Payroll processing for June',       count: 1,  priority: 'high',   icon: DollarSign  },
    { id: 3, label: 'Attendance corrections pending',    count: 3,  priority: 'medium', icon: Clock       },
    { id: 4, label: 'User verifications pending',        count: 2,  priority: 'medium', icon: Shield      },
    { id: 5, label: 'New employee onboarding tasks',     count: 4,  priority: 'low',    icon: Briefcase   },
]

const HR_INSIGHTS = [
    { text: 'Attendance improved by 8% this week',    color: 'border-emerald-200 bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
    { text: '3 employees are on leave today',          color: 'border-amber-200 bg-amber-50 text-amber-700',      dot: 'bg-amber-500'   },
    { text: 'Engineering has the highest payroll cost',color: 'border-purple-200 bg-purple-50 text-purple-700',   dot: 'bg-purple-500'  },
    { text: 'Sales department growing 12% this month', color: 'border-blue-200 bg-blue-50 text-blue-700',         dot: 'bg-blue-500'    },
]

const EVENTS = [
    { date: 28, label: "Anil's Birthday",   color: 'bg-pink-100 text-pink-700'   },
    { date: 30, label: 'Holiday: Eid',      color: 'bg-emerald-100 text-emerald-700' },
    { date: 31, label: 'Riya Onboarding',   color: 'bg-purple-100 text-purple-700' },
]

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const formatDate = (value: string) =>
    new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good Morning'
    if (h < 17) return 'Good Afternoon'
    return 'Good Evening'
}

const getInitials = (name: string) =>
    (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

const AVATAR_COLORS = [
    'from-purple-500 to-violet-600',
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-500',
    'from-amber-400 to-orange-500',
    'from-rose-500 to-pink-600',
]

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON
// ─────────────────────────────────────────────────────────────────────────────

const Skeleton = ({ className }: { className?: string }) => (
    <div className={`animate-pulse rounded-lg bg-slate-200 ${className ?? ''}`} />
)

const KpiSkeleton = () => (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="mt-4 h-7 w-20" />
        <Skeleton className="mt-2 h-3 w-28" />
    </div>
)

// ─────────────────────────────────────────────────────────────────────────────
// KPI CARD
// ─────────────────────────────────────────────────────────────────────────────

type KpiCardProps = {
    icon: React.ElementType
    label: string
    value: number | string
    color: string
    trend?: string | null
    trendUp?: boolean
    sub?: string
}

const KpiCard = ({
                     icon: Icon,
                     label,
                     value,
                     color,
                     trend,
                     trendUp = true,
                     sub,
                 }: KpiCardProps) => (
    <div className="group flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start justify-between">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br ${color}`}>
                <Icon size={20} className="text-white" />
            </div>
            {trend && (
                <span className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    trendUp ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                }`}>
                    {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {trend}
                </span>
            )}
        </div>
        <div>
            <p className="text-2xl font-extrabold text-slate-800 tabular-nums">{value}</p>
            <p className="mt-0.5 text-sm text-slate-500">{label}</p>
            {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
        </div>
        <div className={`h-0.5 w-full rounded-full bg-linear-to-r ${color} opacity-30 transition-opacity group-hover:opacity-80`} />
    </div>
)

// ─────────────────────────────────────────────────────────────────────────────
// SECTION HEADER
// ─────────────────────────────────────────────────────────────────────────────

const SectionHeader = ({ icon: Icon, title, action }: {
    icon: React.ElementType; title: string; action?: { label: string; onClick: () => void }
}) => (
    <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Icon size={16} className="text-purple-600" />
            <h3 className="font-bold text-slate-800">{title}</h3>
        </div>
        {action && (
            <button
                onClick={action.onClick}
                className="flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-700"
            >
                {action.label} <ChevronRight size={12} />
            </button>
        )}
    </div>
)

// ─────────────────────────────────────────────────────────────────────────────
// PRIORITY BADGE
// ─────────────────────────────────────────────────────────────────────────────

const PriorityBadge = ({ priority }: { priority: string }) => {
    const map: Record<string, string> = {
        high:   'bg-red-50 text-red-600 ring-1 ring-red-200',
        medium: 'bg-amber-50 text-amber-600 ring-1 ring-amber-200',
        low:    'bg-slate-100 text-slate-500 ring-1 ring-slate-200',
    }
    return (
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${map[priority] ?? map.low}`}>
            {priority}
        </span>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM CHART TOOLTIP
// ─────────────────────────────────────────────────────────────────────────────

const ChartTooltip = ({ active, payload, label }: {
    active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string
}) => {
    if (!active || !payload?.length) return null
    return (
        <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-lg text-xs">
            <p className="mb-1.5 font-bold text-slate-600">{label}</p>
            {payload.map(p => (
                <p key={p.name} style={{ color: p.color }} className="font-medium">
                    {p.name}: {p.value}
                </p>
            ))}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD PAGE
// ─────────────────────────────────────────────────────────────────────────────

const DashboardPage = () => {
    const { data, isLoading } = useQuery<DashboardData>({
        queryKey: ['dashboard'],
        queryFn: () => adminService.getDashboard().then(r => r.data),
    })

    const now     = new Date()
    const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

    const attendancePct = useMemo(() => {
        const total = data?.totalEmployees ?? 0
        const present = data?.presentToday ?? 0
        return total > 0 ? Math.round((present / total) * 100) : 0
    }, [data])

    const kpiCards: {
        icon: React.ElementType
        label: string
        value: number | string
        color: string
        trend: string | null
        trendUp?: boolean
        sub: string
    }[] = useMemo(() => [
        { icon: Users,       label: 'Total Employees', value: data?.totalEmployees ?? 0, color: 'from-purple-500 to-violet-600', trend: '+4%',  trendUp: true,  sub: 'All time' },
        { icon: UserCheck,   label: 'Present Today',   value: data?.presentToday ?? 0,   color: 'from-emerald-500 to-teal-500', trend: '+8%',  trendUp: true,  sub: `${attendancePct}% attendance` },
        { icon: UserX,       label: 'On Leave',        value: data?.onLeave ?? 0,        color: 'from-amber-400 to-orange-500', trend: '-2%',  trendUp: false, sub: 'Approved leaves' },
        { icon: UserPlus,    label: 'New Joiners',     value: data?.newJoinees ?? 0,     color: 'from-blue-500 to-indigo-600',  trend: '+12%', trendUp: true,  sub: 'This month' },
        { icon: ClipboardList, label: 'Pending Leaves', value: 5,                       color: 'from-rose-500 to-pink-600',    trend: null,                   sub: 'Awaiting review' },
        { icon: DollarSign,  label: 'Monthly Payroll', value: '₹8.2L',                  color: 'from-teal-500 to-cyan-600',    trend: '+3%',  trendUp: true,  sub: 'May 2025' },
        { icon: BarChart2,   label: 'Attrition Rate',  value: '2.1%',                   color: 'from-slate-500 to-slate-600',  trend: '-0.4%',trendUp: true,  sub: 'Last 3 months' },
        { icon: Activity,    label: 'Active Users',    value: 38,                        color: 'from-indigo-500 to-purple-600',trend: '+6',   trendUp: true,  sub: 'Platform logins' },
    ], [data, attendancePct])

    return (
        <div className="space-y-6 pb-10">

            {/* ── HERO BANNER ── */}
            <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-purple-600 via-violet-700 to-indigo-800 p-6 text-white shadow-lg shadow-purple-200">
                {/* Decorative circles */}
                <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/5" />
                <div className="pointer-events-none absolute -bottom-8 right-20 h-32 w-32 rounded-full bg-white/5" />

                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-purple-200">{dateStr}</p>
                        <h2 className="mt-1 text-2xl font-extrabold">{getGreeting()}, Admin 👋</h2>
                        <p className="mt-1 text-purple-200">Here's your NexusHR snapshot for today.</p>

                        {/* Quick insight chips */}
                        <div className="mt-4 flex flex-wrap gap-2">
                            <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                {attendancePct}% attendance today
                            </span>
                            <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                                {data?.onLeave ?? 0} on leave
                            </span>
                            <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                                <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                                5 approvals pending
                            </span>
                        </div>
                    </div>

                    {/* Quick actions */}
                    <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                        {[
                            { icon: UserPlus,  label: 'Add Employee' },
                            { icon: DollarSign,label: 'Payroll' },
                            { icon: RefreshCw, label: 'Refresh' },
                        ].map(({ icon: Icon, label }) => (
                            <button key={label} className="flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-2 text-xs font-semibold backdrop-blur-sm transition-colors hover:bg-white/25">
                                <Icon size={13} /> {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── KPI CARDS ── */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {isLoading
                    ? Array.from({ length: 8 }).map((_, i) => <KpiSkeleton key={i} />)
                    : kpiCards.map(card => <KpiCard key={card.label} {...card} />)
                }
            </div>

            {/* ── CHARTS ROW ── */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

                {/* Employee Growth — spans 2 cols */}
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-2">
                    <SectionHeader icon={TrendingUp} title="Employee Growth" />
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={GROWTH_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="empGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<ChartTooltip />} />
                            <Area type="monotone" dataKey="employees" name="Employees" stroke="#7c3aed" strokeWidth={2.5} fill="url(#empGrad)" dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Work Mode Pie */}
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <SectionHeader icon={Activity} title="Today's Workforce" />
                    <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                            <Pie data={LEAVE_PIE} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                                {LEAVE_PIE.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                            </Pie>
                            <Tooltip formatter={(v: unknown) => [`${v}%`]} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-2 grid grid-cols-2 gap-1.5">
                        {LEAVE_PIE.map(e => (
                            <div key={e.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: e.color }} />
                                {e.name} <span className="ml-auto font-semibold text-slate-800">{e.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── ATTENDANCE + DEPT CHARTS ── */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

                {/* Weekly Attendance */}
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <SectionHeader icon={UserCheck} title="Weekly Attendance" />
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={ATTENDANCE_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<ChartTooltip />} />
                            <Bar dataKey="present" name="Present" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="absent"  name="Absent"  fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Dept Distribution */}
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <SectionHeader icon={Building2} title="Employees by Department" />
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={DEPT_DATA} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                            <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis type="category" dataKey="dept" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={44} />
                            <Tooltip content={<ChartTooltip />} />
                            <Bar dataKey="count" name="Employees" fill="#7c3aed" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ── BOTTOM 3-COL ROW ── */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

                {/* Activity Feed */}
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <SectionHeader icon={Bell} title="Activity Feed" />
                    <div className="space-y-3 overflow-y-auto" style={{ maxHeight: 280 }}>
                        {ACTIVITY_FEED.map(item => {
                            const Icon = item.icon
                            return (
                                <div key={item.id} className="flex items-start gap-3">
                                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.color}`}>
                                        <Icon size={14} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm text-slate-700 leading-snug">{item.text}</p>
                                        <p className="mt-0.5 text-xs text-slate-400">{item.time}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Pending Tasks */}
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <SectionHeader icon={ClipboardList} title="Pending Tasks" />
                    <div className="space-y-3">
                        {PENDING_TASKS.map(task => {
                            const Icon = task.icon
                            return (
                                <div key={task.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:bg-slate-50 transition-colors">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-50">
                                        <Icon size={14} className="text-purple-600" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-medium text-slate-700">{task.label}</p>
                                        <p className="text-xs text-slate-400">{task.count} item{task.count !== 1 ? 's' : ''}</p>
                                    </div>
                                    <PriorityBadge priority={task.priority} />
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* HR Insights + Events */}
                <div className="flex flex-col gap-5">
                    {/* Smart Insights */}
                    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                        <SectionHeader icon={Zap} title="HR Insights" />
                        <div className="space-y-2">
                            {HR_INSIGHTS.map((ins, i) => (
                                <div key={i} className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium ${ins.color}`}>
                                    <span className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${ins.dot}`} />
                                    {ins.text}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Upcoming Events */}
                    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                        <SectionHeader icon={CalendarDays} title="Upcoming Events" />
                        <div className="space-y-2">
                            {EVENTS.map(ev => (
                                <div key={ev.date} className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-xl bg-purple-50">
                                        <span className="text-sm font-extrabold text-purple-700 leading-none">{ev.date}</span>
                                        <span className="text-[9px] font-medium text-purple-400">MAY</span>
                                    </div>
                                    <span className={`rounded-lg px-2.5 py-1 text-xs font-medium ${ev.color}`}>{ev.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── RECENT EMPLOYEES TABLE ── */}
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div className="flex items-center gap-2">
                        <TrendingUp size={16} className="text-purple-600" />
                        <h3 className="font-bold text-slate-800">Recent Employees</h3>
                    </div>
                    <button className="flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-700">
                        View all <ChevronRight size={12} />
                    </button>
                </div>

                {isLoading ? (
                    <div className="space-y-3 p-5">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Skeleton className="h-9 w-9 rounded-full" />
                                <div className="flex-1 space-y-1.5">
                                    <Skeleton className="h-3.5 w-32" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                                <Skeleton className="h-6 w-16 rounded-full" />
                                <Skeleton className="h-3.5 w-20" />
                            </div>
                        ))}
                    </div>
                ) : !data?.recentEmployees.length ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50">
                            <ClipboardList size={24} className="text-purple-300" />
                        </div>
                        <p className="font-semibold text-slate-600">No recent employees</p>
                        <p className="mt-1 text-sm text-slate-400">Employees added recently will appear here</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[540px]">
                            <thead>bg-linear-to-br
                            <tr className="border-b border-slate-100 bg-slate-50/70">
                                {['Employee', 'Department', 'Status', 'Joined'].map(h => (
                                    <th key={h} className="whitespace-nowrap px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                            {data.recentEmployees.map((emp, idx) => (
                                <tr key={emp.id} className="group transition-colors hover:bg-purple-50/20">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full  ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} text-xs font-bold text-white ring-2 ring-white`}>
                                                {getInitials(emp.name)}
                                            </div>
                                            <span className="text-sm font-semibold text-slate-800">{emp.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                            <span className="inline-flex items-center gap-1 rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700 ring-1 ring-purple-100">
                                                <Building2 size={10} />
                                                {emp.department || '—'}
                                            </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${
                                                emp.status === 'Active' || emp.status === 'ACTIVE'
                                                    ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                                                    : 'bg-amber-50 text-amber-700 ring-amber-200'
                                            }`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${emp.status === 'Active' || emp.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                {emp.status}
                                            </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-sm text-slate-500">
                                        {formatDate(emp.joined)}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── DEPT SNAPSHOT ── */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <SectionHeader icon={Building2} title="Department Snapshot" />
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] text-sm">
                        <thead><tr className="border-b border-slate-100">
                            {['Department', 'Employees', 'Attendance', 'Payroll', 'Growth', 'Status'].map(h => (
                                <th key={h} className="whitespace-nowrap pb-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 pr-4 last:pr-0">
                                    {h}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                        {DEPT_DATA.map((d, i) => {
                            const pct = 75 + (i * 7) % 20
                            return (
                                <tr key={d.dept} className="hover:bg-slate-50 transition-colors">
                                    <td className="py-3 pr-4 font-semibold text-slate-800">{d.dept}</td>
                                    <td className="py-3 pr-4 text-slate-600">{d.count}</td>
                                    <td className="py-3 pr-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-20 rounded-full bg-slate-100">
                                                <div className="h-1.5 rounded-full bg-purple-500" style={{ width: `${pct}%` }} />
                                            </div>
                                            <span className="text-xs font-medium text-slate-600">{pct}%</span>
                                        </div>
                                    </td>
                                    <td className="py-3 pr-4 text-slate-600">₹{(d.count * 45000).toLocaleString('en-IN')}</td>
                                    <td className="py-3 pr-4">
                                            <span className={`flex items-center gap-0.5 text-xs font-semibold ${i % 2 === 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                                {i % 2 === 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                                {i % 2 === 0 ? '+8%' : '-2%'}
                                            </span>
                                    </td>
                                    <td className="py-3">
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                                                <span className="h-1 w-1 rounded-full bg-emerald-500" />
                                                Active
                                            </span>
                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── ALERT BANNER ── */}
            <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
                <AlertCircle size={18} className="shrink-0 text-amber-500" />
                <p className="text-sm font-medium text-amber-800">
                    5 leave requests and 2 user verifications are pending your approval.
                </p>
                <button className="ml-auto shrink-0 rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-200">
                    Review
                </button>
            </div>
        </div>
    )
}

export default DashboardPage