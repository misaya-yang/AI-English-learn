import { createContext, useContext, useEffect, useState } from 'react';
import { 
  type AuthUser,
  type UserProfile,
  getAuthSession,
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  getUserProfile,
  updateUserProfile,
  updateUserDisplayName,
  onAuthStateChange,
  validatePassword,
  validateEmail,
} from '@/lib/supabase-auth';

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string | null }>;
  register: (email: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string | null }>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  updateDisplayName: (displayName: string) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  validatePassword: (password: string) => { isValid: boolean; errors: string[]; strength: 'weak' | 'medium' | 'strong' };
  validateEmail: (email: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await getAuthSession();

        if (!session) {
          setUser(null);
          setProfile(null);
          return;
        }

        const currentUser = await getCurrentUser();
        setUser(currentUser);
        if (currentUser) {
          const userProfile = await getUserProfile(currentUser.id);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Subscribe to auth state changes
    const { data: { subscription } } = onAuthStateChange(async (user) => {
      setUser(user);
      if (user) {
        const userProfile = await getUserProfile(user.id);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string | null }> => {
    try {
      const { user, error } = await loginUser(email, password);
      
      if (error) {
        console.error('AuthContext: Login error:', error);
        return { success: false, error };
      }
      
      if (user) {
        setUser(user);
        // Profile will be fetched asynchronously, don't block login
        setProfile(null);
        return { success: true };
      }
      
      return { success: false, error: '登录失败，请稍后重试' };
    } catch (error: unknown) {
      console.error('AuthContext: Login exception:', error);
      return { success: false, error: getErrorMessage(error, '登录失败，请稍后重试') };
    }
  };

  const register = async (email: string, password: string, displayName: string): Promise<{ success: boolean; error?: string | null }> => {
    const { user, error } = await registerUser(email, password, displayName);
    if (user) {
      setUser(user);
      return { success: true };
    }
    return { success: false, error: error || null };
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setProfile(null);
  };

  const updateUserProfileFn = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!user) return false;
    const success = await updateUserProfile(user.id, updates);
    if (success) {
      const updatedProfile = await getUserProfile(user.id);
      setProfile(updatedProfile);
    }
    return success;
  };

  const updateDisplayName = async (displayName: string): Promise<boolean> => {
    if (!user) return false;
    const success = await updateUserDisplayName(user.id, displayName);
    if (success) {
      const updatedUser = await getCurrentUser();
      setUser(updatedUser);
    }
    return success;
  };

  const refreshProfile = async () => {
    if (user) {
      const userProfile = await getUserProfile(user.id);
      setProfile(userProfile);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUserProfile: updateUserProfileFn,
        updateDisplayName,
        refreshProfile,
        validatePassword,
        validateEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
