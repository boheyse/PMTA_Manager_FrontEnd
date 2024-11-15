// src/utils/apiUtils.ts
import axios from 'axios';

export const axiosGet = async (url: string) => {
  try {
    const response = await axios.get(url);
    return response.data; // Axios automatically parses JSON
  } catch (error) {
    console.error('GET request failed:', error);
    throw error;
  }
};

export const axiosPost = async (url: string, data: any) => {
  try {
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
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
      const response = await fetch(url);
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
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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