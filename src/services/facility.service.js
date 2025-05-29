import api from './api';

class FacilityService {
  // Get all facilities with filters
  async getFacilities(params = {}) {
    try {
      const response = await api.get('/facilities', { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch facilities'
      };
    }
  }

  // Get single facility
  async getFacility(id) {
    try {
      const response = await api.get(`/facilities/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch facility'
      };
    }
  }

  // Create new facility
  async createFacility(facilityData) {
    try {
      const response = await api.post('/facilities', facilityData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create facility'
      };
    }
  }

  // Update facility
  async updateFacility(id, facilityData) {
    try {
      const response = await api.put(`/facilities/${id}`, facilityData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update facility'
      };
    }
  }

  // Delete facility
  async deleteFacility(id) {
    try {
      const response = await api.delete(`/facilities/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to delete facility'
      };
    }
  }

  // Assign study to facility
  async assignStudy(facilityId, studyId, studyData) {
    try {
      const response = await api.post(`/facilities/${facilityId}/studies`, {
        studyId,
        studyData
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to assign study'
      };
    }
  }

  // Assign users to facility
  async assignUsers(facilityId, userIds) {
    try {
      const response = await api.post(`/facilities/${facilityId}/users`, {
        userIds
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to assign users'
      };
    }
  }

  // Batch import facilities
  async batchImport(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/api/facilities/batch-import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to import facilities'
      };
    }
  }
}

export default new FacilityService(); 