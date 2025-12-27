"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {apiClient} from "@/lib/api-client"; // Đảm bảo bạn đã có file này
import { User } from "@/types/custom";
import { authApi } from "@/lib/api/auth";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: { email: string; password: string; fullName: string }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 1. Khởi tạo: Check token & Load profile
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // Gọi API lấy thông tin user hiện tại
        const res = await apiClient.get("/users/profile");
        setUser(res.data);
      } catch (error) {
        console.error("Failed to fetch profile", error);
        // Token lỗi/hết hạn -> Xoá đi
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // 2. Login
  const login = async (payload: { email: string; password: string }) => {
  try {
    const res = await authApi.login(payload); // Gọi qua api wrapper
    const { token, user } = res.data;
    localStorage.setItem("token", token);
    setUser(user);
    router.push("/dashboard");
  } catch (error) {
    throw error;
  }
};

  // 3. Register
  const register = async (payload: { email: string; username: string; password: string; fullName: string }) => {
    try {
      await apiClient.post("/auth/register", payload);
      // Đăng ký thành công -> Chuyển sang login
      router.push("/login?registered=true");
    } catch (error) {
      throw error;
    }
  };

  // 4. Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("lastOrgId"); // Xoá config Org cũ
    setUser(null);
    router.push("/login");
  };

  // 5. Refresh Profile (Dùng khi update thông tin cá nhân)
  const refreshProfile = async () => {
    try {
      const res = await apiClient.get("/users/profile");
      setUser(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);