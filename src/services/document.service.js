import { config } from '../config/config';
import axios from 'axios';

const API_URL = `${config.API_URL}/api/tmf/documents`;
const DEFAULT_USER_ID = '67eb40dcddde69be0369d620';

const documentService = {
    create: async (formData) => {
        try {
            // Create a new FormData object for the request
            const requestFormData = new FormData();
            
            // Add the file if it exists
            const file = formData.get('file');
            if (file) {
                requestFormData.append('file', file);
            }

            // Create metadata object with all required fields from the Document model
            const documentTitle = formData.get('artifactName') || formData.get('title') || '';
            const metadata = {
                documentTitle, // Required by backend
                version: formData.get('version'),
                zoneNumber: formData.get('zoneNumber'),
                zoneName: formData.get('zoneName'),
                zoneDescription: formData.get('zoneDescription') || '',
                sectionNumber: formData.get('sectionNumber'),
                sectionName: formData.get('sectionName'),
                sectionDescription: formData.get('sectionDescription') || '',
                artifactNumber: formData.get('artifactNumber'),
                artifactName: formData.get('artifactName'),
                artifactDescription: formData.get('artifactDescription') || '',
                mandatory: formData.get('mandatory') === 'true' || formData.get('mandatory') === true,
                status: formData.get('status') || 'DRAFT',
                uploadDate: formData.get('uploadDate') || new Date().toISOString(),
                fileName: formData.get('fileName'),
                fileSize: parseInt(formData.get('fileSize')),
                fileFormat: formData.get('fileFormat'),
                // Additional required fields from Document model
                documentId: formData.get('documentId') || `doc_${Date.now()}`,
                title: documentTitle,
                description: formData.get('description') || '',
                documentType: formData.get('documentType') || 'OTHER',
                tmfReference: formData.get('tmfReference') || '',
                study: formData.get('study') || '',
                country: formData.get('country') || '',
                site: formData.get('site') || '',
                fileUrl: formData.get('fileUrl') || '',
                mimeType: formData.get('fileFormat'),
                documentDate: formData.get('documentDate') || new Date().toISOString(),
                author: formData.get('author') || '',
                uploadedBy: formData.get('uploadedBy') || ''
            };

            // Add metadata as a JSON string
            requestFormData.append('metadata', JSON.stringify(metadata));
            
            const response = await axios.post(`${API_URL}/${DEFAULT_USER_ID}`, requestFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error in documentService.create:", error);
            throw error;
        }
    },
  
    getAllDocuments: async () => {
        try {
            const response = await axios.get(`${API_URL}`);
            return response.data;
        } catch (error) {
            console.error("Error in documentService.getAllDocuments:", error);
            throw error;
        }
    },

    getDocument: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error in documentService.getDocument:", error);
            throw error;
        }
    },

    // Get all comments for a document
    getComments: async (documentId) => {
        try {
            const response = await axios.get(`${API_URL}/${documentId}/comments`);
            return response.data;
        } catch (error) {
            console.error("Error in documentService.getComments:", error);
            throw error;
        }
    },

    // Add a comment to a document
    addComment: async (documentId, content, userId) => {
        try {
            const response = await axios.post(`${API_URL}/${documentId}/comments`, {
                content,
                userId
            });
            return response.data;
        } catch (error) {
            console.error("Error in documentService.addComment:", error);
            throw error;
        }
    },

    // Add a reply to a comment
    addReply: async (documentId, commentId, content, userId) => {
        try {
            const response = await axios.post(`${API_URL}/${documentId}/comments/${commentId}/replies`, {
                content,
                userId
            });
            return response.data;
        } catch (error) {
            console.error("Error in documentService.addReply:", error);
            throw error;
        }
    }
};

export default documentService;
  