/**
 * Torbit Realty - Enterprise API & Environment Configuration
 * 
 * Automatically resolves the Backend API & Server URL based on current runtime:
 * 1. Local Development -> Reads from .env.local (e.g. http://localhost:5000/api)
 * 2. Production Deployment -> Reads from .env.production (e.g. https://api.torbitrealty.com/api)
 */

export const getApiBaseUrl = (): string => {
  // 1. If explicit environment variable is set
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }

  // 2. Client-side browser execution (relative path proxied by Next.js rewrites)
  if (typeof window !== 'undefined') {
    return '/api';
  }

  // 3. Server-side rendering execution
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_BACKEND_URL 
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL.replace(/\/$/, '')}/api`
      : 'https://api.torbitrealty.com/api';
  }

  return 'http://localhost:5000/api';
};

export const getBackendBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL.replace(/\/$/, '');
  }

  if (process.env.NODE_ENV === 'production') {
    return 'https://api.torbitrealty.com';
  }

  return 'http://localhost:5000';
};

export const API_BASE_URL = getApiBaseUrl();
export const BACKEND_BASE_URL = getBackendBaseUrl();
