import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Building2, MailCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { authService } from '../../services/authService'
import { getApiErrorMessage } from '../../services/api'

const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams()
    const token = useMemo(() => searchParams.get('token') ?? '', [searchParams])
    const email = useMemo(() => searchParams.get('email') ?? '', [searchParams])
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [isResending, setIsResending] = useState(false)

    useEffect(() => {
        let isMounted = true

        const verify = async () => {
            if (!token) {
                setStatus('error')
                return
            }

            try {
                const response = await authService.verifyEmail(token)
                if (isMounted) {
                    setStatus('success')
                }
                toast.success(response.data.message)
            } catch (error) {
                if (isMounted) {
                    setStatus('error')
                }
                toast.error(getApiErrorMessage(error, 'Unable to verify email'))
            }
        }

        verify()

        return () => {
            isMounted = false
        }
    }, [token])

    const handleResend = async () => {
        if (!email) {
            toast.error('No email address was provided for resending verification')
            return
        }

        setIsResending(true)
        try {
            const response = await authService.resendVerification(email)
            toast.success(response.data.message)
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Unable to resend verification email'))
        } finally {
            setIsResending(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0B1120] via-[#111827] to-[#1E1B4B] p-6">
            <Card className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl">
                <CardContent className="p-8 text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="rounded-2xl bg-violet-600 p-3 text-white">
                            <Building2 size={24} />
                        </div>
                    </div>

                    <MailCheck size={34} className="mx-auto mb-4 text-violet-600" />

                    {status === 'loading' && (
                        <>
                            <h1 className="text-2xl font-bold text-slate-900">Verifying Email</h1>
                            <p className="mt-2 text-sm text-slate-500">We’re validating your verification link now.</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <h1 className="text-2xl font-bold text-slate-900">Email Verified</h1>
                            <p className="mt-2 text-sm text-slate-500">Your account email has been successfully verified.</p>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <h1 className="text-2xl font-bold text-slate-900">Verification Failed</h1>
                            <p className="mt-2 text-sm text-slate-500">
                                This verification link is invalid or has expired.
                            </p>
                            {email && (
                                <Button
                                    type="button"
                                    disabled={isResending}
                                    onClick={handleResend}
                                    className="mt-6 h-11 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 px-5 text-white hover:from-violet-700 hover:to-purple-800"
                                >
                                    {isResending ? 'Sending...' : 'Resend verification'}
                                </Button>
                            )}
                        </>
                    )}

                    <p className="mt-6 text-sm text-slate-500">
                        <Link to="/login" className="font-medium text-violet-600 hover:text-violet-700">
                            Continue to login
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

export default VerifyEmailPage
