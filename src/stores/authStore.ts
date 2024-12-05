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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      login: (token, refreshToken) => {
        try {
          // Add these console logs
          console.log('Setting tokens:', { token, refreshToken });
          
          Cookies.set('auth_token', token, { 
            secure: false,
            sameSite: 'lax',
            path: '/',
            expires: 7
          });
          
          // Verify cookie was set
          const storedToken = Cookies.get('auth_token');
          console.log('Stored token:', storedToken);

          Cookies.set('refresh_token', refreshToken, {
            secure: false,
            sameSite: 'lax',
            path: '/',
            expires: 30
          });

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
          console.error('Error decoding token:', error);
          // Clear any invalid state
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