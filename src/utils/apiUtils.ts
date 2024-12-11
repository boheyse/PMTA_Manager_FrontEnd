import axios from 'axios';
import Cookies from 'js-cookie';

// const hostName = 'https://pmta-manager-backend-BoHeyse.replit.app';
const hostName = 'http://127.0.0.1:5000';

const getAuthHeader = () => {
  const token = Cookies.get('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const axiosGet = async <T = any>(url: string): Promise<T> => {
  try {
    const response = await axios.get(`${hostName}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    return response.data;
  } catch (error) {
    console.error('GET request failed:', error);
    throw error;
  }
};

export const axiosGetNoAuth = async <T = any>(url: string): Promise<T> => {
  try {
    const response = await axios.get(`${hostName}${url}`, {
      headers: {
        'Content-Type': 'application/json',
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
    const response = await axios.post(`${hostName}${url}`, data, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
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
    const response = await axios.put(`${hostName}${url}`, data, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
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
    const response = await axios.delete(`${hostName}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    return response.data;
  } catch (error) {
    console.error('DELETE request failed:', error);
    throw error;
  }
};