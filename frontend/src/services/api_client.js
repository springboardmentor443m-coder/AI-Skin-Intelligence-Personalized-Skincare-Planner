import axios from 'axios';

// All requests are proxied through /api/backend/* (see next.config.js rewrites)
// so the browser never needs to know the real backend host.
const apiClient = axios.create({
  baseURL: '/api/backend',
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let pendingQueue = [];

function resolveQueue(error, token = null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  pendingQueue = [];
}

// Attach the access token to every outgoing request
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('asi_access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh expired access tokens transparently, then retry the original call
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = window.localStorage.getItem('asi_refresh_token');
        const { data } = await axios.post('/api/backend/auth/refresh', { refresh_token: refreshToken });

        window.localStorage.setItem('asi_access_token', data.access_token);
        apiClient.defaults.headers.Authorization = `Bearer ${data.access_token}`;
        resolveQueue(null, data.access_token);

        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        resolveQueue(refreshError, null);
        window.localStorage.removeItem('asi_access_token');
        window.localStorage.removeItem('asi_refresh_token');
        if (typeof window !== 'undefined') window.location.href = '/';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
