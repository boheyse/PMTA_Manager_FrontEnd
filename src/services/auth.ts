import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';
import type { AuthError } from '@supabase/supabase-js';

interface SignUpData {
  email: string;
  password: string;
  accessCode: string;
}

export const authService = {
  async validateAccessCode(accessCode: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('access_codes')
        .select('*')
        .eq('code', accessCode)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Access code validation failed:', error);
      return false;
    }
  },

  async signUp({ email, password, accessCode }: SignUpData) {
    try {
      const isValidCode = await this.validateAccessCode(accessCode);
      if (!isValidCode) {
        throw new Error('Invalid or inactive access code');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      await supabase
        .from('access_codes')
        .update({ is_active: false, used_by: email, used_at: new Date().toISOString() })
        .eq('code', accessCode);

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as AuthError };
    }
  },

  login: async (credentials: { email: string; password: string }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      return {
        token: data.session?.access_token,
        refreshToken: data.session?.refresh_token,
        user: {
          id: data.user?.id,
          email: data.user?.email,
          username: data.user?.user_metadata?.username,
        },
      };
    } catch (error) {
      const authError = error as AuthError;
      console.error('Login error:', authError);
      throw new Error(authError.message);
    }
  },

  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      const authError = error as AuthError;
      console.error('Logout error:', authError);
      toast.error('Failed to logout');
      throw error;
    }
  },

  resetPassword: async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
    } catch (error) {
      const authError = error as AuthError;
      console.error('Reset password error:', authError);
      throw new Error(authError.message);
    }
  },

  updatePassword: async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
    } catch (error) {
      const authError = error as AuthError;
      console.error('Update password error:', authError);
      throw new Error(authError.message);
    }
  },

  verifyEmail: async (token: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email',
      });

      if (error) throw error;
    } catch (error) {
      const authError = error as AuthError;
      console.error('Email verification error:', authError);
      throw new Error(authError.message);
    }
  },
};