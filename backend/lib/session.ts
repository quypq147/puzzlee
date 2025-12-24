// src/lib/session.ts
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.SESSION_SECRET || "bi_mat_khong_bat_mi_123"; // Đặt chuỗi này vào .env nhé!
const key = new TextEncoder().encode(secretKey);

const COOKIE_NAME = "session_token";

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // Phiên đăng nhập tồn tại 7 ngày
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

// Hàm tạo session sau khi đăng nhập thành công
export async function createSession(userId: string, role: string) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 ngày
  const session = await encrypt({ userId, role, expires });

  // Lưu cookie
  (await cookies()).set(COOKIE_NAME, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires,
    sameSite: "lax",
    path: "/",
  });
}

// Hàm lấy thông tin user từ cookie hiện tại
export async function getSession() {
  const cookie = (await cookies()).get(COOKIE_NAME)?.value;
  if (!cookie) return null;
  return await decrypt(cookie);
}

// Hàm đăng xuất
export async function deleteSession() {
  (await cookies()).delete(COOKIE_NAME);
}