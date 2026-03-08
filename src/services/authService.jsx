import axios from 'axios';

const API_URL = 'https://phibook-1cwh.vercel.app/api/v1/auth';

// 1. Register User
export const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register/`, userData);
  if (response.data.token) {
    localStorage.setItem('phi_token', response.data.token);
  }
  return response.data;
};

// 2. Login User
export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/login/`, {
    email,
    password,
  });
  
  // Note: Check if your backend returns 'token' or 'access'
  if (response.data.token) {
    localStorage.setItem('phi_token', response.data.token);
  }
  return response.data;
};

// 3. Logout
export const logout = () => {
  localStorage.removeItem('phi_token');
  window.location.href = '/login';
};