import axios from 'axios';
import { getCookie } from '../utils/cookieUtils';

const axiosInstance = axios.create({
  baseURL: '/api/v1',
  withCredentials: true, // needed for cookie-based CSRF and XSRF-TOKEN
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request interceptor ───────────────────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    // Attach JWT token if available
    const token = localStorage.getItem('docflow_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Attach CSRF token for state-changing requests
    const method = config.method?.toUpperCase();
    if (method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      const csrfToken = getCookie('XSRF-TOKEN');
      if (csrfToken) {
        config.headers['X-XSRF-TOKEN'] = csrfToken;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor ─────────────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state and redirect to login
      localStorage.removeItem('docflow_token');
      localStorage.removeItem('docflow_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Fetches the CSRF token from the public endpoint.
 * Must be called before any state-changing request (POST/PUT/DELETE).
 * The backend sets the XSRF-TOKEN cookie automatically.
 */
export async function fetchCsrfToken() {
  try {
    await axiosInstance.get('/csrf-token/public');
  } catch (err) {
    console.warn('Could not fetch CSRF token:', err.message);
  }
}

export default axiosInstance;
