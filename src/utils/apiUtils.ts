import axios from 'axios';
import { supabase } from '../lib/supabase';

const hostName = "https://moondiver.xyz";

const getAuthHeader = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
};


export const axiosGet = async <T = any>(url: string): Promise<T> => {
  try {
    const headers = await getAuthHeader();
    const response = await axios.get(`${hostName}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });
    return response.data;
  } catch (error) {
    console.error('GET request failed:', error);
    throw error;
  }
};

export const axiosPost = async <T = any>(url: string, data: any): Promise<T> => {
  try {
    const headers = await getAuthHeader();
    const response = await axios.post(`${hostName}${url}`, data, {
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });
    return response.data;
  } catch (error) {
    console.error('POST request failed:', error);
    throw error;
  }
};

export const axiosPut = async <T = any>(url: string, data: any): Promise<T> => {
  try {
    const headers = await getAuthHeader();
    const response = await axios.put(`${hostName}${url}`, data, {
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });
    return response.data;
  } catch (error) {
    console.error('PUT request failed:', error);
    throw error;
  }
};

export const axiosDelete = async <T = any>(url: string): Promise<T> => {
  try {
    const headers = await getAuthHeader();
    const response = await axios.delete(`${hostName}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });
    return response.data;
  } catch (error) {
    console.error('DELETE request failed:', error);
    throw error;
  }
};