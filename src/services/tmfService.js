import axios from 'axios';

import { config } from '../config/config';

const API_URL = `${config.API_URL}/api`;
export const tmfService = {
  async getZones() {
    try {
      console.log('Fetching TMF zones from:', `${API_URL}/tmf/zones`);
      const response = await axios.get(`${API_URL}/tmf/zones`);
      console.log('Raw zones response:', response);
      
      // Return the response directly since axios wraps the data
      return response;
    } catch (error) {
      console.error('Error in getZones:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        throw new Error(error.response.data?.message || 'Failed to fetch TMF zones');
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        throw new Error('No response received from server');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up request:', error.message);
        throw new Error('Failed to make request');
      }
    }
  },

  async getSections(zoneId) {
    try {
      console.log('Fetching sections for zone:', zoneId);
      const response = await axios.get(`${API_URL}/tmf/zones/${zoneId}/sections`);
      console.log('Raw sections response:', response);
      return response;
    } catch (error) {
      console.error('Error in getSections:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to fetch sections');
      } else if (error.request) {
        throw new Error('No response received from server');
      } else {
        throw new Error('Failed to make request');
      }
    }
  },

  async getArtifacts(sectionId) {
    try {
      console.log('Fetching artifacts for section:', sectionId);
      const response = await axios.get(`${API_URL}/tmf/sections/${sectionId}/artifacts`);
      console.log('Raw artifacts response:', response);
      return response;
    } catch (error) {
      console.error('Error in getArtifacts:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to fetch artifacts');
      } else if (error.request) {
        throw new Error('No response received from server');
      } else {
        throw new Error('Failed to make request');
      }
    }
  },

  async getSubArtifacts(artifactId) {
    try {
      console.log('Fetching sub-artifacts for artifact:', artifactId);
      const response = await axios.get(`${API_URL}/tmf/artifacts/${artifactId}/sub-artifacts`);
      console.log('Raw sub-artifacts response:', response);
      return response;
    } catch (error) {
      console.error('Error in getSubArtifacts:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to fetch sub-artifacts');
      } else if (error.request) {
        throw new Error('No response received from server');
      } else {
        throw new Error('Failed to make request');
      }
    }
  },

  async getDocuments() {
    try {
      console.log('Fetching TMF documents from:', `${API_URL}/tmf/documents`);
      const response = await axios.get(`${API_URL}/tmf/documents`);
      console.log('Raw documents response:', response);
      return response;
    } catch (error) {
      console.error('Error in getDocuments:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to fetch TMF documents');
      } else if (error.request) {
        throw new Error('No response received from server');
      } else {
        throw new Error('Failed to make request');
      }
    }
  },

  async getDocumentContent(documentId) {
    try {
      console.log('Fetching document content for:', documentId);
      const response = await axios.get(`${API_URL}/tmf/documents/${documentId}/content`);
      console.log('Raw document content response:', response);
      return response;
    } catch (error) {
      console.error('Error in getDocumentContent:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to fetch document content');
      } else if (error.request) {
        throw new Error('No response received from server');
      } else {
        throw new Error('Failed to make request');
      }
    }
  },

  async importDocument(documentId, packageId) {
    try {
      console.log('Importing document:', documentId, 'to package:', packageId);
      const response = await axios.post(`${API_URL}/tmf/documents/${documentId}/import`, {
        packageId
      });
      console.log('Raw import response:', response);
      return response;
    } catch (error) {
      console.error('Error in importDocument:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to import document');
      } else if (error.request) {
        throw new Error('No response received from server');
      } else {
        throw new Error('Failed to make request');
      }
    }
  }
}; 