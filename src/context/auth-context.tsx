'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { authClient } from '@/lib/auth-client';

export interface User {
  id: string; // Add this line to include the id field
  name?: string | null;
  username?: string | null;
  email: string;
  image?: string | null;
  role?: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSession = async () => {
    setIsLoading(true);
    try {
      const { data: session } = await authClient.getSession();
      setUser(session?.user || null);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch session'),
      );
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const signOut = async () => {
    try {
      await authClient.signOut();
      setUser(null);
    } catch (err) {
      throw err;
    }
  };

  const refreshSession = async () => {
    await fetchSession();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        signOut,
        refreshSession,
      }}
    >
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
