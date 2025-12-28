import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động đính kèm Token vào mỗi request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Hoặc lấy từ cookie/session
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Xử lý lỗi chung (VD: Token hết hạn thì logout)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Logic logout: localStorage.removeItem('token'); window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);