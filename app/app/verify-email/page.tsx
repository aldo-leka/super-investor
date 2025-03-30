'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';

function VerifyEmailContent() {
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setSession } = useAuth();
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError('No verification token provided');
        setVerifying(false);
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email/${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || 'Verification failed');
        }

        // If verification was successful and we got user data, log them in
        if (data.access_token && data.user) {
          setSession({
            accessToken: data.access_token,
            user: {
              email: data.user.email,
              username: data.user.username,
              first_name: data.user.first_name,
              last_name: data.user.last_name,
              image: data.user.image,
              subscription_tier: data.user.subscription_tier
            }
          });
          toast.success('Email verified successfully!');
          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          // If no user data, redirect to login
          toast.success('Email verified successfully! Please log in.');
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Verification failed');
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [token, router, setSession]);

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Verifying your email...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <h1 className="text-2xl font-semibold">Verification Failed</h1>
          <p className="text-muted-foreground">{error}</p>
          <div className="space-y-2">
            <Button
              onClick={() => router.push('/login')}
              className="w-full"
            >
              Return to Login
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/register')}
              className="w-full"
            >
              Create New Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md mx-auto p-6">
        <h1 className="text-2xl font-semibold">Email Verified!</h1>
        <p className="text-muted-foreground">
          Your email has been verified successfully. Redirecting to dashboard...
        </p>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
} 