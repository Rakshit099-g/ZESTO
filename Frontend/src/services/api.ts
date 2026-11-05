import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const authService = import.meta.env.VITE_AUTH_SERVICE;
const restaurantService = import.meta.env.VITE_RESTAURANT_SERVICE;

// Refresh hamesha auth service se hota hai (chahe request kisi bhi service ko gayi ho).
// Ek time pe sirf ek refresh chalega, baaki requests usi ka wait karengi.
let refreshPromise: Promise<unknown> | null = null;

const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${authService}/api/auth/refresh`, {}, { withCredentials: true })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const createApi = (baseURL: string) => {
  const instance = axios.create({
    baseURL,
    withCredentials: true,
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryConfig | undefined;

      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        !originalRequest.url?.includes("/api/auth/login") &&
        !originalRequest.url?.includes("/api/auth/refresh")
      ) {
        originalRequest._retry = true;

        try {
          await refreshAccessToken();
          // Browser naya accessToken cookie khud bhejega, request usi instance se dobara
          return instance(originalRequest);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

export const authApi = createApi(authService);
export const restaurantApi = createApi(restaurantService);

