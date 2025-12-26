import { apiClient } from "@/lib/api-client";
import { Organization } from '@/types/custom';

export const organizationApi = {
  // Lấy danh sách tổ chức của user
  getMyOrganizations: async (): Promise<Organization[]> => {
    const res = await apiClient.get('/organizations');
    return res.data;
  },

  // Tạo tổ chức mới
  createOrganization: async (data: { name: string; slug?: string }): Promise<Organization> => {
    const res = await apiClient.post('/organizations', data);
    return res.data;
  },
};