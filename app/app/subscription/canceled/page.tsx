'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SubscriptionCanceledPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to pricing page after 5 seconds
    const timer = setTimeout(() => {
      router.push('/pricing');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-auto p-8 text-center">
        <div className="mb-8">
          <XCircle className="w-16 h-16 text-red-500 mx-auto" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Subscription Canceled</h1>
        <p className="text-muted-foreground mb-8">
          Your subscription process was canceled. You'll be redirected to our pricing page in a few seconds.
        </p>
        <Button onClick={() => router.push('/pricing')}>
          View Plans
        </Button>
      </div>
    </div>
  );
} 