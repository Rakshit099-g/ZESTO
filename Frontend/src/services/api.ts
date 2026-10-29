import axios from "axios";


const authService = import.meta.env.VITE_AUTH_SERVICE;

const api = axios.create({
  baseURL: authService,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/api/auth/login") &&
      !originalRequest.url?.includes("/api/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        // Refresh request interceptor ko dobara trigger nahi karegi
        await axios.post(
          `${authService}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // Browser naye accessToken cookie ko automatically bhejega
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;