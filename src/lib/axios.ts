import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { enqueueSnackbar } from 'notistack';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const API_VERSION = 'v1';

const API = axios.create({
  baseURL: `${API_URL}/api/${API_VERSION}`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
API.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add correlation ID for request tracking
    const correlationId = `admin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    config.headers['X-Correlation-Id'] = correlationId;

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        correlationId,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor
API.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  (error: AxiosError) => {
    // Extract error details
    const message = (error.response?.data as any)?.message || error.message;
    const statusCode = error.response?.status;

    // Handle authentication errors
    if (statusCode === 401) {
      const isTokenExpired = message.includes('token expired') || message.includes('jwt expired');
      
      if (isTokenExpired) {
        console.warn('[Auth] Token expired, redirecting to login');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/auth/login';
      } else {
        enqueueSnackbar(message || 'Authentication failed', { variant: 'error' });
      }
      
      return Promise.reject(error);
    }

    // Handle other errors
    if (statusCode === 403) {
      enqueueSnackbar('You do not have permission to perform this action', { variant: 'error' });
    } else if (statusCode === 404) {
      enqueueSnackbar('Resource not found', { variant: 'error' });
    } else if (statusCode === 429) {
      enqueueSnackbar('Too many requests. Please try again later.', { variant: 'error' });
    } else if (statusCode && statusCode >= 500) {
      enqueueSnackbar('Server error. Please try again later.', { variant: 'error' });
    } else {
      enqueueSnackbar(message || 'An error occurred', { variant: 'error' });
    }

    console.error('[API Error]', {
      url: error.config?.url,
      method: error.config?.method,
      status: statusCode,
      message,
    });

    return Promise.reject(error);
  }
);

// Helper function to check API health
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${API_URL}/health`);
    return response.data.status === 'ok';
  } catch {
    return false;
  }
};

export default API;