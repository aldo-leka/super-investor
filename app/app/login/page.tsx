'use client';

import { useEffect, useState, Suspense } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Turnstile } from '@marsidev/react-turnstile';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useGoogleInit } from '@/hooks/useGoogleInit';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loginWithGoogle, requestMagicLink, user } = useAuth();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const isGoogleLoaded = useGoogleInit();

  console.log('user', user);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      router.replace(callbackUrl);
    }
  }, [user, loading, callbackUrl, router]);

  const handleMagicLinkRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    if (!turnstileToken) {
      toast.error('Please complete the verification');
      return;
    }

    setLoading(true);
    try {
      await requestMagicLink(email, turnstileToken);
      toast.success('Magic link sent! Please check your email.');
      setEmail('');
      setTurnstileKey(prev => prev + 1);
      setTurnstileToken('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send magic link');
      setTurnstileKey(prev => prev + 1);
      setTurnstileToken('');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turnstileToken) {
      toast.error('Please complete the verification');
      return;
    }

    setLoading(true);
    try {
      await login(email, password, turnstileToken);
      toast.success('Logged in successfully');
      setTurnstileKey(prev => prev + 1);
      setTurnstileToken('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
      setTurnstileKey(prev => prev + 1);
      setTurnstileToken('');
    } finally {
      setLoading(false);
    }
  };

  // Initialize Google when script is loaded
  useEffect(() => {
    if (!isGoogleLoaded) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error('Google Client ID is not set');
      toast.error('Google Sign-In is not properly configured');
      return;
    }
  }, [isGoogleLoaded]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId) {
        toast.error('Google Sign-In is not properly configured');
        setLoading(false);
        return;
      }

      if (!isGoogleLoaded) {
        toast.error('Google Sign-In is not available yet');
        setLoading(false);
        return;
      }

      // Initialize Google Sign-In
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile',
        callback: async (response: { error?: string; access_token?: string }) => {
          if (response.error) {
            console.error('Google OAuth error:', response.error);
            toast.error('Google login failed');
            setLoading(false);
            return;
          }

          try {
            await loginWithGoogle(response.access_token!);
            toast.success('Logged in successfully with Google');
          } catch (error) {
            console.error('Google login error:', error);
            toast.error('Google login failed');
          } finally {
            setLoading(false);
          }
        },
      });

      // Request the token - this opens the account selection page
      client.requestAccessToken();
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Google login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="absolute left-4 top-4">
        <Button
          variant="ghost"
          className="text-muted-foreground"
          onClick={() => router.push('/')}
        >
          ← Home
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-[400px] px-4 py-8">
          <h1 className="text-3xl font-semibold text-center mb-8">Sign In</h1>

          <Tabs
            defaultValue="signin"
            className="w-full"
            onValueChange={(value) => {
              if (value === "signup") {
                router.push('/register');
              }
            }}
          >
            <TabsList className="grid w-full grid-cols-2 p-1 bg-muted rounded-xl h-12">
              <TabsTrigger
                value="signin"
                className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm h-10"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm h-10"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-6 mt-6">
              <Button
                variant="outline"
                className="w-full bg-muted/50 hover:bg-muted/70"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign in with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    OR
                  </span>
                </div>
              </div>

              {!showPasswordLogin ? (
                <form onSubmit={handleMagicLinkRequest} className="space-y-4">
                  <div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-muted/50 border-0 focus-visible:ring-1"
                      required
                    />
                  </div>

                  <div className="flex justify-center">
                    <Turnstile
                      key={turnstileKey}
                      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                      onSuccess={(token) => setTurnstileToken(token)}
                      onError={() => {
                        toast.error('Verification failed. Please try again.');
                        setTurnstileKey(prev => prev + 1);
                        setTurnstileToken('');
                      }}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Send Magic Link'}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setShowPasswordLogin(true)}
                      className="text-sm text-muted-foreground hover:underline"
                    >
                      Use Password
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-muted/50 border-0 focus-visible:ring-1"
                      required
                    />
                  </div>

                  <div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-muted/50 border-0 focus-visible:ring-1"
                      required
                    />
                  </div>

                  <div className="flex justify-center">
                    <Turnstile
                      key={turnstileKey}
                      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                      onSuccess={(token) => setTurnstileToken(token)}
                      onError={() => {
                        toast.error('Verification failed. Please try again.');
                        setTurnstileKey(prev => prev + 1);
                        setTurnstileToken('');
                      }}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>

                  <div className="text-center space-y-2">
                    <button
                      type="button"
                      onClick={() => setShowPasswordLogin(false)}
                      className="text-sm text-muted-foreground hover:underline"
                    >
                      Use Magic Link
                    </button>
                    <div>
                      <Link
                        href="/forgot-password"
                        className="text-sm text-muted-foreground hover:underline"
                      >
                        Forgot Password?
                      </Link>
                    </div>
                  </div>
                </form>
              )}
            </TabsContent>

            <TabsContent value="signup" />
          </Tabs>
        </div>
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

export default function LoginPage() {
  console.log('TURNSTILE:', process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
  console.log('GOOGLE:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LoginContent />
    </Suspense>
  );
}