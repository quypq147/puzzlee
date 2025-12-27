import { apiClient } from "@/lib/api-client";

export const eventApi = {
  create: (data: { title: string; organizationId: string; description?: string }) => 
    apiClient.post('/events', data),

  getByCode: (code: string) => 
    apiClient.get(`/events/code/${code}`),

  join: (code: string) => 
    apiClient.post('/events/join', { code }), //

  getMembers: (eventId: string) => 
    apiClient.get(`/events/${eventId}/members`),
};