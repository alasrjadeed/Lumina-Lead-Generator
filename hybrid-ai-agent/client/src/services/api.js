import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("lmina-auth");
    if (token) {
      try {
        const parsed = JSON.parse(token);
        if (parsed?.state?.token) {
          config.headers.Authorization = `Bearer ${parsed.state.token}`;
        }
      } catch {
        // ignore parse errors
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data?.data !== undefined ? response.data.data : response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("lmina-auth");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const get = (url, config) => api.get(url, config);
export const post = (url, data, config) => api.post(url, data, config);
export const put = (url, data, config) => api.put(url, data, config);
export const del = (url, config) => api.delete(url, config);

export default api;
