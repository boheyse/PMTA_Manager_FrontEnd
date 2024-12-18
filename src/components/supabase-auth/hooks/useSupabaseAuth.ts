import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../../../services/auth';
import type { LoginFormData, RegisterFormData, ResetPasswordFormData } from '../types/auth';

export const useSupabaseAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const login = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      await authService.login({
        email: data.email,
        password: data.password,
      });
      toast.success('Successfully logged in!');
      navigate('/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to login');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      const response = await authService.register({
        email: data.email,
        password: data.password,
        username: data.username,
      });
      toast.success(response.message);
      navigate('/login');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to register');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      await authService.resetPassword(email);
      toast.success('Password reset instructions have been sent to your email');
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send reset email');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (data: ResetPasswordFormData) => {
    try {
      setIsLoading(true);
      await authService.updatePassword(data.password);
      toast.success('Password has been updated successfully');
      navigate('/login');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update password');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      toast.success('Successfully logged out');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    login,
    register,
    resetPassword,
    updatePassword,
    logout,
  };
};