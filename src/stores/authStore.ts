import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  email: string;
  username: string;
  isAdmin?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  login: (token: string, refreshToken: string) => void;
  logout: () => void;
}

// Admin user credentials
export const ADMIN_CREDENTIALS = {
  email: 't@test.com',
  password: 'test123!'
};

// Cookie configurations for different environments
const cookieConfig = {
  development: {
    auth: {
      secure: false,
      sameSite: 'lax' as const,
      path: '/',
      expires: 7
    },
    refresh: {
      secure: false,
      sameSite: 'lax' as const,
      path: '/',
      expires: 30
    }
  },
  production: {
    auth: {
      secure: true,
      sameSite: 'strict' as const,
      expires: 7
    },
    refresh: {
      secure: true,
      sameSite: 'strict' as const,
      expires: 30
    }
  }
};

// Helper to get current environment
const getEnvironment = () => {
  // You can modify this logic based on your needs
  return import.meta.env.DEV ? 'development' : 'production';
};

// Get cookie config based on environment
const getCookieConfig = (type: 'auth' | 'refresh') => {
  const env = getEnvironment();
  return cookieConfig[env][type];
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      login: (token, refreshToken) => {
        try {
          console.log(`Using ${getEnvironment()} environment config`);
          
          // Set auth token with environment-specific config
          Cookies.set('auth_token', token, getCookieConfig('auth'));
          console.log('Auth token set with config:', getCookieConfig('auth'));
          
          // Verify auth token
          const storedToken = Cookies.get('auth_token');
          console.log('Stored auth token:', storedToken);

          // Set refresh token with environment-specific config
          Cookies.set('refresh_token', refreshToken, getCookieConfig('refresh'));
          
          // For admin user, create a mock decoded token
          if (token === 'mock_admin_token') {
            const adminUser = {
              id: 'admin_id',
              email: ADMIN_CREDENTIALS.email,
              username: 'admin',
              isAdmin: true
            };
            set({ user: adminUser, isAuthenticated: true });
            return;
          }

          // Decode token and set user state
          const decoded = jwtDecode<User & { exp: number }>(token);
          set({ user: decoded, isAuthenticated: true });
        } catch (error) {
          console.error('Error in login:', error);
          Cookies.remove('auth_token');
          Cookies.remove('refresh_token');
          set({ user: null, isAuthenticated: false });
        }
      },
      logout: () => {
        Cookies.remove('auth_token');
        Cookies.remove('refresh_token');
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);

// Export environment helpers for debugging/testing
export const authStoreHelpers = {
  getEnvironment,
  getCookieConfig,
};