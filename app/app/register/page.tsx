'use client';

import { useEffect, useState, Suspense } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Turnstile } from '@marsidev/react-turnstile';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGoogleInit } from '@/hooks/useGoogleInit';
import { z } from 'zod';

const registerSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
    .refine(val => !val.startsWith('_') && !val.startsWith('-'), 'Username cannot start with _ or -')
    .optional(),
  firstName: z.string().min(2, 'First name must be at least 2 characters').optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
});

function RegisterContent() {
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, loginWithGoogle, user } = useAuth();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const isGoogleLoaded = useGoogleInit();

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      router.replace(callbackUrl);
    }
  }, [user, loading, callbackUrl, router]);

  const validateForm = () => {
    try {
      const formData: any = {
        email,
        password,
      };

      // Only include optional fields if they have values
      if (username?.trim()) formData.username = username;
      if (firstName?.trim()) formData.firstName = firstName;
      if (lastName?.trim()) formData.lastName = lastName;

      registerSchema.parse(formData);
      setValidationErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            errors[err.path[0]] = err.message;
          }
        });
        setValidationErrors(errors);
      }
      return false;
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    if (!turnstileToken) {
      toast.error('Please complete the verification');
      return;
    }

    setLoading(true);
    try {
      await register(username, firstName, lastName, email, password, turnstileToken);
      toast.success('Account created successfully. Please check your email to verify your account.');
      // Reset Turnstile after successful registration
      setTurnstileKey(prev => prev + 1);
      setTurnstileToken('');
      // Redirect to login page after successful registration
      router.replace('/login?message=Please check your email to verify your account');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
      // Reset Turnstile on error
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
            toast.success('Account created successfully with Google');
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
          <h1 className="text-3xl font-semibold text-center mb-8">Sign Up</h1>

          <Tabs
            defaultValue="signup"
            className="w-full"
            onValueChange={(value) => {
              if (value === "signin") {
                router.push('/login');
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

            <TabsContent value="signup" className="space-y-6 mt-6">
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
                Sign up with Google
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

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="First Name (optional)"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-muted/50 border-0 focus-visible:ring-1"
                  />
                  {validationErrors.firstName && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.firstName}</p>
                  )}
                </div>

                <div>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Last Name (optional)"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-muted/50 border-0 focus-visible:ring-1"
                  />
                  {validationErrors.lastName && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.lastName}</p>
                  )}
                </div>

                <div>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Username (optional)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-muted/50 border-0 focus-visible:ring-1"
                  />
                  {validationErrors.username && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.username}</p>
                  )}
                </div>

                <div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="wb@berkshirehathaway.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-muted/50 border-0 focus-visible:ring-1"
                    required
                  />
                  {validationErrors.email && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.email}</p>
                  )}
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
                  {validationErrors.password && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.password}</p>
                  )}
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
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signin" />
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

export default function RegisterPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RegisterContent />
    </Suspense>
  );
}