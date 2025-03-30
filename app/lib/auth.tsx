import { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface User {
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  image?: string;
  subscription_tier?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, turnstileToken: string) => Promise<void>;
  loginWithGoogle: (token: string) => Promise<void>;
  logout: () => void;
  register: (username: string, firstName: string, lastName: string, email: string, password: string, turnstileToken: string) => Promise<void>;
  requestMagicLink: (email: string, turnstileToken: string) => Promise<void>;
  updateProfile: (data: { first_name?: string; last_name?: string; username?: string }) => Promise<void>;
  setSession: (session: { accessToken: string; user: User }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Check localStorage for existing token on mount
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Validate the token and get user session
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/session`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(async (res) => {
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            console.error('Session validation failed:', {
              status: res.status,
              statusText: res.statusText,
              error: errorData
            });
            throw new Error(`Session validation failed: ${res.status} ${res.statusText}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log('Session validation response:', data); // Debug log
          
          // Check if we have a valid user object
          if (!data || typeof data !== 'object') {
            console.error('Invalid session response format:', data);
            throw new Error('Invalid session response format');
          }

          // Ensure we have the minimum required user data
          if (!data.user || !data.user.email || !data.user.username) {
            console.error('Missing required user data:', data.user);
            throw new Error('Missing required user data in session');
          }

          setState({
            user: {
              email: data.user.email,
              username: data.user.username,
              first_name: data.user.first_name,
              last_name: data.user.last_name,
              image: data.user.image || undefined,
              subscription_tier: data.user.subscription_tier || 'free'
            },
            accessToken: token,
            loading: false,
            error: null,
          });
        })
        .catch((error) => {
          console.error('Session validation error:', error);
          // Only remove the token if it's an authentication error
          if (error.message.includes('401') || error.message.includes('403')) {
            localStorage.removeItem('accessToken');
          }
          setState({ user: null, accessToken: null, loading: false, error: error.message });
        });
    } else {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  const login = async (email: string, password: string, turnstileToken: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, turnstile_token: turnstileToken }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('Login error:', errorData);
      throw new Error(errorData.detail || 'Login failed');
    }

    const data = await res.json();
    console.log('Login response:', data);  // Debug log

    if (!data.access_token) {
      console.error('No access token in response:', data);
      throw new Error('Invalid response format: missing access token');
    }

    if (!data.user) {
      console.error('No user data in response:', data);
      throw new Error('Invalid response format: missing user data');
    }

    const { email: userEmail, username, first_name, last_name, image: userImage, subscription_tier: userTier } = data.user;
    if (!userEmail || !username) {
      console.error('Missing required user fields:', data.user);
      throw new Error('Invalid user data format');
    }

    localStorage.setItem('accessToken', data.access_token);
    setState({
      user: {
        email: userEmail,
        username,
        first_name,
        last_name,
        image: userImage || undefined,
        subscription_tier: userTier || 'free'
      },
      accessToken: data.access_token,
      loading: false,
      error: null,
    });
  };

  const loginWithGoogle = async (token: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('Google login error:', errorData);
      throw new Error(errorData.detail || 'Google login failed');
    }

    const data = await res.json();
    console.log('Google login response:', data);  // Debug log

    if (!data.access_token) {
      console.error('No access token in response:', data);
      throw new Error('Invalid response format: missing access token');
    }

    if (!data.user) {
      console.error('No user data in response:', data);
      throw new Error('Invalid response format: missing user data');
    }

    localStorage.setItem('accessToken', data.access_token);

    setState({
      user: {
        email: data.user.email,
        username: data.user.username,
        first_name: data.user.first_name,
        last_name: data.user.last_name,
        image: data.user.image || undefined,
        subscription_tier: data.user.subscription_tier || 'free'
      },
      accessToken: data.access_token,
      loading: false,
      error: null,
    });
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setState({ user: null, accessToken: null, loading: false, error: null });
  };

  const register = async (username: string, firstName: string, lastName: string, email: string, password: string, turnstileToken: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          first_name: firstName,
          last_name: lastName,
          email,
          password,
          turnstile_token: turnstileToken
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.detail) {
          throw new Error(data.detail);
        }
        throw new Error('Registration failed');
      }

      localStorage.setItem('accessToken', data.access_token);
      setState({
        user: {
          email: data.email,
          username,
          first_name: data.first_name,
          last_name: data.last_name,
          image: data.profile_picture_url,
          subscription_tier: data.subscription_tier || 'free'
        },
        accessToken: data.access_token,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const requestMagicLink = async (email: string, turnstileToken: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/magic-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email,
        turnstile_token: turnstileToken
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to send magic link');
    }
  };

  const updateProfile = async (data: { first_name?: string; last_name?: string; username?: string }) => {
    if (!state.accessToken) {
      throw new Error('Not authenticated');
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.accessToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to update profile');
    }

    const updatedData = await res.json();
    setState(prev => ({
      ...prev,
      user: {
        ...prev.user!,
        ...updatedData,
      },
    }));
  };

  const setSession = useCallback((session: { accessToken: string; user: User }) => {
    setState(prev => ({
      ...prev,
      user: session.user,
      accessToken: session.accessToken,
      loading: false,
      error: null,
    }));
    localStorage.setItem('accessToken', session.accessToken);
  }, []);

  const value = {
    ...state,
    setSession,
    login,
    loginWithGoogle,
    logout,
    register,
    requestMagicLink,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
