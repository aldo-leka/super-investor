'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth';
import { fetchWithAuth } from '@/lib/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import Header from '@/components/dashboard/Header';
import { useRouter } from 'next/navigation';

const profileSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
    .refine(val => !val.startsWith('_') && !val.startsWith('-'), 'Username cannot start with _ or -'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

export default function ProfilePage() {
  const { user, accessToken, refreshAccessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const router = useRouter();

  // Load profile data when component mounts or accessToken changes
  useEffect(() => {
    const loadProfileData = async () => {
      if (!accessToken) return;
      
      try {
        const response = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/profile`,
          {},
          refreshAccessToken
        );
        if (response.ok) {
          const data = await response.json();
          setUsername(data.username || '');
          setFirstName(data.first_name || '');
          setLastName(data.last_name || '');
          setEmail(data.email || '');
          setHasPassword(data.has_password);
        }
      } catch (error) {
        console.error('Failed to load profile data:', error);
      }
    };

    loadProfileData();
  }, [accessToken, refreshAccessToken]);

  // Update form fields when user data changes
  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const validateForm = () => {
    try {
      profileSchema.parse({
        username,
        firstName,
        lastName,
        email,
      });
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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/profile`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            first_name: firstName,
            last_name: lastName,
          }),
        },
        refreshAccessToken
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update profile');
      }

      const data = await response.json();
      
      // Update the user state with the new data
      setUsername(data.username);
      setFirstName(data.first_name || '');
      setLastName(data.last_name || '');

      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/password`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            hasPassword
              ? {
                  current_password: currentPassword,
                  new_password: newPassword,
                }
              : {
                  new_password: newPassword,
                }
          ),
        },
        refreshAccessToken
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update password');
      }

      toast.success(hasPassword ? 'Password updated successfully' : 'Password set successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setHasPassword(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                className="text-muted-foreground"
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>

            <div>
              <h1 className="text-3xl font-bold">Profile Settings</h1>
              <p className="text-muted-foreground">
                Manage your account settings and preferences
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your profile information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={user?.image} alt={user?.username || ''} />
                        <AvatarFallback>
                          {user?.first_name && user?.last_name
                            ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
                            : user?.username
                              ? user.username.slice(0, 2).toUpperCase()
                              : user?.email?.slice(0, 2).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                      {validationErrors.firstName && (
                        <p className="text-sm text-red-500">{validationErrors.firstName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                      {validationErrors.lastName && (
                        <p className="text-sm text-red-500">{validationErrors.lastName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                      {validationErrors.username && (
                        <p className="text-sm text-red-500">{validationErrors.username}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-sm text-muted-foreground">
                        Email cannot be changed
                      </p>
                    </div>

                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Profile'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{hasPassword ? 'Change Password' : 'Set Password'}</CardTitle>
                  <CardDescription>
                    {hasPassword 
                      ? 'Update your password'
                      : 'Set a password to enable email/password login'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    {hasPassword && (
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required={hasPassword}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">
                        {hasPassword ? 'New Password' : 'Password'}
                      </Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        {hasPassword ? 'Confirm New Password' : 'Confirm Password'}
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>

                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {hasPassword ? 'Updating...' : 'Setting...'}
                        </>
                      ) : (
                        hasPassword ? 'Update Password' : 'Set Password'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}