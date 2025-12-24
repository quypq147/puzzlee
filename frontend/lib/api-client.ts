// frontend/lib/api-client.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

type FetchOptions = RequestInit & {
  headers?: Record<string, string>;
};

export async function apiClient<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  // Lấy token từ localStorage (được lưu lúc login)
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "API Error");
  }

  return response.json() as Promise<T>;
}