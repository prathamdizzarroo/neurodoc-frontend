import axios from 'axios';

// Base URL for the API
const API_URL = 'http://localhost:3000/api';

const geminiService = {
  async generateDocument(template, context) {
    try {
      const response = await axios.post(`${API_URL}/gemini/generate`, {
        template,
        context
      });
      return response.data;
    } catch (error) {
      console.error('Error generating document:', error);
      throw new Error(error.response?.data?.message || 'Failed to generate document');
    }
  },

  async getTemplates() {
    try {
      const response = await axios.get(`${API_URL}/gemini/templates`);
      return response.data;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch templates');
    }
  },

  async generateContent(prompt, context) {
    try {
      const response = await axios.post(`${API_URL}/gemini/generate-content`, {
        prompt,
        context
      });
      return response.data;
    } catch (error) {
      console.error('Error generating content:', error);
      throw new Error(error.response?.data?.message || 'Failed to generate content');
    }
  }
};

export { geminiService }; 