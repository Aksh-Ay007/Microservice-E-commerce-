import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URI,
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers: ((token?: string) => void)[] = [];

const handleLogout = () => {
  // Clear any stored tokens/data
  if (typeof window !== "undefined") {
    // Clear cookies by setting them to expire
    document.cookie =
      "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "seller_access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "seller_refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    if (
      window.location.pathname !== "/login" &&
      window.location.pathname !== "/seller-login"
    ) {
      // Redirect based on current path or user type
      window.location.href = "/login";
    }
  }
};

const subscribeTokenRefresh = (callback: (token?: string) => void) => {
  refreshSubscribers.push(callback);
};

const onRefreshSuccess = (token?: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const onRefreshFailure = () => {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
};

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add any additional headers if needed
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with improved token refresh logic
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token) => {
            if (token) {
              resolve(axiosInstance(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/seller/api/refresh-token`,
          {},
          { withCredentials: true }
        );

        if (response.data.success) {
          isRefreshing = false;
          onRefreshSuccess("refreshed");
          return axiosInstance(originalRequest);
        } else {
          throw new Error("Refresh failed");
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        isRefreshing = false;
        onRefreshFailure();
        handleLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
