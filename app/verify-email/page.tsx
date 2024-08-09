'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyEmail() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      fetch(`/api/verify-email?token=${token}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setStatus('error');
          } else {
            setStatus('success');
          }
        })
        .catch(() => setStatus('error'));
    } else {
      setStatus('error');
    }
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {status === 'loading' && <p>Verifying your email...</p>}
        {status === 'success' && (
          <>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Email Verified Successfully
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Your email has been verified. You can now log in to your account.
            </p>
            <div className="mt-5">
              <Link href="/login" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Go to Login
              </Link>
            </div>
          </>
        )}
        {status === 'error' && (
          <>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Verification Failed
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              There was an error verifying your email. The link may be invalid or expired.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
