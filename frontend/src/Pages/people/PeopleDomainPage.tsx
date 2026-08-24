import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { ActionButton, HorizontalBars, InsightList, MetricsGrid, PeoplePageShell, SectionCard, SimpleTable } from '@/components/people/PeopleAnalytics'
import { peoplePageData } from './peopleData'

const pathToKey: Record<string, keyof typeof peoplePageData> = {
    '/performance-reviews': 'performance',
    '/goals': 'goals',
    '/feedback': 'feedback',
    '/attrition': 'attrition',
    '/skill-gap-analysis': 'skillGap',
    '/workforce-insights': 'workforce',
    '/notifications': 'notifications',
    '/reports': 'reports',
}

const PeopleDomainPage = () => {
    const location = useLocation()
    const pageKey = pathToKey[location.pathname] ?? 'performance'
    const data = useMemo(() => peoplePageData[pageKey], [pageKey])

    return (
        <PeoplePageShell
            eyebrow={data.eyebrow}
            title={data.title}
            description={data.description}
            actions={(
                <>
                    <ActionButton label="Share snapshot" />
                    <ActionButton label="Set alerts" subtle />
                </>
            )}
            spotlight={data.spotlight}
        >
            <MetricsGrid items={data.metrics} />

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <SectionCard title="Key drivers" kicker="Operational view">
                    <HorizontalBars items={data.drivers} />
                </SectionCard>
                <SectionCard title="What needs attention" kicker="Analyst notes">
                    <InsightList items={data.insights} />
                </SectionCard>
            </div>

            <SectionCard title="Execution detail" kicker="Live-ready table">
                <SimpleTable columns={data.table.columns} rows={data.table.rows} />
            </SectionCard>
        </PeoplePageShell>
    )
}

export default PeopleDomainPage
