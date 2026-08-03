const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

let clerkTokenGetter = null;

export const setClerkTokenGetter = (fn) => {
  clerkTokenGetter = fn;
};

export const apiClient = async (endpoint, { body, isFormUrlEncoded = false, ...customConfig } = {}) => {
  let token = localStorage.getItem('questlife_token');
  
  if (clerkTokenGetter) {
    try {
      const clerkToken = await clerkTokenGetter();
      if (clerkToken) {
        token = clerkToken;
      }
    } catch (e) {
      console.warn('Could not retrieve Clerk token from getter:', e);
    }
  } else if (window.Clerk?.session) {
    try {
      const clerkToken = await window.Clerk.session.getToken();
      if (clerkToken) {
        token = clerkToken;
      }
    } catch (e) {
      console.warn('Could not retrieve Clerk token:', e);
    }
  }

  const headers = {
    ...(!isFormUrlEncoded && { 'Content-Type': 'application/json' }),
    ...(isFormUrlEncoded && { 'Content-Type': 'application/x-www-form-urlencoded' }),
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const config = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  if (body) {
    if (isFormUrlEncoded) {
      const params = new URLSearchParams();
      Object.keys(body).forEach(key => params.append(key, body[key]));
      config.body = params.toString();
    } else {
      config.body = JSON.stringify(body);
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401) {
        const refreshToken = localStorage.getItem('questlife_refresh_token');
        const isAuthEndpoint = endpoint === '/auth/login' || endpoint === '/auth/refresh';

        if (refreshToken && !isAuthEndpoint) {
          try {
            const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refresh_token: refreshToken }),
            });
            if (refreshRes.ok) {
              const refreshData = await refreshRes.json();
              if (refreshData.access_token) {
                localStorage.setItem('questlife_token', refreshData.access_token);
                if (refreshData.refresh_token) {
                  localStorage.setItem('questlife_refresh_token', refreshData.refresh_token);
                }
                const retryHeaders = {
                  ...config.headers,
                  Authorization: `Bearer ${refreshData.access_token}`,
                };
                const retryRes = await fetch(`${API_BASE_URL}${endpoint}`, {
                  ...config,
                  headers: retryHeaders,
                });
                if (retryRes.ok) {
                  return await retryRes.json().catch(() => ({}));
                }
              }
            }
          } catch (refreshErr) {
            console.warn('Token auto-refresh failed:', refreshErr);
          }
        }

        if (!isAuthEndpoint) {
          localStorage.removeItem('questlife_token');
          localStorage.removeItem('questlife_refresh_token');
          window.dispatchEvent(new Event('auth-error'));
        }
      }
      const errMsg = typeof data.detail === 'string' ? data.detail : (data.detail?.[0]?.msg || data.message || 'Something went wrong');
      throw new Error(errMsg);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    if (error.name === 'TypeError' || error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      throw new Error('Unable to connect to backend server. Please ensure the backend server is running on http://localhost:8000.');
    }
    throw error;
  }
};
