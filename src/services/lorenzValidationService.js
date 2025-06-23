import axios from 'axios';

const LORENZ_API_URL = import.meta.env.VITE_LORENZ_API_URL || 'https://api.lorenz.cc';
const LORENZ_API_KEY = import.meta.env.VITE_LORENZ_API_KEY;

class LorenzValidationService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: LORENZ_API_URL,
      headers: {
        'Authorization': `Bearer ${LORENZ_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Client-Version': '1.0.0'
      }
    });
  }

  /**
   * Validate document using LORENZ eValidator
   * @param {Object} document - Document object with file and metadata
   * @param {string} validationType - Type of validation (eCTD, SDTM, ADaM, etc.)
   * @param {string} targetAgency - Target regulatory agency (FDA, EMA, PMDA, etc.)
   */
  async validateDocument(document, validationType = 'eCTD', targetAgency = 'FDA') {
    try {
      const formData = new FormData();
      formData.append('file', document.file);
      formData.append('validationType', validationType);
      formData.append('targetAgency', targetAgency);
      formData.append('metadata', JSON.stringify(document.metadata));

      const response = await this.apiClient.post('/validator/validate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5 minutes timeout for large files
      });

      return this.formatValidationResponse(response.data);
    } catch (error) {
      console.error('LORENZ validation error:', error);
      throw new Error(error.response?.data?.message || 'LORENZ validation failed');
    }
  }

  /**
   * Validate regulatory package using LORENZ docuBridge
   * @param {Object} packageData - Regulatory package data
   * @param {string} targetCountry - Target country for submission
   */
  async validateRegulatoryPackage(packageData, targetCountry) {
    try {
      const response = await this.apiClient.post('/docubridge/validate-package', {
        package: packageData,
        targetCountry,
        validationRules: this.getValidationRules(targetCountry),
        complianceStandards: this.getComplianceStandards(targetCountry)
      });

      return this.formatPackageValidationResponse(response.data);
    } catch (error) {
      console.error('LORENZ package validation error:', error);
      throw new Error(error.response?.data?.message || 'LORENZ package validation failed');
    }
  }

  /**
   * Get validation rules for specific country/agency
   */
  getValidationRules(country) {
    const rules = {
      'USA': {
        eCTD: '4.0',
        sdtm: '3.4',
        adam: '1.1',
        define: '2.1',
        additionalRules: ['FDA-21-CFR-312', 'ICH-E3']
      },
      'JAPAN': {
        eCTD: '4.0',
        sdtm: '3.4',
        adam: '1.1',
        define: '2.1',
        additionalRules: ['PMDA-Guidance', 'ICH-E3-JP']
      },
      'CANADA': {
        eCTD: '4.0',
        sdtm: '3.4',
        adam: '1.1',
        define: '2.1',
        additionalRules: ['Health-Canada-Guidance']
      },
      'UK': {
        eCTD: '4.0',
        sdtm: '3.4',
        adam: '1.1',
        define: '2.1',
        additionalRules: ['MHRA-Guidance']
      },
      'GERMANY': {
        eCTD: '4.0',
        sdtm: '3.4',
        adam: '1.1',
        define: '2.1',
        additionalRules: ['BfArM-Guidance']
      }
    };

    return rules[country] || rules['USA'];
  }

  /**
   * Get compliance standards for specific country
   */
  getComplianceStandards(country) {
    const standards = {
      'USA': ['FDA-eCTD', 'CDISC-SDTM', 'CDISC-ADaM', 'CDISC-DEFINE-XML'],
      'JAPAN': ['PMDA-eCTD', 'CDISC-SDTM', 'CDISC-ADaM', 'CDISC-DEFINE-XML'],
      'CANADA': ['Health-Canada-eCTD', 'CDISC-SDTM', 'CDISC-ADaM'],
      'UK': ['MHRA-eCTD', 'CDISC-SDTM', 'CDISC-ADaM'],
      'GERMANY': ['BfArM-eCTD', 'CDISC-SDTM', 'CDISC-ADaM']
    };

    return standards[country] || standards['USA'];
  }

  /**
   * Format validation response to match our application structure
   */
  formatValidationResponse(lorenzResponse) {
    return {
      status: this.mapLorenzStatus(lorenzResponse.status),
      summary: {
        totalIssues: lorenzResponse.totalIssues || 0,
        criticalIssues: lorenzResponse.criticalIssues || 0,
        errors: lorenzResponse.errors || 0,
        warnings: lorenzResponse.warnings || 0,
        info: lorenzResponse.info || 0
      },
      validationDetails: {
        documentInfo: lorenzResponse.documentInfo || {},
        validationMetadata: {
          validationDate: new Date().toISOString(),
          validationTool: 'LORENZ eValidator',
          validationVersion: lorenzResponse.validatorVersion || '25.1',
          validationRules: lorenzResponse.validationRules || [],
          validationEnvironment: 'LORENZ Cloud'
        },
        issues: this.formatIssues(lorenzResponse.issues || []),
        datasetSummary: lorenzResponse.datasetSummary || {},
        complianceSummary: lorenzResponse.complianceSummary || {}
      },
      recommendations: this.formatRecommendations(lorenzResponse.recommendations || []),
      technicalDetails: {
        validationTime: lorenzResponse.validationTime || '0s',
        memoryUsage: lorenzResponse.memoryUsage || '0MB',
        processingSteps: lorenzResponse.processingSteps || [],
        validationLog: lorenzResponse.validationLog || []
      },
      lorenzMetadata: {
        validationId: lorenzResponse.validationId,
        sessionId: lorenzResponse.sessionId,
        timestamp: lorenzResponse.timestamp,
        apiVersion: lorenzResponse.apiVersion
      }
    };
  }

  /**
   * Format package validation response
   */
  formatPackageValidationResponse(lorenzResponse) {
    return {
      status: this.mapLorenzStatus(lorenzResponse.status),
      summary: {
        totalDocuments: lorenzResponse.totalDocuments || 0,
        validatedDocuments: lorenzResponse.validatedDocuments || 0,
        failedDocuments: lorenzResponse.failedDocuments || 0,
        totalIssues: lorenzResponse.totalIssues || 0,
        criticalIssues: lorenzResponse.criticalIssues || 0,
        errors: lorenzResponse.errors || 0,
        warnings: lorenzResponse.warnings || 0
      },
      documentResults: lorenzResponse.documentResults || [],
      packageCompliance: lorenzResponse.packageCompliance || {},
      submissionReadiness: lorenzResponse.submissionReadiness || {},
      recommendations: this.formatRecommendations(lorenzResponse.recommendations || []),
      lorenzMetadata: {
        validationId: lorenzResponse.validationId,
        sessionId: lorenzResponse.sessionId,
        timestamp: lorenzResponse.timestamp
      }
    };
  }

  /**
   * Map LORENZ status to our application status
   */
  mapLorenzStatus(lorenzStatus) {
    const statusMap = {
      'PASS': 'PASS',
      'FAIL': 'FAIL',
      'WARNING': 'WARNING',
      'ERROR': 'FAIL',
      'CRITICAL': 'FAIL',
      'INFO': 'PASS'
    };
    return statusMap[lorenzStatus] || 'WARNING';
  }

  /**
   * Format issues from LORENZ response
   */
  formatIssues(lorenzIssues) {
    return lorenzIssues.map(issue => ({
      id: issue.id || `LORENZ-${Math.random().toString(36).substr(2, 9)}`,
      severity: this.mapSeverity(issue.severity),
      category: issue.category || 'Validation',
      message: issue.message || issue.description,
      location: issue.location || null,
      context: issue.context || '',
      recommendation: issue.recommendation || issue.suggestion,
      reference: issue.reference || issue.rule,
      lorenzRuleId: issue.ruleId,
      lorenzRuleVersion: issue.ruleVersion
    }));
  }

  /**
   * Map LORENZ severity to our severity levels
   */
  mapSeverity(lorenzSeverity) {
    const severityMap = {
      'CRITICAL': 'CRITICAL',
      'ERROR': 'ERROR',
      'WARNING': 'WARNING',
      'INFO': 'INFO',
      'FATAL': 'CRITICAL',
      'SEVERE': 'ERROR'
    };
    return severityMap[lorenzSeverity] || 'WARNING';
  }

  /**
   * Format recommendations from LORENZ response
   */
  formatRecommendations(lorenzRecommendations) {
    return lorenzRecommendations.map(rec => ({
      priority: this.mapPriority(rec.priority),
      category: rec.category || 'General',
      message: rec.message || rec.description,
      impact: rec.impact || '',
      action: rec.action || rec.suggestion,
      lorenzRecommendationId: rec.id
    }));
  }

  /**
   * Map LORENZ priority to our priority levels
   */
  mapPriority(lorenzPriority) {
    const priorityMap = {
      'HIGH': 'HIGH',
      'MEDIUM': 'MEDIUM',
      'LOW': 'LOW',
      'CRITICAL': 'HIGH',
      'URGENT': 'HIGH'
    };
    return priorityMap[lorenzPriority] || 'MEDIUM';
  }

  /**
   * Get validation history from LORENZ
   */
  async getValidationHistory(documentId) {
    try {
      const response = await this.apiClient.get(`/validator/history/${documentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching LORENZ validation history:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch validation history');
    }
  }

  /**
   * Get LORENZ validation templates for specific document types
   */
  async getValidationTemplates(documentType, targetAgency) {
    try {
      const response = await this.apiClient.get('/validator/templates', {
        params: { documentType, targetAgency }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching LORENZ validation templates:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch validation templates');
    }
  }

  /**
   * Submit validation report to LORENZ for analysis
   */
  async submitValidationReport(validationResults, packageId) {
    try {
      const response = await this.apiClient.post('/validator/submit-report', {
        validationResults,
        packageId,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting validation report to LORENZ:', error);
      throw new Error(error.response?.data?.message || 'Failed to submit validation report');
    }
  }

  /**
   * Get LORENZ compliance status for a package
   */
  async getComplianceStatus(packageId) {
    try {
      const response = await this.apiClient.get(`/docubridge/compliance/${packageId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching LORENZ compliance status:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch compliance status');
    }
  }
}

export const lorenzValidationService = new LorenzValidationService(); 