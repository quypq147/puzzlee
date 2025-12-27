import { apiClient } from "@/lib/api-client";

export const authApi = {
  login: (data: { email: string; password: string }) => 
    apiClient.post('/auth/login', data),
    
  register: (data: { email: string; username: string; password: string; fullName: string }) => 
    apiClient.post('/auth/register', data),
    
  getProfile: () => 
    apiClient.get('/users/profile'),
    
  updateProfile: (data: { fullName?: string; avatarUrl?: string }) => 
    apiClient.patch('/users/profile', data), //
};