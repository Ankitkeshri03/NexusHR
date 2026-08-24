import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Building2, LockKeyhole } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authService } from '../../services/authService'
import { getApiErrorMessage } from '../../services/api'

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const token = useMemo(() => searchParams.get('token') ?? '', [searchParams])
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!token) {
            toast.error('Reset token is missing')
            return
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters long')
            return
        }

        setIsSubmitting(true)

        try {
            const response = await authService.resetPassword(token, newPassword, confirmPassword)
            toast.success(response.data.message)
            navigate('/login', { replace: true })
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Unable to reset password'))
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0B1120] via-[#111827] to-[#1E1B4B] p-6">
            <Card className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl">
                <CardContent className="p-8">
                    <div className="mb-8 flex items-center gap-3">
                        <div className="rounded-2xl bg-violet-600 p-3 text-white">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Reset Password</h1>
                            <p className="text-sm text-slate-500">Choose a new password for your account</p>
                        </div>
                    </div>

                    {!token ? (
                        <div className="space-y-4">
                            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                This reset link is missing its token.
                            </div>
                            <Link to="/forgot-password" className="text-sm font-medium text-violet-600 hover:text-violet-700">
                                Request a new reset link
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label className="text-slate-700">New Password</Label>
                                <div className="relative">
                                    <LockKeyhole size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        type="password"
                                        value={newPassword}
                                        onChange={(event) => setNewPassword(event.target.value)}
                                        className="h-12 rounded-xl border-slate-200 pl-10 focus-visible:ring-violet-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700">Confirm Password</Label>
                                <div className="relative">
                                    <LockKeyhole size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(event) => setConfirmPassword(event.target.value)}
                                        className="h-12 rounded-xl border-slate-200 pl-10 focus-visible:ring-violet-500"
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="h-12 w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 text-base font-semibold text-white shadow-lg hover:from-violet-700 hover:to-purple-800"
                            >
                                {isSubmitting ? 'Please wait...' : 'Reset Password'}
                            </Button>
                        </form>
                    )}

                    <p className="mt-6 text-center text-sm text-slate-500">
                        <Link to="/login" className="font-medium text-violet-600 hover:text-violet-700">
                            Back to login
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

export default ResetPasswordPage
