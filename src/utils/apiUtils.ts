// src/utils/apiUtils.ts
import axios from 'axios';
import Cookies from 'js-cookie';

const hostName = 'http://127.0.0.1:5000';

const getAuthHeader = () => {
  const token = Cookies.get('auth_token');
  console.log('Current auth token:', token);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const axiosGet = async (url: string) => {
  try {
    const response = await axios.get(`${hostName}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    return response.data;
  } catch (error) {
    console.error('GET request failed:', error);
    throw error;
  }
};

export const axiosGetNoAuth = async (url: string) => {
  try {
    const response = await axios.get(`${hostName}${url}`, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    console.error('GET request failed:', error);
    throw error;
  }
};

export const axiosPost = async (url: string, data: any) => {
  try {
    const response = await axios.post(`${hostName}${url}`, data, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
    });
    return response.data;
  } catch (error) {
    console.error('POST request failed:', error);
    throw error;
  }
};

export const fetchGet = async (url: string) => {
  try {
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...getAuthHeader()
    });

    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('GET request failed:', error);
    throw error;
  }
};

export const fetchPost = async (url: string, body: any) => {
  try {
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...getAuthHeader()
    });

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('POST request failed:', error);
    throw error;
  }
};