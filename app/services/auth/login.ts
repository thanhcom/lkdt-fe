import { DataUser } from "@/types/dataUser";
import axiosClient from "@/lib/axios"; // Import "đệ" của bạn vào đây

export interface LoginPayload {
  username: string;
  password: string;
  remember?: boolean;
}

export interface LoginResponse {
  token: string;
  refresh_token: string;
  user?: DataUser;
  message?: string;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { remember, ...sendPayload } = payload;

  try {
    // Dùng axiosClient thay cho fetch
    const res = await axiosClient.post("/auth/login", sendPayload);

    // Axios tự động parse JSON rồi, bạn chỉ cần lấy res.data
    // Lưu ý: Cấu trúc trả về của bạn là data.data nên mình lấy đúng như vậy
    return res.data.data;
  } catch (error: any) {
    // Axios quăng lỗi vào đây nếu status code không phải 2xx
    const message = error.response?.data?.Messenger || error.response?.data?.message || "Đăng nhập thất bại";
    throw new Error(message);
  }
}

// Thêm hàm này để dùng trong AuthGuard cho đồng bộ
export async function checkToken() {
  const res = await axiosClient.post("/auth/check_token");
  return res.data;
}