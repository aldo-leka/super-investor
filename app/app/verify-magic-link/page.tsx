'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

function VerifyMagicLinkContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const hasAttemptedVerification = useRef(false);

  useEffect(() => {
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-magic-link/${token}`);
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