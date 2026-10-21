import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:9999";

export const AUTH_SESSION_EXPIRED_EVENT = "auth:session-expired";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthSubmission = ["/auth/login", "/auth/register"].includes(
      error.config?.url,
    );
    const isWrongOldPassword =
      error.config?.url === "/profile/password" &&
      error.response?.data?.code === "WRONG_OLD_PASSWORD";
    if (error.response?.status === 401 && !isAuthSubmission && !isWrongOldPassword) {
      window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
