import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import type { Profile } from '@/types/database';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, metadata: SignUpMetadata) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

interface SignUpMetadata {
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  address?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    isLoading: true,
  });

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error.message);
      return null;
    }
    return data;
  }, []);

  const refreshProfile = useCallback(async (): Promise<void> => {
    if (!state.user) return;
    const profile = await fetchProfile(state.user.id);
    setState((prev) => ({ ...prev, profile }));
  }, [state.user, fetchProfile]);

  useEffect(() => {
    // Get initial session
    const initAuth = async (): Promise<void> => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const profile = await fetchProfile(session.user.id);

        // Check if user is active
        if (profile && !profile.is_active) {
          await supabase.auth.signOut();
          setState({ user: null, profile: null, session: null, isLoading: false });
          return;
        }

        setState({
          user: session.user,
          profile,
          session,
          isLoading: false,
        });
      } else {
        setState({ user: null, profile: null, session: null, isLoading: false });
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await fetchProfile(session.user.id);

          if (profile && !profile.is_active) {
            await supabase.auth.signOut();
            setState({ user: null, profile: null, session: null, isLoading: false });
            return;
          }

          setState({
            user: session.user,
            profile,
            session,
            isLoading: false,
          });
        } else if (event === 'SIGNED_OUT') {
          setState({ user: null, profile: null, session: null, isLoading: false });
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setState((prev) => ({ ...prev, session }));
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signUp = useCallback(async (
    email: string,
    password: string,
    metadata: SignUpMetadata
  ): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: metadata.first_name,
          last_name: metadata.last_name,
          date_of_birth: metadata.date_of_birth ?? null,
          address: metadata.address ?? null,
        },
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        return { error: 'Este email ya se encuentra registrado' };
      }
      return { error: error.message };
    }

    return { error: null };
  }, []);

  const signIn = useCallback(async (
    email: string,
    password: string
  ): Promise<{ error: string | null }> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        return { error: 'Debes confirmar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.' };
      }
      return { error: 'Email o contraseña incorrectos' };
    }

    // Check if user is active
    if (data.user) {
      const profile = await fetchProfile(data.user.id);
      if (profile && !profile.is_active) {
        await supabase.auth.signOut();
        return { error: 'Tu cuenta ha sido desactivada. Contacta al administrador.' };
      }
    }

    return { error: null };
  }, [fetchProfile]);

  const signOut = useCallback(async (): Promise<void> => {
    await supabase.auth.signOut();
    setState({ user: null, profile: null, session: null, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
