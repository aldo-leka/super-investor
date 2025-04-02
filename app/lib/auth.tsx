import { createContext, useContext, useEffect, useState, useCallback } from 'react';

// Constants
const ACCESS_TOKEN_EXPIRE_MINUTES = 30; // Should match backend config

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
  logout: () => Promise<void>;
  register: (username: string, firstName: string, lastName: string, email: string, password: string, turnstileToken: string) => Promise<string>;
  requestMagicLink: (email: string, turnstileToken: string) => Promise<void>;
  updateProfile: (data: { first_name?: string; last_name?: string; username?: string }) => Promise<void>;
  setSession: (session: { accessToken: string; user: User }) => void;
  refreshAccessToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Store access token in memory
let memoryAccessToken: string | null = null;

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
  refreshAccessToken: () => Promise<boolean>
): Promise<Response> {
  // Add Authorization header if we have an access token
  const headers = {
    ...options.headers,
    ...(memoryAccessToken ? { 'Authorization': `Bearer ${memoryAccessToken}` } : {})
  };

  // Make the initial request
  let response = await fetch(url, { ...options, headers });

  // If we get a 401 and have a refresh token, try to refresh
  if (response.status === 401 && memoryAccessToken) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Retry the original request with the new access token
      const newHeaders = {
        ...options.headers,
        'Authorization': `Bearer ${memoryAccessToken}`
      };
      response = await fetch(url, { ...options, headers: newHeaders });
    }
  }

  return response;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    loading: true,
    error: null,
  });

  const refreshAccessToken = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // Important for sending cookies
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      memoryAccessToken = data.access_token;
      setState(prev => ({
        ...prev,
        accessToken: data.access_token,
        user: data.user,
        error: null,
      }));
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      setState(prev => ({
        ...prev,
        user: null,
        accessToken: null,
        error: 'Session expired. Please log in again.',
      }));
      return false;
    }
  }, []);

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/session`, {
          credentials: 'include', // Important for sending cookies
          headers: memoryAccessToken ? {
            'Authorization': `Bearer ${memoryAccessToken}`
          } : {}
        });

        if (!response.ok) {
          // Try to refresh the token if session check fails
          const refreshed = await refreshAccessToken();
          if (!refreshed) {
            setState(prev => ({ ...prev, loading: false }));
            return;
          }
          // If refresh succeeded, we don't need to do anything else
          // because refreshAccessToken already updated the state
          setState(prev => ({ ...prev, loading: false }));
          return;
        }

        const data = await response.json();
        memoryAccessToken = data.access_token;
        setState({
          user: data.user,
          accessToken: data.access_token,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Session check failed:', error);
        // Try to refresh the token if session check fails with an error
        const refreshed = await refreshAccessToken();
        if (!refreshed) {
          setState(prev => ({ ...prev, loading: false }));
          return;
        }
        // If refresh succeeded, we don't need to do anything else
        // because refreshAccessToken already updated the state
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    checkSession();
  }, [refreshAccessToken]);

  const refreshInterval = Math.max((ACCESS_TOKEN_EXPIRE_MINUTES - 5) * 60 * 1000, 30_000); // min 30s

  // Add token refresh interval
  useEffect(() => {
    const interval = setInterval(async () => {
      if (state.accessToken) {
        await refreshAccessToken();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [state.accessToken, refreshAccessToken]);

  const login = async (email: string, password: string, turnstileToken: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Important for sending cookies
      body: JSON.stringify({ email, password, turnstile_token: turnstileToken }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('Login error:', errorData);
      throw new Error(errorData.detail || 'Login failed');
    }

    const data = await res.json();
    memoryAccessToken = data.access_token;
    setState({
      user: data.user,
      accessToken: data.access_token,
      loading: false,
      error: null,
    });
  };

  const loginWithGoogle = async (token: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Important for sending cookies
      body: JSON.stringify({ token }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('Google login error:', errorData);
      throw new Error(errorData.detail || 'Google login failed');
    }

    const data = await res.json();
    memoryAccessToken = data.access_token;
    setState({
      user: data.user,
      accessToken: data.access_token,
      loading: false,
      error: null,
    });
  };

  const logout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include', // Important for sending cookies
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      memoryAccessToken = null;
      setState({ user: null, accessToken: null, loading: false, error: null });
    }
  };

  const register = async (username: string, firstName: string, lastName: string, email: string, password: string, turnstileToken: string) => {
    try {
      const requestBody: any = {
        email,
        password,
        turnstile_token: turnstileToken
      };

      // Only include optional fields if they have values
      if (username?.trim()) requestBody.username = username;
      if (firstName?.trim()) requestBody.first_name = firstName;
      if (lastName?.trim()) requestBody.last_name = lastName;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important for sending cookies
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.detail) {
          throw new Error(data.detail);
        }
        throw new Error('Registration failed');
      }

      // Since registration no longer logs the user in automatically,
      // we'll just clear any existing state
      memoryAccessToken = null;
      setState({
        user: null,
        accessToken: null,
        loading: false,
        error: null,
      });

      // Return the success message from the backend
      return data.message;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const requestMagicLink = async (email: string, turnstileToken: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/magic-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Important for sending cookies
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
      credentials: 'include', // Important for sending cookies
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
    memoryAccessToken = session.accessToken;
    console.log('Setting session:', session);
    setState(prev => ({
      ...prev,
      user: session.user,
      accessToken: session.accessToken,
      loading: false,
      error: null,
    }));
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
    refreshAccessToken,
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
