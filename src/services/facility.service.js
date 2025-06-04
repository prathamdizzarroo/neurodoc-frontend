import api from './api';

// Utility function to generate facility code
const generateFacilityCode = (facilityType, name) => {
  // Get first 4 characters of facility type
  const typePrefix = facilityType.substring(0, 4).toUpperCase();
  
  // Get first 4 characters of facility name
  const namePrefix = name.substring(0, 4).toUpperCase();
  
  // Generate random 4 character alphanumeric string
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  // Combine all parts
  return `${typePrefix}-${namePrefix}-${randomStr}`;
};

class FacilityService {
  // Get all facilities with filters
  async getFacilities(params = {}) {
    try {
      const response = await api.get('/facilities', { params });
      return {
        success: true,
        data: response.data.data || []
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
      // Generate facility code
      const facilityCode = generateFacilityCode(
        facilityData.siteType || 'FACILITY',
        facilityData.name
      );

      // Add facility code to the data
      const facilityDataWithCode = {
        ...facilityData,
        facilityId: facilityCode
      };

      const response = await api.post('/facilities', facilityDataWithCode);
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
      // Create a copy of the data without facilityId
      const { facilityId, ...updateData } = facilityData;

      const response = await api.patch(`/facilities/${id}`, updateData);
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