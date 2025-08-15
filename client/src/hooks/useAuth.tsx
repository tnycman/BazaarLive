import { useState, useEffect } from 'react';

interface AuthUser {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    // Simple auth check - assume user is authenticated for now
    // This is a temporary implementation to get the app working
    setTimeout(() => {
      setState({
        user: {
          id: 'temp-user',
          email: 'user@example.com',
          firstName: 'Test',
          lastName: 'User',
          username: 'testuser'
        },
        isAuthenticated: true,
        isLoading: false
      });
    }, 100);
  }, []);

  return state;
}