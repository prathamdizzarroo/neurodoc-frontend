import axios from "../config/axios";
import { config } from "../config/config";
import api from './api';

const BASE_URL = `${config.API_URL}/api`;

export const userService = {
    async register(userData) {
      try {
        console.log('Making registration request to:', `${BASE_URL}/auth/register`);
        
        const { data } = await axios.post(`${BASE_URL}/auth/register`, userData);
        console.log('Registration response:', data);
  
        if (!data.success || !data.data || !data.data.token) {
          throw new Error('Invalid response format from server');
        }
  
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.data));
        return data.data;
      } catch (error) {
        console.error('Registration service error:', error);
        throw new Error(error.response?.data?.message || 'Registration failed');
      }
    },
  
    async login(credentials) {
      try {
        const response = await axios.post(`${BASE_URL}/auth/login`, credentials);
        const data = response.data;
        
        localStorage.setItem('user', JSON.stringify(data));
        return data;
      } catch (error) {
        console.error('Login service error:', error);
        throw new Error(error.response?.data?.message || 'Login failed');
      }
    },
  
    async logout() {
      try {
        await axios.post(`${BASE_URL}/auth/logout`);
        localStorage.removeItem('user');
      } catch (error) {
        console.error('Logout service error:', error);
        throw new Error(error.response?.data?.message || 'Logout failed');
      }
    },
  
    async getAllUsers(query = {}) {
      try {
        const response = await api.get('/users', { params: query });
        return {
          success: true,
          data: response.data.data,
          pagination: response.data.pagination
        };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to fetch users'
        };
      }
    },
  
    getCurrentUser() {
      try {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
      } catch (error) {
        console.error('Error getting current user:', error);
        return null;
      }
    },

    // Create a new user
    async createUser(userData) {
      try {
        const response = await api.post('/users', userData);
        return {
          success: true,
          data: response.data.data
        };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to create user'
        };
      }
    },

    // Get a single user by ID
    async getUser(id) {
      try {
        const response = await api.get(`/users/${id}`);
        return {
          success: true,
          data: response.data.data
        };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to fetch user'
        };
      }
    },

    // Update a user
    async updateUser(id, userData) {
      try {
        const response = await api.patch(`/users/${id}`, userData);
        return {
          success: true,
          data: response.data.data
        };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to update user'
        };
      }
    },

    // Delete a user
    async deleteUser(id) {
      try {
        const response = await api.delete(`/users/${id}`);
        return {
          success: true,
          data: response.data.data
        };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to delete user'
        };
      }
    },

    // Assign facility to user
    async assignFacility(userId, facilityId) {
      try {
        const response = await api.post(`/users/${userId}/facilities/${facilityId}`);
        return {
          success: true,
          data: response.data.data
        };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to assign facility'
        };
      }
    },

    // Remove facility from user
    async removeFacility(userId, facilityId) {
      try {
        const response = await api.delete(`/users/${userId}/facilities/${facilityId}`);
        return {
          success: true,
          data: response.data.data
        };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to remove facility'
        };
      }
    },

    // Assign study to user
    async assignStudy(userId, studyId) {
      try {
        const response = await api.post(`/users/${userId}/studies/${studyId}`);
        return {
          success: true,
          data: response.data.data
        };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to assign study'
        };
      }
    },

    // Remove study from user
    async removeStudy(userId, studyId) {
      try {
        const response = await api.delete(`/users/${userId}/studies/${studyId}`);
        return {
          success: true,
          data: response.data.data
        };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to remove study'
        };
      }
    }
};

export { userService as authService }; 