import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '../context/AuthContext'
import ProtectedRoute from '../components/ProtectedRoute'
import LoginPage from '../Pages/auth/LoginPage'
import ForgotPasswordPage from '../Pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '../Pages/auth/ResetPasswordPage'
import VerifyEmailPage from '../Pages/auth/VerifyEmailPage'
import MainLayout from '../components/layout/MainLayout'
import DashboardPage from '../Pages/dashboard/DashboardPage'
import EmployeesPage from '../Pages/employees/EmployeesPage'
import DepartmentsPage from '../Pages/departments/DepartmentsPage'
import AttendancePage from '../Pages/attendance/AttendancePage'
import LeavePage from '../Pages/leave/LeavePage'
import PayrollPage from '../Pages/payroll/PayrollPage'
import SettingsPage from '../Pages/settings/SettingsPage'
import UsersPage from '../Pages/users/UsersPage'
import PermissionsPage from '../Pages/permissions/PermissionsPage'
import DesignationsPage from '../Pages/designations/DesignationsPage'
import PeopleOverviewPage from '../Pages/people/PeopleOverviewPage'
import PeopleDomainPage from '../Pages/people/PeopleDomainPage'

const queryClient = new QueryClient()

function AppRoutes() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <Toaster position="top-center" />
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Navigate to="/login" />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/reset-password" element={<ResetPasswordPage />} />
                        <Route path="/verify-email" element={<VerifyEmailPage />} />
                        <Route
                            element={
                                <ProtectedRoute>
                                    <MainLayout />
                                </ProtectedRoute>
                            }
                        >
                            <Route path="/dashboard" element={<DashboardPage />} />
                            <Route path="/people-intelligence" element={<PeopleOverviewPage />} />
                            <Route path="/performance-reviews" element={<PeopleDomainPage />} />
                            <Route path="/goals" element={<PeopleDomainPage />} />
                            <Route path="/feedback" element={<PeopleDomainPage />} />
                            <Route path="/attrition" element={<PeopleDomainPage />} />
                            <Route path="/skill-gap-analysis" element={<PeopleDomainPage />} />
                            <Route path="/workforce-insights" element={<PeopleDomainPage />} />
                            <Route path="/notifications" element={<PeopleDomainPage />} />
                            <Route path="/reports" element={<PeopleDomainPage />} />
                            <Route
                                path="/employees"
                                element={
                                    <ProtectedRoute allowedRoles={['ADMIN']}>
                                        <EmployeesPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/users"
                                element={
                                    <ProtectedRoute allowedRoles={['ADMIN']}>
                                        <UsersPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/permissions"
                                element={
                                    <ProtectedRoute allowedRoles={['ADMIN']}>
                                        <PermissionsPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/designations"
                                element={
                                    <ProtectedRoute allowedRoles={['ADMIN']}>
                                        <DesignationsPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/departments"
                                element={
                                    <ProtectedRoute allowedRoles={['ADMIN']}>
                                        <DepartmentsPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route path="/attendance" element={<AttendancePage />} />
                            <Route path="/leave" element={<LeavePage />} />
                            <Route
                                path="/payroll"
                                element={
                                    <ProtectedRoute allowedRoles={['ADMIN']}>
                                        <PayrollPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route path="/settings" element={<SettingsPage />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </QueryClientProvider>
    )
}

export default AppRoutes
