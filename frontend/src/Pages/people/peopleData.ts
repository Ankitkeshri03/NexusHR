import type { LucideIcon } from 'lucide-react'
import {
    Bell,
    BookOpen,
    BriefcaseBusiness,
    ChartColumn,
    Flag,
    Gauge,
    MessageSquareText,
    Radar,
    ShieldAlert,
    Sparkles,
    Target,
    Trophy,
    Users,
} from 'lucide-react'
import type { DistributionItem, MetricCardItem, SpotlightItem } from '@/components/people/PeopleAnalytics'

export interface PeoplePageData {
    eyebrow: string
    title: string
    description: string
    spotlight: SpotlightItem[]
    metrics: MetricCardItem[]
    drivers: DistributionItem[]
    insights: Array<{ title: string; body: string; tag?: string }>
    table: {
        columns: string[]
        rows: string[][]
    }
}

const gradient = {
    blue: 'from-sky-500 to-indigo-500',
    green: 'from-emerald-500 to-teal-500',
    amber: 'from-amber-500 to-orange-500',
    rose: 'from-rose-500 to-pink-500',
}

const metric = (
    label: string,
    value: string,
    icon: LucideIcon,
    tone: string,
    change?: string,
    trend?: 'up' | 'down' | 'flat',
    detail?: string,
): MetricCardItem => ({ label, value, icon, tone, change, trend, detail })

export const peoplePageData: Record<string, PeoplePageData> = {
    performance: {
        eyebrow: 'Talent Performance',
        title: 'Performance Reviews',
        description: 'Track review coverage, manager calibration, and recognition momentum with a delivery-ready review cockpit for quarterly cycles.',
        spotlight: [
            { label: 'Current Cycle', value: 'Q2 calibration week' },
            { label: 'Completion Risk', value: '12 managers overdue' },
            { label: 'Recognition Pulse', value: '84% positive sentiment' },
        ],
        metrics: [
            metric('Reviews Completed', '86%', Trophy, 'indigo', '+9%', 'up', 'Up from 77% at the same point last cycle.'),
            metric('Employees At Risk', '28', ShieldAlert, 'rose', '-6', 'down', 'Fewer low-score employees after coaching plans launched.'),
            metric('Calibration Quality', '91%', Gauge, 'emerald', '+4 pts', 'up', 'Cross-team score variance is tightening.'),
            metric('Top Performer Bench', '74', Sparkles, 'amber', '+11', 'up', 'Ready-now successors surfaced this month.'),
        ],
        drivers: [
            { label: 'Engineering', value: 93, tone: gradient.blue },
            { label: 'Sales', value: 81, tone: gradient.amber },
            { label: 'Customer Success', value: 88, tone: gradient.green },
            { label: 'Operations', value: 76, tone: gradient.rose },
        ],
        insights: [
            { title: 'Review quality is strongest where managers hold monthly 1:1s', body: 'Teams with steady 1:1 cadence are showing 13-point better written feedback quality and fewer disputed ratings.', tag: 'Manager habit' },
            { title: 'Sales needs calibration support', body: 'Mid-band ratings are clustering, suggesting managers need clearer anchors before final committee review.', tag: 'Attention' },
            { title: 'Recognition volume is rising faster than promotion nominations', body: 'There is a strong culture signal here, but nomination criteria may be too narrow for current team structure.', tag: 'Opportunity' },
        ],
        table: {
            columns: ['Team', 'Completion', 'Avg Score', 'Overdue', 'Next Action'],
            rows: [
                ['Engineering', '93%', '4.4 / 5', '3', 'Finalize calibration panel'],
                ['Sales', '81%', '4.0 / 5', '5', 'Coach frontline managers'],
                ['Finance', '89%', '4.2 / 5', '1', 'Publish reward recommendations'],
                ['Operations', '76%', '3.8 / 5', '3', 'Escalate overdue reviews'],
            ],
        },
    },
    goals: {
        eyebrow: 'Execution Health',
        title: 'Goals and OKRs',
        description: 'See whether strategic goals are progressing on time, where ownership is blocked, and how execution quality differs across functions.',
        spotlight: [
            { label: 'Quarter Focus', value: 'Platform resilience + manager enablement' },
            { label: 'On Track Goals', value: '62 of 79' },
            { label: 'Blockers Logged', value: '14 active dependencies' },
        ],
        metrics: [
            metric('Goals On Track', '78%', Target, 'indigo', '+6%', 'up', 'Improved after weekly review rituals were introduced.'),
            metric('Stalled Milestones', '11', Flag, 'rose', '-3', 'down', 'Most remaining blockers are cross-functional dependencies.'),
            metric('Ownership Clarity', '94%', Users, 'emerald', '+2 pts', 'up', 'Nearly all goals now have named executive owners.'),
            metric('Stretch Goal Progress', '68%', ChartColumn, 'amber', '+7 pts', 'up', 'Hard goals are moving without sacrificing baseline delivery.'),
        ],
        drivers: [
            { label: 'Product Delivery', value: 84, tone: gradient.blue },
            { label: 'Revenue Growth', value: 72, tone: gradient.amber },
            { label: 'People Programs', value: 91, tone: gradient.green },
            { label: 'Ops Excellence', value: 63, tone: gradient.rose },
        ],
        insights: [
            { title: 'Executive-owned goals stay greener longer', body: 'Goals with visible executive sponsorship are 1.8x more likely to receive weekly updates and unblock faster.', tag: 'Pattern' },
            { title: 'Ops excellence work is under-resourced', body: 'Three milestones depend on the same analytics squad, creating a repeated bottleneck across operations initiatives.', tag: 'Capacity' },
            { title: 'People programs are the best-run portfolio', body: 'Milestones are smaller, clearer, and better sequenced, which is helping the team deliver with less status churn.', tag: 'Benchmark' },
        ],
        table: {
            columns: ['Objective', 'Owner', 'Progress', 'Risk', 'Update'],
            rows: [
                ['Reduce regrettable attrition', 'People Ops', '82%', 'Low', 'Expansion plan to sales pod starts Friday'],
                ['Improve release reliability', 'Platform', '76%', 'Medium', 'Awaiting vendor migration sign-off'],
                ['Raise manager effectiveness', 'HRBP', '91%', 'Low', 'Certification cohort two launched'],
                ['Automate workforce planning', 'Finance Ops', '58%', 'High', 'Data model redesign required'],
            ],
        },
    },
    feedback: {
        eyebrow: 'Employee Voice',
        title: 'Feedback and Engagement',
        description: 'Combine pulse surveys, manager notes, and peer feedback into a clean engagement view that helps HR intervene before morale dips turn into attrition.',
        spotlight: [
            { label: 'Pulse Window', value: 'Open for 3 more days' },
            { label: 'Response Rate', value: '79% company-wide' },
            { label: 'Escalations', value: '7 comments flagged' },
        ],
        metrics: [
            metric('Engagement Score', '8.4 / 10', MessageSquareText, 'indigo', '+0.6', 'up', 'Highest since leadership Q&A cadence was increased.'),
            metric('Manager Feedback SLA', '92%', Bell, 'emerald', '+5%', 'up', 'Managers are closing action items faster this month.'),
            metric('Anonymous Risk Signals', '13', ShieldAlert, 'rose', '-2', 'down', 'Most concern themes are isolated to two business units.'),
            metric('Peer Recognition Posts', '246', Sparkles, 'amber', '+18%', 'up', 'Recognition flow remains strongest in hybrid teams.'),
        ],
        drivers: [
            { label: 'Belonging', value: 87, tone: gradient.green },
            { label: 'Manager Support', value: 82, tone: gradient.blue },
            { label: 'Growth Confidence', value: 74, tone: gradient.amber },
            { label: 'Change Clarity', value: 68, tone: gradient.rose },
        ],
        insights: [
            { title: 'Change communication is the main drag on sentiment', body: 'Employees are asking for clearer role impact narratives during re-org and tooling changes.', tag: 'Theme' },
            { title: 'Belonging remains resilient in distributed teams', body: 'Teams with regular recognition rituals are preserving belonging even where office attendance is low.', tag: 'Positive' },
            { title: 'Career growth questions keep recurring', body: 'Many comments mention uncertainty about what “good” looks like for the next level.', tag: 'Action item' },
        ],
        table: {
            columns: ['Segment', 'Sentiment', 'Responses', 'Hot Topic', 'Owner'],
            rows: [
                ['Engineering', 'Positive', '142', 'Career pathing', 'CTO Staff'],
                ['Sales', 'Mixed', '88', 'Comp clarity', 'RevOps'],
                ['Operations', 'Mixed', '64', 'Workload spikes', 'COO'],
                ['Finance', 'Positive', '31', 'Hybrid flexibility', 'Finance Lead'],
            ],
        },
    },
    attrition: {
        eyebrow: 'Retention Watch',
        title: 'Attrition Forecast',
        description: 'Surface the workforce segments most likely to churn, the drivers behind departures, and where retention plans will matter most over the next quarter.',
        spotlight: [
            { label: 'Forecast Horizon', value: 'Next 90 days' },
            { label: 'Regrettable Risk', value: '4.8% of headcount' },
            { label: 'Exit Driver', value: 'Career growth + manager load' },
        ],
        metrics: [
            metric('Attrition Rate', '11.2%', BriefcaseBusiness, 'rose', '-1.4 pts', 'down', 'Trending better than the 12-month baseline.'),
            metric('Critical Talent At Risk', '19', ShieldAlert, 'amber', '+2', 'up', 'High-skill ICs in customer-facing roles dominate the list.'),
            metric('Retention Plan Coverage', '73%', Bell, 'emerald', '+12%', 'up', 'Most at-risk segments now have active managers assigned.'),
            metric('Exit Interview Completion', '95%', BookOpen, 'indigo', '+3 pts', 'up', 'Signal quality is strong enough to guide action.'),
        ],
        drivers: [
            { label: 'Career stagnation', value: 72, tone: gradient.rose },
            { label: 'Manager overload', value: 63, tone: gradient.amber },
            { label: 'Comp pressure', value: 49, tone: gradient.blue },
            { label: 'Flexibility mismatch', value: 38, tone: gradient.green },
        ],
        insights: [
            { title: 'Tenure cliffs are visible at 18 to 24 months', body: 'Employees hitting the post-ramp plateau without role expansion are far more likely to start exploring.', tag: 'Tenure' },
            { title: 'Manager span is a leading indicator', body: 'Teams where managers support more than nine direct reports show weaker stay-intent and slower action follow-up.', tag: 'Leading signal' },
            { title: 'Comp matters, but development matters more', body: 'Comp pressure appears mostly when growth narratives are weak, not as the only driver of exits.', tag: 'Interpretation' },
        ],
        table: {
            columns: ['Segment', 'Risk Score', 'Primary Driver', 'Coverage', 'Plan'],
            rows: [
                ['Mid-market Sales AEs', 'High', 'Career growth', '68%', 'Launch promotion rubric pilot'],
                ['Support Team Leads', 'High', 'Manager load', '74%', 'Backfill 2 open supervisor roles'],
                ['Platform Engineers', 'Medium', 'Comp pressure', '79%', 'Refresh benchmark bands'],
                ['HR Coordinators', 'Low', 'Commute fatigue', '91%', 'Expand remote flexibility'],
            ],
        },
    },
    skillGap: {
        eyebrow: 'Capability Mapping',
        title: 'Skill-Gap Analysis',
        description: 'Compare current workforce capability against the plan, uncover fragile skill clusters, and prioritize learning investment where readiness is lagging.',
        spotlight: [
            { label: 'Readiness Goal', value: 'AI literacy across all managers' },
            { label: 'Critical Gaps', value: '32 roles below target proficiency' },
            { label: 'Learning Impact', value: '71% training utilization' },
        ],
        metrics: [
            metric('Role Readiness', '76%', Radar, 'indigo', '+8 pts', 'up', 'Improved after targeted academy launch in Q1.'),
            metric('Critical Skill Gaps', '32', ShieldAlert, 'rose', '-5', 'down', 'Most missing proficiency is concentrated in data-heavy roles.'),
            metric('Upskill Completion', '71%', BookOpen, 'emerald', '+9%', 'up', 'Completion is strongest where managers assign learning time explicitly.'),
            metric('Internal Mobility Readiness', '58%', Users, 'amber', '+6 pts', 'up', 'Bench depth is improving but still thin in analytics roles.'),
        ],
        drivers: [
            { label: 'Data storytelling', value: 61, tone: gradient.rose },
            { label: 'Manager coaching', value: 73, tone: gradient.blue },
            { label: 'AI workflow fluency', value: 57, tone: gradient.amber },
            { label: 'Compliance literacy', value: 88, tone: gradient.green },
        ],
        insights: [
            { title: 'Analytics capability is the bottleneck for promotion pipelines', body: 'Several strong operators are blocked from advancement by weak data interpretation and communication skills.', tag: 'Promotion risk' },
            { title: 'Learning works best when tied to live projects', body: 'Programs with manager-sponsored practice assignments produce materially higher proficiency lift than stand-alone content.', tag: 'Best practice' },
            { title: 'AI fluency is broad but shallow', body: 'Exposure is high, but repeatable workflow confidence is not yet where the business plan assumes it will be.', tag: 'Strategic gap' },
        ],
        table: {
            columns: ['Capability', 'Current', 'Target', 'Gap', 'Recommended Action'],
            rows: [
                ['AI workflow fluency', '57%', '80%', '23 pts', 'Create manager labs and playbooks'],
                ['Data storytelling', '61%', '78%', '17 pts', 'Pair academy with live dashboards'],
                ['Manager coaching', '73%', '85%', '12 pts', 'Expand certification cohort'],
                ['Enterprise compliance', '88%', '92%', '4 pts', 'Refresher micro-learning'],
            ],
        },
    },
    workforce: {
        eyebrow: 'Business Intelligence',
        title: 'Workforce Insights',
        description: 'Bring planning, capacity, and organizational health into one operating view so leaders can understand how people investments affect business outcomes.',
        spotlight: [
            { label: 'Headcount Plan', value: '92% staffed vs annual plan' },
            { label: 'Manager Span', value: '7.6 average direct reports' },
            { label: 'Org Health', value: 'Stable with hiring pressure in product' },
        ],
        metrics: [
            metric('Headcount Utilization', '92%', Users, 'indigo', '+3 pts', 'up', 'Backfill execution is keeping pace with annual plan.'),
            metric('Manager Effectiveness', '81%', Gauge, 'emerald', '+4 pts', 'up', 'Training is narrowing variance between teams.'),
            metric('Open Hiring Load', '27 roles', BriefcaseBusiness, 'amber', '+5', 'up', 'Product and data roles represent most of the load.'),
            metric('Capacity Pressure', '14 teams', ShieldAlert, 'rose', '-2', 'down', 'Pressure is easing as new hires complete ramp.'),
        ],
        drivers: [
            { label: 'Hiring plan progress', value: 92, tone: gradient.blue },
            { label: 'Bench strength', value: 69, tone: gradient.amber },
            { label: 'Manager capacity', value: 81, tone: gradient.green },
            { label: 'Org complexity', value: 46, tone: gradient.rose },
        ],
        insights: [
            { title: 'Product hiring remains the main leverage point', body: 'Several roadmap initiatives depend on closing a small number of senior product and analytics roles.', tag: 'Planning' },
            { title: 'Manager span is healthy overall but uneven', body: 'Averages look fine, though a few frontline leaders still carry unusually wide teams.', tag: 'Variance' },
            { title: 'Bench depth is improving more slowly than hiring pace', body: 'Succession coverage has not yet caught up with the speed of team expansion in core functions.', tag: 'Strategic risk' },
        ],
        table: {
            columns: ['Function', 'Headcount', 'Plan Attainment', 'Capacity', 'Outlook'],
            rows: [
                ['Engineering', '214', '96%', 'Healthy', 'Maintain pace'],
                ['Product', '48', '84%', 'Tight', 'Prioritize senior hiring'],
                ['Sales', '126', '93%', 'Healthy', 'Watch manager span'],
                ['Operations', '71', '88%', 'Mixed', 'Rebalance workloads'],
            ],
        },
    },
    notifications: {
        eyebrow: 'Action Layer',
        title: 'Notifications Center',
        description: 'Prioritize nudges, alerts, and escalations so HR and managers can act quickly without drowning in operational noise.',
        spotlight: [
            { label: 'Unread Alerts', value: '42 in priority queues' },
            { label: 'Auto-Routed', value: '71% to correct owner' },
            { label: 'SLA Breaches', value: '4 needing follow-up' },
        ],
        metrics: [
            metric('Priority Alerts Resolved', '88%', Bell, 'emerald', '+10%', 'up', 'Routing rules are improving follow-through across managers.'),
            metric('Escalations Pending', '4', ShieldAlert, 'rose', '-3', 'down', 'Pending items are concentrated in leave and review workflows.'),
            metric('Average Triage Time', '1.7 hrs', Gauge, 'indigo', '-22 min', 'down', 'Teams are acting on alerts faster week over week.'),
            metric('Notification Fatigue Score', '18%', MessageSquareText, 'amber', '-5 pts', 'down', 'Bundle settings are reducing low-value noise.'),
        ],
        drivers: [
            { label: 'Review reminders', value: 84, tone: gradient.blue },
            { label: 'Leave approvals', value: 67, tone: gradient.amber },
            { label: 'Attrition watch alerts', value: 52, tone: gradient.rose },
            { label: 'Recognition nudges', value: 41, tone: gradient.green },
        ],
        insights: [
            { title: 'Reminder bundles are working', body: 'Combining low-priority nudges into digest views is lowering fatigue without hurting completion.', tag: 'Efficiency' },
            { title: 'Attrition alerts need better explanation', body: 'Managers are slower to act when the trigger lacks context or recommended next steps.', tag: 'UX' },
            { title: 'Leave approvals still spike on Mondays', body: 'Reassigning fallback approvers for absences would smooth out the weekly queue backlog.', tag: 'Workflow' },
        ],
        table: {
            columns: ['Queue', 'Volume', 'Resolved', 'SLA', 'Owner'],
            rows: [
                ['Performance reminders', '18', '94%', 'On track', 'HR Ops'],
                ['Leave approvals', '37', '81%', 'At risk', 'People Services'],
                ['Attrition watch', '9', '78%', 'On track', 'HRBP'],
                ['Recognition prompts', '54', '92%', 'On track', 'Culture Team'],
            ],
        },
    },
    reports: {
        eyebrow: 'Executive Reporting',
        title: 'Reports and Storytelling',
        description: 'Package operational data into board-ready narratives with dependable KPIs, reusable segments, and clear next-step recommendations.',
        spotlight: [
            { label: 'Monthly Pack', value: 'Ready for exec review' },
            { label: 'Automated Sections', value: '9 of 12 generated' },
            { label: 'Decision Topics', value: 'Hiring mix, retention, manager load' },
        ],
        metrics: [
            metric('Report Freshness', '99%', ChartColumn, 'emerald', '+1 pt', 'up', 'Most executive metrics are now refreshed daily.'),
            metric('Board Narrative Coverage', '83%', BookOpen, 'indigo', '+7 pts', 'up', 'Narrative quality improved after standardizing prompts.'),
            metric('Manual Prep Time', '3.4 hrs', Gauge, 'amber', '-1.2 hrs', 'down', 'Automation is reclaiming analyst time before reviews.'),
            metric('Decision Readiness', '89%', Sparkles, 'rose', '+5 pts', 'up', 'Reports increasingly include clear recommendations, not just numbers.'),
        ],
        drivers: [
            { label: 'Retention story', value: 91, tone: gradient.blue },
            { label: 'Manager effectiveness', value: 83, tone: gradient.green },
            { label: 'Hiring velocity', value: 74, tone: gradient.amber },
            { label: 'Skills readiness', value: 68, tone: gradient.rose },
        ],
        insights: [
            { title: 'Reports are strongest when they include action paths', body: 'Executives move faster on people decisions when each KPI is paired with a concrete recommendation.', tag: 'Decision support' },
            { title: 'Manual wrangling is now isolated to a few sources', body: 'The remaining prep burden comes mostly from one recruiting feed and a late-stage payroll export.', tag: 'Automation' },
            { title: 'Skill readiness deserves more executive airtime', body: 'Current reports cover retention and hiring well, but capability risk is still underrepresented.', tag: 'Gap' },
        ],
        table: {
            columns: ['Report', 'Audience', 'Refresh', 'Confidence', 'Next Step'],
            rows: [
                ['Executive monthly pack', 'ELT', 'Daily', 'High', 'Approve hiring shifts'],
                ['Board people appendix', 'Board', 'Monthly', 'High', 'Add skill readiness page'],
                ['Manager health digest', 'VPs', 'Weekly', 'Medium', 'Standardize commentary'],
                ['Attrition intervention report', 'HRBPs', 'Twice weekly', 'High', 'Expand save-plan tracking'],
            ],
        },
    },
}
