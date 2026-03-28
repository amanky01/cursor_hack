import axiosInstance from '@/network/core/axiosInstance';

class AuthService {
  async login(email, password) {
    try {
      const response = await axiosInstance.post('/api/auth/login', { email, password });
      
      if (response.data.token) {
        // Store token in localStorage
        localStorage.setItem('token', response.data.token);
        // Store user info in localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error occurred' };
    }
  }

  async loginCounsellor(email, password) {
    try {
      const response = await axiosInstance.post('/api/auth/login/counsellor', { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error occurred' };
    }
  }

  async loginAdmin(email, password) {
    try {
      const response = await axiosInstance.post('/api/auth/login/admin', { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error occurred' };
    }
  }

  async register(userData) {
    try {
      const response = await axiosInstance.post('/api/auth/signUp', userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error occurred' };
    }
  }

  logout() {
    // Remove token and user from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Call the backend logout endpoint
    return axiosInstance.post('/api/auth/logout');
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isAuthenticated() {
    return !!this.getToken();
  }
}

export default new AuthService();
