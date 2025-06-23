import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ValidationService {
  async validateDocument(documentId, documentType) {
    try {
      const response = await axios.post(`${API_URL}/api/validation/validate`, {
        documentId,
        documentType
      });
      return response.data;
    } catch (error) {
      console.error('Validation error:', error);
      throw new Error(error.response?.data?.error || 'Failed to validate document');
    }
  }

  async getValidationHistory(documentId) {
    try {
      const response = await axios.get(`${API_URL}/api/validation/history/${documentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching validation history:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch validation history');
    }
  }
}

export const validationService = new ValidationService(); 