import axios from 'axios';

const BACKEND_URL = ''; // Default to empty string since frontend and backend are served from same origin

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  withCredentials: true // Extremely important to send httpOnly cookies
});

// Optionally, you can add an interceptor to handle 401 Unauthorized globally
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // You could trigger a logout event or clear state if needed
    }
    return Promise.reject(error);
  }
);

export default api;
