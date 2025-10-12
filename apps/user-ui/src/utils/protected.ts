import { CustomAxiosRequestConfig } from "./axiosinstance.types";

export const isProtected: CustomAxiosRequestConfig = {
  requireAuth: true,
};
