import axios from "axios";

// Tạo instance với cấu hình cơ bản
const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://api-lkdt.thanhtrang.online",
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag để tránh việc gọi refresh token nhiều lần cùng lúc khi có nhiều request 401
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 1. Interceptor cho Request: Luôn đính kèm token mới nhất vào Header
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Interceptor cho Response: Xử lý lỗi 401 (Hết hạn token)
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi là 401 và không phải là lỗi từ chính request refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      if (isRefreshing) {
        // Nếu đang trong quá trình refresh, đưa các request tiếp theo vào hàng đợi
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        
        // Gọi API Refresh Token của bạn
        // Lưu ý: Dùng axios gốc (không dùng instance này) để tránh loop vô tận
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`, {
          refresh_token: refreshToken,
        });

        const { token, refresh_token } = response.data.data;

        // Lưu token mới vào storage
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refresh_token);

        // Cập nhật Authorization cho request hiện tại và các request đang chờ
        axiosClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        processQueue(null, token);

        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Nếu refresh cũng thất bại (hết hạn hoàn toàn) -> Logout
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;