import { Outlet, useLocation } from 'react-router-dom'
import Slidebar from './Slidebar'
import Header from './Header'

const pageTitles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/people-intelligence': 'People Intelligence',
    '/performance-reviews': 'Performance Reviews',
    '/goals': 'Goals',
    '/feedback': 'Feedback',
    '/attrition': 'Attrition',
    '/skill-gap-analysis': 'Skill Gap Analysis',
    '/workforce-insights': 'Workforce Insights',
    '/notifications': 'Notifications',
    '/reports': 'Reports',
    '/employees': 'Employee Management',
    '/users': 'User Management',
    '/permissions': 'Permissions',
    '/designations': 'Designations',
    '/departments': 'Departments',
    '/attendance': 'Attendance',
    '/leave': 'Leave Management',
    '/payroll': 'Payroll',
    '/settings': 'Settings',
}

const MainLayout = () => {
    const location = useLocation()
    const title = pageTitles[location.pathname] || 'NexusHR'

    return (
        <div className="flex h-screen bg-slate-50">
            <Slidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title={title} />
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default MainLayout
