# LORENZ Validation Integration Guide

## Overview

This guide explains how to integrate LORENZ validation services into the NeuroDoc frontend application for regulatory package validation.

## Features

### LORENZ eValidator Integration
- **Document Validation**: Validate individual documents using LORENZ eValidator
- **Package Validation**: Validate entire regulatory packages using LORENZ docuBridge
- **Multi-Agency Support**: Support for FDA, EMA, PMDA, Health Canada, MHRA, BfArM
- **Validation Types**: eCTD 4.0, SDTM 3.4, ADaM 1.1, DEFINE-XML 2.1, SEND 3.1
- **Real-time Validation**: Live validation with progress tracking
- **Comprehensive Reporting**: Detailed validation reports with recommendations

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the `neurodoc-frontend` directory with the following variables:

```env
# LORENZ API Configuration
VITE_LORENZ_API_URL=https://api.lorenz.cc
VITE_LORENZ_API_KEY=your_lorenz_api_key_here

# Other Configuration
VITE_API_URL=http://localhost:3000/api
```

### 2. API Key Setup

1. Contact LORENZ Life Sciences Group to obtain API credentials
2. Visit [https://www.lorenz.cc](https://www.lorenz.cc) for more information
3. Request access to LORENZ eValidator and docuBridge APIs
4. Configure your API key in the environment variables

### 3. Service Integration

The integration includes the following services:

#### `lorenzValidationService.js`
- Main service for LORENZ API communication
- Handles document and package validation
- Manages validation rules and compliance standards
- Formats responses for application consumption

#### `LorenzValidationPanel.jsx`
- React component for LORENZ validation interface
- Provides validation controls and progress tracking
- Displays comprehensive validation results
- Supports multiple validation types and agencies

## Usage

### Basic Document Validation

```javascript
import { lorenzValidationService } from '@/services/lorenzValidationService';

// Validate a single document
const result = await lorenzValidationService.validateDocument(
  { file: documentFile, metadata: documentMetadata },
  'eCTD',
  'FDA'
);
```

### Package Validation

```javascript
// Validate an entire regulatory package
const packageResult = await lorenzValidationService.validateRegulatoryPackage(
  packageData,
  'USA'
);
```

### Using the Validation Panel

```javascript
import LorenzValidationPanel from '@/components/regulatory/LorenzValidationPanel';

<LorenzValidationPanel
  documents={documents}
  targetCountry="USA"
  packageId={packageId}
  onValidationComplete={handleValidationComplete}
  onValidationError={handleValidationError}
/>
```

## Validation Types

### eCTD 4.0
- Electronic Common Technical Document
- FDA, EMA, PMDA, Health Canada compliant
- Supports all eCTD 4.0 validation rules

### SDTM 3.4
- Study Data Tabulation Model
- CDISC compliant validation
- Dataset structure and content validation

### ADaM 1.1
- Analysis Data Model
- Statistical analysis dataset validation
- CDISC ADaM compliance checking

### DEFINE-XML 2.1
- Define XML for Clinical Data
- Dataset metadata validation
- Variable and value metadata checking

### SEND 3.1
- Standard for Exchange of Nonclinical Data
- Nonclinical study data validation
- Toxicology and safety data compliance

## Supported Agencies

| Country | Agency | Validation Standards |
|---------|--------|-------------------|
| USA | FDA | FDA-eCTD, CDISC-SDTM, CDISC-ADaM |
| Japan | PMDA | PMDA-eCTD, CDISC-SDTM, CDISC-ADaM |
| Canada | Health Canada | Health-Canada-eCTD, CDISC-SDTM |
| UK | MHRA | MHRA-eCTD, CDISC-SDTM, CDISC-ADaM |
| Germany | BfArM | BfArM-eCTD, CDISC-SDTM, CDISC-ADaM |
| Europe | EMA | EMA-eCTD, CDISC-SDTM, CDISC-ADaM |

## Validation Rules

### FDA Rules
- 21 CFR 312 (IND Applications)
- ICH E3 (Clinical Study Reports)
- CDISC SDTM v3.4
- CDISC ADaM v1.1
- CDISC DEFINE-XML v2.1

### PMDA Rules
- PMDA Guidance Documents
- ICH E3-JP (Japanese Clinical Study Reports)
- CDISC Standards (Japanese adaptations)

### Health Canada Rules
- Health Canada Guidance
- Canadian Clinical Trial Applications
- CDISC Standards

## Error Handling

The integration includes comprehensive error handling:

```javascript
try {
  const result = await lorenzValidationService.validateDocument(document, 'eCTD', 'FDA');
  // Handle successful validation
} catch (error) {
  // Handle validation errors
  console.error('LORENZ validation failed:', error);
  
  // Fallback to basic validation
  const fallbackResult = await validationService.validateDocument(documentId, documentType);
}
```

## Validation Results Structure

```javascript
{
  status: 'PASS' | 'FAIL' | 'WARNING',
  summary: {
    totalIssues: number,
    criticalIssues: number,
    errors: number,
    warnings: number,
    info: number
  },
  validationDetails: {
    documentInfo: object,
    validationMetadata: {
      validationTool: 'LORENZ eValidator',
      validationVersion: '25.1',
      validationRules: array,
      validationEnvironment: 'LORENZ Cloud'
    },
    issues: array,
    datasetSummary: object,
    complianceSummary: object
  },
  recommendations: array,
  technicalDetails: {
    validationTime: string,
    memoryUsage: string,
    processingSteps: array,
    validationLog: array
  },
  lorenzMetadata: {
    validationId: string,
    sessionId: string,
    timestamp: string,
    apiVersion: string
  }
}
```

## Reporting

### Export Validation Reports

```javascript
const exportValidationReport = () => {
  const report = {
    timestamp: new Date().toISOString(),
    targetCountry,
    validationType: selectedValidationType,
    packageId,
    documentResults: validationResults,
    packageResult: packageValidationResult,
    summary: {
      totalDocuments: documents?.length || 0,
      validatedDocuments: Object.keys(validationResults).length,
      passCount: Object.values(validationResults).filter(r => r.status === 'PASS').length,
      failCount: Object.values(validationResults).filter(r => r.status === 'FAIL').length,
      warningCount: Object.values(validationResults).filter(r => r.status === 'WARNING').length
    }
  };

  // Export as JSON file
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lorenz-validation-report-${packageId}-${new Date().toISOString()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
```

## Troubleshooting

### Common Issues

1. **API Key Invalid**
   - Verify your LORENZ API key is correct
   - Check API key permissions and scope
   - Contact LORENZ support for assistance

2. **Validation Timeout**
   - Large files may take longer to validate
   - Check network connectivity
   - Consider file size optimization

3. **Validation Rules Not Found**
   - Verify target agency is supported
   - Check validation type compatibility
   - Update to latest LORENZ API version

### Support

For LORENZ-specific issues:
- Visit [https://www.lorenz.cc](https://www.lorenz.cc)
- Contact LORENZ support team
- Check LORENZ documentation and user guides

For integration issues:
- Check environment configuration
- Verify API endpoints and authentication
- Review error logs and validation responses

## Best Practices

1. **Pre-validation**: Validate documents before package creation
2. **Error Handling**: Always implement fallback validation
3. **Progress Tracking**: Show validation progress to users
4. **Result Caching**: Cache validation results for performance
5. **Regular Updates**: Keep LORENZ API version updated
6. **Compliance Monitoring**: Monitor regulatory requirement changes

## Future Enhancements

- **Batch Validation**: Support for large document batches
- **Real-time Collaboration**: Multi-user validation workflows
- **Advanced Analytics**: Validation trend analysis
- **Custom Rules**: User-defined validation rules
- **Integration APIs**: Third-party system integration
- **Mobile Support**: Mobile validation interface

## License

This integration is part of the NeuroDoc TMF system. Please refer to the main project license for usage terms.

## Contributing

For contributions to the LORENZ integration:
1. Follow the existing code style
2. Add comprehensive error handling
3. Include unit tests for new features
4. Update documentation for changes
5. Test with multiple validation types and agencies 