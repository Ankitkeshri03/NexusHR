import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
    Bell,
    ChartColumn,
    ChevronRight,
    Flag,
    Gauge,
    MessageSquareText,
    Radar,
    ShieldAlert,
    Trophy,
    Users,
} from 'lucide-react'
import {
    ActionButton,
    InsightList,
    MetricsGrid,
    PeoplePageShell,
    SectionCard,
} from '@/components/people/PeopleAnalytics'

const domainCards = [
    {
        title: 'Performance reviews',
        path: '/performance-reviews',
        icon: Trophy,
        summary: 'Track calibration quality, completion, and high-performer readiness.',
        tone: 'from-indigo-500 to-cyan-500',
    },
    {
        title: 'Goals',
        path: '/goals',
        icon: Flag,
        summary: 'See execution health, stalled milestones, and ownership clarity.',
        tone: 'from-sky-500 to-blue-500',
    },
    {
        title: 'Feedback',
        path: '/feedback',
        icon: MessageSquareText,
        summary: 'Combine pulse, peer, and manager feedback into one engagement view.',
        tone: 'from-emerald-500 to-teal-500',
    },
    {
        title: 'Attrition',
        path: '/attrition',
        icon: ShieldAlert,
        summary: 'Forecast regrettable churn and assign retention actions early.',
        tone: 'from-rose-500 to-pink-500',
    },
    {
        title: 'Skill gaps',
        path: '/skill-gap-analysis',
        icon: Radar,
        summary: 'Measure readiness against future capability requirements.',
        tone: 'from-amber-500 to-orange-500',
    },
    {
        title: 'Workforce insights',
        path: '/workforce-insights',
        icon: Users,
        summary: 'Align staffing, manager span, and capacity with the business plan.',
        tone: 'from-violet-500 to-fuchsia-500',
    },
    {
        title: 'Notifications',
        path: '/notifications',
        icon: Bell,
        summary: 'Focus attention on the alerts and nudges that truly need action.',
        tone: 'from-slate-700 to-slate-500',
    },
    {
        title: 'Reports',
        path: '/reports',
        icon: ChartColumn,
        summary: 'Turn people data into board-ready reporting and recommendations.',
        tone: 'from-cyan-500 to-sky-500',
    },
]

const PeopleOverviewPage = () => {
    const metricItems = useMemo(() => ([
        { label: 'Review completion', value: '86%', icon: Trophy, tone: 'indigo', change: '+9%', trend: 'up' as const, detail: 'Healthy momentum into calibration week.' },
        { label: 'Goals on track', value: '78%', icon: Flag, tone: 'amber', change: '+6%', trend: 'up' as const, detail: 'Execution discipline is improving across teams.' },
        { label: 'Critical talent risk', value: '19', icon: ShieldAlert, tone: 'rose', change: '-2', trend: 'down' as const, detail: 'Retention plans are reducing exposure.' },
        { label: 'Manager effectiveness', value: '81%', icon: Gauge, tone: 'emerald', change: '+4 pts', trend: 'up' as const, detail: 'Coaching programs are starting to stick.' },
    ]), [])

    return (
        <PeoplePageShell
            eyebrow="People Intelligence"
            title="Build an operating system for modern HR decisions"
            description="This workspace now includes production-ready page shells for performance, goals, feedback, attrition, skill gaps, workforce planning, notifications, and executive reporting. The layouts are responsive, dashboard-oriented, and ready to connect to live APIs."
            actions={(
                <>
                    <ActionButton label="Export leadership pack" />
                    <ActionButton label="Configure signals" subtle />
                </>
            )}
            spotlight={[
                { label: 'Active domains', value: '8 linked product areas' },
                { label: 'Design system', value: 'Shared analytics components' },
                { label: 'Readiness', value: 'Responsive and production-styled' },
            ]}
        >
            <MetricsGrid items={metricItems} />

            <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
                <SectionCard title="Workspace coverage" kicker="Product map">
                    <div className="grid gap-4 md:grid-cols-2">
                        {domainCards.map((card) => {
                            const Icon = card.icon
                            return (
                                <Link
                                    key={card.path}
                                    to={card.path}
                                    className="group rounded-3xl border border-slate-200 bg-slate-50/80 p-5 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-[0_18px_50px_-36px_rgba(15,23,42,0.55)]"
                                >
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.tone} text-white`}>
                                        <Icon size={20} />
                                    </div>
                                    <div className="mt-4 flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="text-base font-semibold capitalize text-slate-900">{card.title}</h3>
                                            <p className="mt-2 text-sm leading-6 text-slate-600">{card.summary}</p>
                                        </div>
                                        <ChevronRight size={18} className="mt-1 text-slate-400 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </SectionCard>

                <SectionCard title="Why this works" kicker="Implementation notes">
                    <InsightList
                        items={[
                            { title: 'No chart dependency required', body: 'The pages use clean card, bar, and table patterns so we can ship quickly without blocking on a charting library.', tag: 'Performance' },
                            { title: 'Designed for API wiring', body: 'Each page is structured around metrics, drivers, insights, and operational tables, which maps cleanly to your backend services.', tag: 'Architecture' },
                            { title: 'Leadership-friendly visual language', body: 'The layouts emphasize signal clarity, prioritization, and concise storytelling rather than noisy admin UI chrome.', tag: 'UX' },
                        ]}
                    />
                </SectionCard>
            </div>
        </PeoplePageShell>
    )
}

export default PeopleOverviewPage
