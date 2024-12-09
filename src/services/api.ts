import axios, { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { AuthError } from '../types/auth';
import { ADMIN_CREDENTIALS } from '../stores/authStore';

const BASE_URL = 'http://127.0.0.1:5000/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Mock authentication for admin user
const mockAdminAuth = (email: string, password: string) => {
  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    const token = 'mock_admin_token';
    const refreshToken = 'mock_admin_refresh_token';
    
    return {
      token,
      refreshToken,
      user: {
        id: 'admin_id',
        email: ADMIN_CREDENTIALS.email,
        username: 'admin',
        isAdmin: true
      }
    };
  }
  throw new Error('Invalid credentials');
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<AuthError>) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest?.headers['X-Retry']) {
      try {
        const refreshToken = Cookies.get('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { token } = response.data;
        Cookies.set('auth_token', token, { secure: true, sameSite: 'strict' });

        if (originalRequest) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          originalRequest.headers['X-Retry'] = 'true';
          return api(originalRequest);
        }
      } catch (refreshError) {
        Cookies.remove('auth_token');
        Cookies.remove('refresh_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  register: async (data: { username: string; email: string; password: string }) => {
    console.log('Sending registration request with:', data);
    try {
      const response = await axios.post(`${BASE_URL}/auth/register`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: false
      });
      console.log('Raw registration response:', response);
      
      // Check if the response indicates an error
      if (!response.data.success) {
        throw new Error(response.data.error || 'Registration failed');
      }
      
      return response.data;
    } catch (error) {
      console.error('Registration API error:', error);
      if (axios.isAxiosError(error)) {
        // Handle axios error response
        const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Registration failed';
        throw new Error(errorMessage);
      }
      // Handle other errors
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Registration failed');
    }
  },

  login: async (credentials: { username: string; password: string; rememberMe?: boolean }) => {
    try {
      // Check for admin credentials first
      if (credentials.username === ADMIN_CREDENTIALS.email) {
        if (credentials.password === ADMIN_CREDENTIALS.password) {
          return mockAdminAuth(credentials.username, credentials.password);
        }
        throw new Error('Invalid credentials');
      }
      
      // If not admin, proceed with regular API call
      const response = await api.post('/auth/login', {
        username: credentials.username,
        password: credentials.password
      });
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Login failed');
    }
  },

  logout: async () => {
    try {
      // await api.post('/auth/logout');
    } finally {
      Cookies.remove('auth_token');
      Cookies.remove('refresh_token');
    }
  }
};