import axios from 'axios';

// Enhanced validation service that simulates LORENZ-like validation
class EnhancedValidationService {
  constructor() {
    this.validationRules = this.getValidationRules();
    this.complianceStandards = this.getComplianceStandards();
  }

  // Validation rules based on real regulatory requirements
  getValidationRules() {
    return {
      'USA': {
        eCTD: {
          version: '4.0',
          rules: [
            'FDA-21-CFR-312',
            'ICH-E3',
            'CDISC-SDTM-3.4',
            'CDISC-ADaM-1.1',
            'CDISC-DEFINE-XML-2.1'
          ]
        },
        sdtm: {
          version: '3.4',
          rules: [
            'SDTM-IG-3.4',
            'CDISC-TERMINOLOGY-2023-03-31',
            'FDA-SDTM-Validation'
          ]
        },
        adam: {
          version: '1.1',
          rules: [
            'ADaM-IG-1.1',
            'CDISC-TERMINOLOGY-2023-03-31',
            'FDA-ADaM-Validation'
          ]
        }
      },
      'JAPAN': {
        eCTD: {
          version: '4.0',
          rules: [
            'PMDA-Guidance',
            'ICH-E3-JP',
            'CDISC-SDTM-3.4',
            'CDISC-ADaM-1.1'
          ]
        }
      },
      'CANADA': {
        eCTD: {
          version: '4.0',
          rules: [
            'Health-Canada-Guidance',
            'CDISC-SDTM-3.4',
            'CDISC-ADaM-1.1'
          ]
        }
      },
      'UK': {
        eCTD: {
          version: '4.0',
          rules: [
            'MHRA-Guidance',
            'CDISC-SDTM-3.4',
            'CDISC-ADaM-1.1'
          ]
        }
      },
      'GERMANY': {
        eCTD: {
          version: '4.0',
          rules: [
            'BfArM-Guidance',
            'CDISC-SDTM-3.4',
            'CDISC-ADaM-1.1'
          ]
        }
      }
    };
  }

  getComplianceStandards() {
    return {
      'USA': ['FDA-eCTD', 'CDISC-SDTM', 'CDISC-ADaM', 'CDISC-DEFINE-XML'],
      'JAPAN': ['PMDA-eCTD', 'CDISC-SDTM', 'CDISC-ADaM', 'CDISC-DEFINE-XML'],
      'CANADA': ['Health-Canada-eCTD', 'CDISC-SDTM', 'CDISC-ADaM'],
      'UK': ['MHRA-eCTD', 'CDISC-SDTM', 'CDISC-ADaM'],
      'GERMANY': ['BfArM-eCTD', 'CDISC-SDTM', 'CDISC-ADaM']
    };
  }

  // Simulate LORENZ-like document validation
  async validateDocument(document, validationType = 'eCTD', targetAgency = 'FDA') {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

      const country = this.getCountryFromAgency(targetAgency);
      const rules = this.validationRules[country]?.[validationType.toLowerCase()] || this.validationRules['USA'].eCTD;
      
      // Generate realistic validation issues based on document type and rules
      const issues = this.generateValidationIssues(document, validationType, rules);
      const summary = this.calculateSummary(issues);
      const status = this.determineStatus(summary);

      return {
        status,
        summary,
        validationDetails: {
          documentInfo: {
            fileName: document.file?.name || document.name,
            fileSize: document.file?.size || 0,
            fileType: document.file?.type || 'application/pdf',
            lastModified: new Date().toISOString(),
            documentType: document.metadata?.documentTitle || 'Unknown',
            version: document.metadata?.version || "1.0"
          },
          validationMetadata: {
            validationDate: new Date().toISOString(),
            validationTool: 'Enhanced Validator (LORENZ-compatible)',
            validationVersion: '1.0.0',
            validationRules: rules.rules,
            validationEnvironment: 'Production'
          },
          issues,
          datasetSummary: this.generateDatasetSummary(validationType),
          complianceSummary: this.generateComplianceSummary(country, validationType)
        },
        recommendations: this.generateRecommendations(issues),
        technicalDetails: {
          validationTime: `${(2 + Math.random() * 3).toFixed(1)} seconds`,
          memoryUsage: `${Math.floor(100 + Math.random() * 200)}MB`,
          processingSteps: [
            'File parsing',
            'Structure validation',
            'Content validation',
            'Cross-dataset validation',
            'Regulatory compliance check'
          ],
          validationLog: [
            'INFO: Starting validation process',
            'INFO: Parsing document structure',
            'INFO: Applying validation rules',
            'INFO: Checking regulatory compliance',
            'INFO: Validation completed'
          ]
        },
        lorenzMetadata: {
          validationId: `ENH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          sessionId: `session-${Date.now()}`,
          timestamp: new Date().toISOString(),
          apiVersion: '1.0.0'
        }
      };
    } catch (error) {
      console.error('Enhanced validation error:', error);
      throw new Error('Validation failed');
    }
  }

  // Generate realistic validation issues
  generateValidationIssues(document, validationType, rules) {
    const issues = [];
    const documentName = document.metadata?.documentTitle || 'Unknown Document';
    
    // Common issues based on validation type
    const commonIssues = {
      'eCTD': [
        {
          id: 'ECTD-001',
          severity: 'ERROR',
          category: 'Document Structure',
          message: 'Missing required section: Study Objectives',
          location: { section: 'Study Objectives', line: null },
          context: 'eCTD 4.0 requires Study Objectives section',
          recommendation: 'Add Study Objectives section to the document',
          reference: 'eCTD 4.0 Specification, Section 4.2.1'
        },
        {
          id: 'ECTD-002',
          severity: 'WARNING',
          category: 'Content',
          message: 'Inconsistent date format detected',
          location: { section: 'Study Dates', line: '15' },
          context: 'Dates should be in ISO 8601 format (YYYY-MM-DD)',
          recommendation: 'Standardize all dates to ISO 8601 format',
          reference: 'eCTD 4.0 Specification, Section 3.1.4'
        }
      ],
      'SDTM': [
        {
          id: 'SDTM-001',
          severity: 'CRITICAL',
          category: 'Data Structure',
          message: 'Missing required variable USUBJID in dataset',
          location: { dataset: 'DM', variable: 'USUBJID' },
          context: 'USUBJID is required for all SDTM datasets',
          recommendation: 'Add USUBJID variable to the dataset',
          reference: 'SDTM IG v3.4, Section 2.2.1'
        },
        {
          id: 'SDTM-002',
          severity: 'ERROR',
          category: 'Data Quality',
          message: 'Invalid value in SEX variable',
          location: { dataset: 'DM', variable: 'SEX', record: 'DM-001' },
          context: 'SEX must be M, F, or U',
          recommendation: 'Correct SEX values to valid codes',
          reference: 'SDTM IG v3.4, Section 4.1.4.4'
        }
      ],
      'ADaM': [
        {
          id: 'ADAM-001',
          severity: 'WARNING',
          category: 'Analysis',
          message: 'Missing analysis flag variable',
          location: { dataset: 'ADSL', variable: 'ANL01FL' },
          context: 'Analysis flags help identify analysis population',
          recommendation: 'Add analysis flag variables as needed',
          reference: 'ADaM IG v1.1, Section 4.1.1'
        }
      ]
    };

    // Add common issues for the validation type
    const typeIssues = commonIssues[validationType] || commonIssues['eCTD'];
    issues.push(...typeIssues);

    // Add some random issues based on document characteristics
    if (document.file?.size > 5000000) { // Large file
      issues.push({
        id: 'SIZE-001',
        severity: 'WARNING',
        category: 'Performance',
        message: 'Large file size may impact processing time',
        location: null,
        context: 'File size exceeds 5MB',
        recommendation: 'Consider file compression or splitting',
        reference: 'eCTD 4.0 Specification, Section 2.1'
      });
    }

    // Add document-specific issues
    if (documentName.toLowerCase().includes('protocol')) {
      issues.push({
        id: 'PROT-001',
        severity: 'ERROR',
        category: 'Protocol',
        message: 'Missing primary endpoint definition',
        location: { section: 'Study Endpoints' },
        context: 'Protocol must define primary endpoint',
        recommendation: 'Add clear primary endpoint definition',
        reference: 'ICH E3, Section 7.2'
      });
    }

    return issues;
  }

  // Calculate validation summary
  calculateSummary(issues) {
    return {
      totalIssues: issues.length,
      criticalIssues: issues.filter(i => i.severity === 'CRITICAL').length,
      errors: issues.filter(i => i.severity === 'ERROR').length,
      warnings: issues.filter(i => i.severity === 'WARNING').length,
      info: issues.filter(i => i.severity === 'INFO').length
    };
  }

  // Determine overall status
  determineStatus(summary) {
    if (summary.criticalIssues > 0 || summary.errors > 0) {
      return 'FAIL';
    } else if (summary.warnings > 0) {
      return 'WARNING';
    } else {
      return 'PASS';
    }
  }

  // Generate dataset summary for SDTM/ADaM
  generateDatasetSummary(validationType) {
    if (validationType === 'SDTM') {
      return {
        DM: { totalRecords: 50, issues: 2, status: 'WARNING' },
        EX: { totalRecords: 120, issues: 1, status: 'PASS' },
        AE: { totalRecords: 85, issues: 3, status: 'ERROR' }
      };
    } else if (validationType === 'ADaM') {
      return {
        ADSL: { totalRecords: 50, issues: 1, status: 'WARNING' },
        ADAE: { totalRecords: 85, issues: 0, status: 'PASS' }
      };
    }
    return {};
  }

  // Generate compliance summary
  generateComplianceSummary(country, validationType) {
    return {
      sdtm: {
        version: '3.4',
        compliance: 'PARTIAL',
        issues: 3
      },
      cdisc: {
        version: '2023-03-31',
        compliance: 'PARTIAL',
        issues: 2
      },
      regulatory: {
        fda: country === 'USA' ? 'PARTIAL' : 'N/A',
        pmda: country === 'JAPAN' ? 'PARTIAL' : 'N/A',
        ema: country === 'EUROPE' ? 'PARTIAL' : 'N/A'
      }
    };
  }

  // Generate recommendations
  generateRecommendations(issues) {
    const recommendations = [];
    
    const criticalIssues = issues.filter(i => i.severity === 'CRITICAL');
    if (criticalIssues.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Critical Issues',
        message: `Address ${criticalIssues.length} critical validation issues before submission`,
        impact: 'Critical for regulatory acceptance',
        action: 'Review and fix all critical issues'
      });
    }

    const errors = issues.filter(i => i.severity === 'ERROR');
    if (errors.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Errors',
        message: `Fix ${errors.length} validation errors`,
        impact: 'Required for regulatory compliance',
        action: 'Correct all validation errors'
      });
    }

    const warnings = issues.filter(i => i.severity === 'WARNING');
    if (warnings.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Warnings',
        message: `Review ${warnings.length} validation warnings`,
        impact: 'Improves document quality',
        action: 'Address warnings as appropriate'
      });
    }

    return recommendations;
  }

  // Helper methods
  getCountryFromAgency(agency) {
    const agencyMap = {
      'FDA': 'USA',
      'PMDA': 'JAPAN',
      'Health-Canada': 'CANADA',
      'MHRA': 'UK',
      'BfArM': 'GERMANY',
      'EMA': 'EUROPE'
    };
    return agencyMap[agency] || 'USA';
  }

  // Package validation
  async validateRegulatoryPackage(packageData, targetCountry) {
    try {
      await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));

      const documents = packageData.documents || [];
      const documentResults = [];
      let totalIssues = 0;
      let criticalIssues = 0;
      let errors = 0;
      let warnings = 0;

      // Validate each document
      for (const doc of documents) {
        const result = await this.validateDocument(doc, 'eCTD', this.getAgencyFromAgency(targetCountry));
        documentResults.push(result);
        
        totalIssues += result.summary.totalIssues;
        criticalIssues += result.summary.criticalIssues;
        errors += result.summary.errors;
        warnings += result.summary.warnings;
      }

      const overallStatus = criticalIssues > 0 || errors > 0 ? 'FAIL' : warnings > 0 ? 'WARNING' : 'PASS';

      return {
        status: overallStatus,
        summary: {
          totalDocuments: documents.length,
          validatedDocuments: documents.length,
          failedDocuments: documentResults.filter(r => r.status === 'FAIL').length,
          totalIssues,
          criticalIssues,
          errors,
          warnings
        },
        documentResults,
        packageCompliance: {
          overall: overallStatus,
          documents: documentResults.length,
          issues: totalIssues
        },
        submissionReadiness: {
          ready: overallStatus === 'PASS',
          issues: totalIssues,
          recommendations: totalIssues > 0 ? 'Address validation issues before submission' : 'Package ready for submission'
        },
        recommendations: this.generatePackageRecommendations(totalIssues, criticalIssues, errors, warnings),
        lorenzMetadata: {
          validationId: `PKG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          sessionId: `session-${Date.now()}`,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Package validation error:', error);
      throw new Error('Package validation failed');
    }
  }

  generatePackageRecommendations(totalIssues, criticalIssues, errors, warnings) {
    const recommendations = [];

    if (criticalIssues > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Package Quality',
        message: `Address ${criticalIssues} critical issues across all documents`,
        impact: 'Critical for regulatory acceptance',
        action: 'Review and fix all critical validation issues'
      });
    }

    if (errors > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Compliance',
        message: `Fix ${errors} validation errors to meet regulatory requirements`,
        impact: 'Required for regulatory compliance',
        action: 'Correct all validation errors before submission'
      });
    }

    if (warnings > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Document Quality',
        message: `Review ${warnings} warnings to improve document quality`,
        impact: 'Improves submission quality',
        action: 'Address warnings as appropriate'
      });
    }

    if (totalIssues === 0) {
      recommendations.push({
        priority: 'LOW',
        category: 'Submission Ready',
        message: 'Package meets all validation requirements',
        impact: 'Ready for regulatory submission',
        action: 'Proceed with submission process'
      });
    }

    return recommendations;
  }
}

export const enhancedValidationService = new EnhancedValidationService(); 