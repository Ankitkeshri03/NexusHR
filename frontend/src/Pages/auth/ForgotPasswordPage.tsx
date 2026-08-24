import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authService } from '../../services/authService'
import { getApiErrorMessage } from '../../services/api'

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsSubmitting(true)

        try {
            const response = await authService.forgotPassword(email)
            toast.success(response.data.message)
            setSubmitted(true)
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Unable to start password reset'))
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
                            <h1 className="text-2xl font-bold text-slate-900">Forgot Password</h1>
                            <p className="text-sm text-slate-500">Start a secure password reset</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label className="text-slate-700">Email Address</Label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder="Enter your account email"
                                    className="h-12 rounded-xl border-slate-200 pl-10 focus-visible:ring-violet-500"
                                    required
                                />
                            </div>
                        </div>

                        {submitted && (
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                                Reset instructions have been prepared for this account if it exists.
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-12 w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 text-base font-semibold text-white shadow-lg hover:from-violet-700 hover:to-purple-800"
                        >
                            {isSubmitting ? 'Please wait...' : 'Request Reset'}
                        </Button>
                    </form>

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

export default ForgotPasswordPage
