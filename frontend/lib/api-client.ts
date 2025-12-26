const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

type RequestOptions = RequestInit & {
  params?: Record<string, string>;
};

// Hàm helper để giả lập axios response
const handleResponse = async (res: Response) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw { response: { data, status: res.status } }; // Giả lập lỗi axios
  }
  return { data }; // Giả lập success axios
};

const getHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const apiClient = {
  get: async (url: string, options: RequestOptions = {}) => {
    const query = options.params ? `?${new URLSearchParams(options.params)}` : "";
    const res = await fetch(`${BASE_URL}${url}${query}`, {
      method: "GET",
      headers: { ...getHeaders(), ...options.headers },
      ...options,
    });
    return handleResponse(res);
  },

  post: async (url: string, body: any, options: RequestOptions = {}) => {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: "POST",
      headers: { ...getHeaders(), ...options.headers },
      body: JSON.stringify(body),
      ...options,
    });
    return handleResponse(res);
  },

  put: async (url: string, body: any, options: RequestOptions = {}) => {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: "PUT",
      headers: { ...getHeaders(), ...options.headers },
      body: JSON.stringify(body),
      ...options,
    });
    return handleResponse(res);
  },

  patch: async (url: string, body: any, options: RequestOptions = {}) => {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: "PATCH",
      headers: { ...getHeaders(), ...options.headers },
      body: JSON.stringify(body),
      ...options,
    });
    return handleResponse(res);
  },

  delete: async (url: string, options: RequestOptions = {}) => {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: "DELETE",
      headers: { ...getHeaders(), ...options.headers },
      ...options,
    });
    return handleResponse(res);
  },
};

export default apiClient;