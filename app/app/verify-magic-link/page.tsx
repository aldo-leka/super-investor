'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Loader2, AlertTriangle } from 'lucide-react';

function VerifyMagicLinkContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setSession } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const hasAttemptedVerification = useRef(false);
    const [isGmailBrowser, setIsGmailBrowser] = useState(false);

    useEffect(() => {
        // Check if user is using Gmail's in-app browser
        const userAgent = navigator.userAgent || '';
        const isGmailWebview =
            /Gmail|Google.*(GSA|Mobile)/i.test(userAgent) ||
            ((navigator as any).standalone === false &&
                /iPhone|iPad|iPod/i.test(userAgent) &&
                !/Safari/.test(userAgent));

        if (isGmailWebview) {
            setIsGmailBrowser(true);
            return;
        }

        const verifyToken = async () => {
            const token = searchParams.get('token');
            if (!token) {
                setError('No verification token found');
                return;
            }

            // Prevent multiple verification attempts
            if (hasAttemptedVerification.current) return;
            hasAttemptedVerification.current = true;

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-magic-link/${token}`, {
                    method: 'GET',
                    credentials: 'include', // This is critical for setting the refresh_token cookie
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.detail || 'Failed to verify magic link');
                }

                // Set the session with the returned data
                setSession({
                    accessToken: data.access_token,
                    user: data.user
                });

                // Redirect to dashboard
                router.push('/dashboard');
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
                hasAttemptedVerification.current = false;
            }
        };

        verifyToken();
    }, [searchParams, router, setSession]);

    if (isGmailBrowser) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center p-4">
                <div className="w-full max-w-md space-y-4 text-center">
                    <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
                    <h1 className="text-2xl font-bold text-gray-900">Browser Warning</h1>
                    <p className="text-gray-600">
                        It looks like you're using Gmail's in-app browser. For security reasons, please open this link in Chrome or Safari instead.
                    </p>
                    <div className="space-y-2">
                        <button
                            onClick={() => {
                                const url = window.location.href;
                                window.open(url, '_blank');
                            }}
                            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        >
                            Open in Chrome/Safari
                        </button>
                        <button
                            onClick={() => router.push('/login')}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                        >
                            Return to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center p-4">
                <div className="w-full max-w-md space-y-4 text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Verification Failed</h1>
                    <p className="text-red-500">{error}</p>
                    <button
                        onClick={() => router.push('/login')}
                        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                        Return to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-4 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Verifying Magic Link</h1>
                <p className="text-gray-600">Please wait while we verify your login...</p>
            </div>
        </div>
    );
}

function LoadingFallback() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-4 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Loading</h1>
                <p className="text-gray-600">Please wait...</p>
            </div>
        </div>
    );
}

export default function VerifyMagicLinkPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <VerifyMagicLinkContent />
        </Suspense>
    );
} 