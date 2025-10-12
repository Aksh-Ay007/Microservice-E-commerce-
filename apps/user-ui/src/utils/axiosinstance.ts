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
    const orginalRequest = error.config;

    const is401 = error.response?.status === 401;
    const isRetry = orginalRequest?._retry;
    const isAuthRequired = orginalRequest?.requireAuth === true;

    if (!is401 && !isRetry && !isAuthRequired) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh(() => resolve(axiosInstance(orginalRequest)));
        });
      }
      orginalRequest._retry = true;
      isRefreshing = true;

       try {
         await axios.post(
           `${process.env.NEXT_PUBLIC_SERVER_URI}/api/refresh-token`,
           {},
           { withCredentials: true }
         );

         isRefreshing = false;
         onRefreshSuccess();

         return axiosInstance(orginalRequest);
       } catch (error) {
         isRefreshing = false;
         refreshSubscribers = [];
         handleLogout();
         return Promise.reject(error);
       }


    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
