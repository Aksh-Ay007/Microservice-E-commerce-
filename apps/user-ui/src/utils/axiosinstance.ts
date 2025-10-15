import axios from "axios";
import { runRedirectToLogin } from "./redirect";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URI,
  withCredentials: true,
});

let isRefreshing = false;

let refreshSubscribers: (() => void)[] = [];

const handleLogout = () => {
  const publicPaths = ["/login", "/signup", "/forgot-password"];
  const currentPath = window.location.pathname;
  if (!publicPaths.includes(currentPath)) {
    runRedirectToLogin();
  }
};

//handle adding a new token to queued request
const subscribeTokenRefresh = (callback: () => void) => {
  refreshSubscribers.push(callback);
};

//execute queued requests after refresh
const onRefreshSuccess = () => {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
};

//handle API requests

axiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

//handle expired token and refresh logic
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const is401 = error.response?.status === 401;
    const isRetry = originalRequest?._retry;
    const isAuthRequired = originalRequest?.requireAuth === true;

    // ✅ Trigger refresh if token expired and request required auth
    if (is401 && !isRetry && isAuthRequired) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh(() => resolve(axiosInstance(originalRequest)));
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/api/refresh-token`,
          {},
          { withCredentials: true }
        );

        isRefreshing = false;
        onRefreshSuccess();

        // ✅ Retry the original request with new token
        return axiosInstance(originalRequest);
      } catch (err) {
        isRefreshing = false;
        refreshSubscribers = [];
        handleLogout();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
