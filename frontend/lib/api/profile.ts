import { apiClient } from "@/lib/api-client";
import { UserProfile } from "@/hooks/use-auth";

export const updateProfile = async (data: { fullName?: string; avatarUrl?: string }) => {
  return apiClient<UserProfile>("/users/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};