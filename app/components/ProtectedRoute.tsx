'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSubscription?: boolean;
}

export default function ProtectedRoute({
  children,
  requireSubscription = false,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login') {
        router.replace(`/login?callbackUrl=${encodeURIComponent(currentPath)}`);
      }
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!loading && user && requireSubscription && user.subscription_tier === 'free') {
      router.replace('/pricing');
    }
  }, [loading, user, router, requireSubscription]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!loading && (!user || (requireSubscription && user.subscription_tier === 'free'))) {
    return null;
  }

  return <>{children}</>;
}