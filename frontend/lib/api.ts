// frontend/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = {
  async get(endpoint: string, token?: string) {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    
    const res = await fetch(`${API_URL}${endpoint}`, { method: "GET", headers });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async post(endpoint: string, body: any, token?: string) {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    
    // Xử lý lỗi trả về từ backend
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Lỗi kết nối server");
    }
    return res.json();
  }
};