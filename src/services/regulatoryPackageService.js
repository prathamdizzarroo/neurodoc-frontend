import axios from 'axios';

// Use environment variable for API URL or fallback to default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${API_BASE_URL}/api/regulatory-packages`;

export const regulatoryPackageService = {
  // Create a new regulatory package
  async createPackage(packageData) {
    const response = await axios.post(API_URL, packageData);
    return response.data;
  },

  // Get all regulatory packages
  async getAllPackages() {
    const response = await axios.get(API_URL);
    return response.data;
  },

  // Get a single regulatory package by ID
  async getPackageById(id) {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  // Update a regulatory package
  async updatePackage(id, updateData) {
    const response = await axios.put(`${API_URL}/${id}`, updateData);
    return response.data;
  },

  // Delete a regulatory package
  async deletePackage(id) {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  },

  // Upload document to a package
  async uploadDocument(packageId, formData) {
    const response = await axios.post(`${API_URL}/${packageId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        // You can emit this progress to a callback if needed
        console.log(`Upload Progress: ${percentCompleted}%`);
      },
    });
    return response.data;
  }
}; 