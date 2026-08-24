import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

type Trend = 'up' | 'down' | 'flat'

export interface MetricCardItem {
    label: string
    value: string
    change?: string
    trend?: Trend
    detail?: string
    icon: LucideIcon
    tone: string
}

export interface SpotlightItem {
    label: string
    value: string
}

export interface DistributionItem {
    label: string
    value: number
    tone: string
}

const trendStyles: Record<Trend, string> = {
    up: 'bg-emerald-50 text-emerald-700',
    down: 'bg-rose-50 text-rose-700',
    flat: 'bg-slate-100 text-slate-700',
}

const toneStyles: Record<string, string> = {
    indigo: 'from-indigo-500 to-cyan-500',
    amber: 'from-amber-500 to-orange-500',
    emerald: 'from-emerald-500 to-teal-500',
    rose: 'from-rose-500 to-pink-500',
    slate: 'from-slate-700 to-slate-500',
}

const cx = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(' ')

export const PeoplePageShell = ({
    eyebrow,
    title,
    description,
    actions,
    spotlight,
    children,
}: {
    eyebrow: string
    title: string
    description: string
    actions?: ReactNode
    spotlight?: SpotlightItem[]
    children: ReactNode
}) => (
    <div className="space-y-6">
        <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_28%),linear-gradient(135deg,_#0f172a,_#172554_45%,_#164e63)] px-6 py-7 text-white shadow-[0_24px_80px_-48px_rgba(15,23,42,0.95)] md:px-8">
            <div className="absolute inset-y-0 right-0 hidden w-72 bg-[radial-gradient(circle_at_center,_rgba(251,191,36,0.24),_transparent_60%)] lg:block" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200">{eyebrow}</p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 md:text-base">{description}</p>
                </div>
                <div className="flex flex-wrap gap-3">{actions}</div>
            </div>
            {spotlight && spotlight.length > 0 ? (
                <div className="relative mt-6 grid gap-3 md:grid-cols-3">
                    {spotlight.map((item) => (
                        <div key={item.label} className="rounded-2xl border border-white/12 bg-white/8 p-4 backdrop-blur-sm">
                            <p className="text-xs uppercase tracking-[0.22em] text-slate-300">{item.label}</p>
                            <p className="mt-2 text-2xl font-semibold">{item.value}</p>
                        </div>
                    ))}
                </div>
            ) : null}
        </section>
        {children}
    </div>
)

export const ActionButton = ({ label, subtle = false }: { label: string; subtle?: boolean }) => (
    <button
        type="button"
        className={cx(
            'rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
            subtle
                ? 'border border-white/16 bg-white/8 text-white hover:bg-white/14'
                : 'bg-white text-slate-900 hover:bg-cyan-50'
        )}
    >
        {label}
    </button>
)

export const MetricsGrid = ({ items }: { items: MetricCardItem[] }) => (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => {
            const Icon = item.icon
            const trend = item.trend ?? 'flat'
            return (
                <article key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_-36px_rgba(15,23,42,0.55)]">
                    <div className="flex items-start justify-between gap-3">
                        <div className={cx('flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white', toneStyles[item.tone] ?? toneStyles.slate)}>
                            <Icon size={20} />
                        </div>
                        {item.change ? (
                            <span className={cx('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium', trendStyles[trend])}>
                                {trend === 'up' ? <ArrowUpRight size={12} /> : trend === 'down' ? <ArrowDownRight size={12} /> : null}
                                {item.change}
                            </span>
                        ) : null}
                    </div>
                    <p className="mt-5 text-3xl font-semibold tracking-tight text-slate-900">{item.value}</p>
                    <p className="mt-1 text-sm font-medium text-slate-600">{item.label}</p>
                    {item.detail ? <p className="mt-3 text-sm leading-6 text-slate-500">{item.detail}</p> : null}
                </article>
            )
        })}
    </div>
)

export const SectionCard = ({
    title,
    kicker,
    children,
    className,
}: {
    title: string
    kicker?: string
    children: ReactNode
    className?: string
}) => (
    <section className={cx('rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_-36px_rgba(15,23,42,0.45)] md:p-6', className)}>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
                {kicker ? <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{kicker}</p> : null}
                <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">{title}</h3>
            </div>
        </div>
        {children}
    </section>
)

export const HorizontalBars = ({
    items,
    suffix = '%',
}: {
    items: DistributionItem[]
    suffix?: string
}) => (
    <div className="space-y-4">
        {items.map((item) => (
            <div key={item.label}>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-slate-700">{item.label}</span>
                    <span className="text-slate-500">{item.value}{suffix}</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100">
                    <div
                        className={cx('h-full rounded-full bg-gradient-to-r', item.tone)}
                        style={{ width: `${Math.max(8, Math.min(item.value, 100))}%` }}
                    />
                </div>
            </div>
        ))}
    </div>
)

export const InsightList = ({
    items,
}: {
    items: Array<{ title: string; body: string; tag?: string }>
}) => (
    <div className="space-y-3">
        {items.map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-900">{item.title}</p>
                    {item.tag ? <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600">{item.tag}</span> : null}
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
            </div>
        ))}
    </div>
)

export const SimpleTable = ({
    columns,
    rows,
}: {
    columns: string[]
    rows: string[][]
}) => (
    <div className="overflow-x-auto">
        <table className="w-full min-w-[620px]">
            <thead>
                <tr className="border-b border-slate-200 text-left">
                    {columns.map((column) => (
                        <th key={column} className="px-1 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                            {column}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map((row, index) => (
                    <tr key={`${row[0]}-${index}`} className="border-b border-slate-100 last:border-b-0">
                        {row.map((cell, cellIndex) => (
                            <td key={`${cell}-${cellIndex}`} className="px-1 py-4 text-sm text-slate-600 first:font-medium first:text-slate-900">
                                {cell}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
)
