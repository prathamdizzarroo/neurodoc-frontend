import React, { useState, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { 
  ArrowRight, 
  CheckCircle2, 
  ExternalLink, 
  Info, 
  ChevronRight, 
  ChevronLeft,
  Loader2,
  Search,
  FileText,
  File as FileIcon,
  Upload,
  Database,
  Wand2,
  ShieldCheck
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { regulatoryPackageService } from '@/services/regulatoryPackageService';
import DocumentGenerator from './DocumentGenerator';
import TMFDocumentBrowser from './TMFDocumentBrowser';
import { validationService } from '@/services/validationService';
import ValidationResults from './ValidationResults';
import { lorenzValidationService } from '@/services/lorenzValidationService';
import LorenzValidationPanel from './LorenzValidationPanel';
import { enhancedValidationService } from '@/services/enhancedValidationService';

// Country data with flag codes and additional information
const countryData = {
  USA: {
    name: "United States",
    flagCode: "us",
    region: "North America",
    documents: [
      {
        document_name: "Form FDA 1571",
        requirement: "Mandatory",
        description: "Investigational New Drug Application cover sheet.",
        template_link: "https://www.fda.gov/drugs/investigational-new-drug-ind-application/ind-forms-and-instructions"
      },
      {
        document_name: "Cover Letter",
        requirement: "Recommended",
        description: "Brief overview of the submission contents and purpose.",
        template_link: "N/A"
      },
      {
        document_name: "Protocol",
        requirement: "Mandatory",
        description: "Detailed study protocol document.",
        template_link: "N/A"
      }
    ]
  },
  JAPAN: {
    name: "Japan",
    flagCode: "jp",
    region: "Asia",
    documents: [
      {
        document_name: "Clinical Trial Notification (CTN)",
        requirement: "Mandatory",
        description: "Core form to notify PMDA before starting a clinical trial.",
        template_link: "N/A"
      },
      {
        document_name: "Protocol Summary",
        requirement: "Mandatory",
        description: "Summary of the clinical trial protocol in Japanese.",
        template_link: "N/A"
      }
    ]
  },
  CANADA: {
    name: "Canada",
    flagCode: "ca",
    region: "North America",
    documents: [
      {
        document_name: "Clinical Trial Application (CTA)",
        requirement: "Mandatory",
        description: "Application to conduct clinical trials in Canada.",
        template_link: "https://www.canada.ca/en/health-canada/services/drugs-health-products/drug-products/applications-submissions/clinical-trials.html"
      }
    ]
  },
  UK: {
    name: "United Kingdom",
    flagCode: "gb",
    region: "Europe",
    documents: [
      {
        document_name: "Clinical Trial Application (CTA)",
        requirement: "Mandatory",
        description: "Application to conduct clinical trials in the UK.",
        template_link: "N/A"
      }
    ]
  },
  GERMANY: {
    name: "Germany",
    flagCode: "de",
    region: "Europe",
    documents: [
      {
        document_name: "Clinical Trial Application (CTA)",
        requirement: "Mandatory",
        description: "Application to conduct clinical trials in Germany.",
        template_link: "N/A"
      }
    ]
  }
};

const FlagImage = ({ code, className }) => (
  <div className={cn("relative w-8 h-6 rounded-sm overflow-hidden shadow-sm", className)}>
    <img
      src={`https://flagcdn.com/w80/${code}.png`}
      alt={`${code.toUpperCase()} flag`}
      className="w-full h-full object-cover"
      loading="lazy"
    />
  </div>
);

const CreateRegulatoryPackage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [uploadedDocuments, setUploadedDocuments] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadErrors, setUploadErrors] = useState({});
  const [selectedUploadMethod, setSelectedUploadMethod] = useState({});
  const [createdPackageId, setCreatedPackageId] = useState(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedDocForGeneration, setSelectedDocForGeneration] = useState(null);
  const [showTMFBrowser, setShowTMFBrowser] = useState(false);
  const [selectedDocForTMF, setSelectedDocForTMF] = useState(null);
  const [validationResults, setValidationResults] = useState({});
  const [isValidationInProgress, setIsValidationInProgress] = useState(false);
  const [validationSummary, setValidationSummary] = useState(null);
  const [showLorenzValidation, setShowLorenzValidation] = useState(false);
  const [lorenzValidationResults, setLorenzValidationResults] = useState(null);
  const { toast } = useToast();

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setUploadedDocuments({});
    setUploadProgress({});
    setUploadErrors({});
  };

  const getFileIcon = (file) => {
    if (!file) return <FileIcon className="w-5 h-5 text-muted-foreground" />;
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'pdf') return <FileText className="w-5 h-5 text-red-500" />;
    if (ext === 'docx') return <FileText className="w-5 h-5 text-blue-500" />;
    return <FileIcon className="w-5 h-5 text-muted-foreground" />;
  };

  const simulateUpload = (docName, file) => {
    setUploadProgress(prev => ({ ...prev, [docName]: 0 }));
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 20) + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploadProgress(prev => ({ ...prev, [docName]: 100 }));
        setUploadedDocuments(prev => ({ ...prev, [docName]: file }));
      } else {
        setUploadProgress(prev => ({ ...prev, [docName]: progress }));
      }
    }, 150);
  };

  const handleFileChange = async (docName, requirement, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedTypes.includes(file.type)) {
      setUploadErrors(prev => ({ ...prev, [docName]: "Only PDF or DOCX files are allowed." }));
      setUploadedDocuments(prev => ({ ...prev, [docName]: undefined }));
      setUploadProgress(prev => ({ ...prev, [docName]: undefined }));
      return;
    }
    setUploadErrors(prev => ({ ...prev, [docName]: undefined }));
    setUploadedDocuments(prev => ({ ...prev, [docName]: undefined }));
    
    try {
      setUploadProgress(prev => ({ ...prev, [docName]: 0 }));
      
      // If package is not created yet, store the file temporarily
      if (!createdPackageId) {
        setUploadProgress(prev => ({ ...prev, [docName]: 100 }));
        setUploadedDocuments(prev => ({ ...prev, [docName]: file }));
        return;
      }

      // If package is created, upload the file
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await regulatoryPackageService.uploadDocument(createdPackageId, formData);
      
      // Use enhanced validation service (LORENZ-compatible)
      try {
        const enhancedValidationResult = await enhancedValidationService.validateDocument(
          { file, metadata: { documentTitle: docName, country: selectedCountry } },
          'eCTD',
          getAgencyForCountry(selectedCountry)
        );
        
        // Store enhanced validation results
        setValidationResults(prev => ({
          ...prev,
          [docName]: enhancedValidationResult
        }));
        
        // Show enhanced validation results toast
        if (enhancedValidationResult.status === 'FAIL') {
          toast({
            title: "Enhanced Validation Failed",
            description: `Document failed validation with ${enhancedValidationResult.summary.criticalIssues} critical issues and ${enhancedValidationResult.summary.errors} errors.`,
            variant: "destructive",
          });
        } else if (enhancedValidationResult.status === 'WARNING') {
          toast({
            title: "Enhanced Validation Warnings",
            description: `Document has ${enhancedValidationResult.summary.warnings} warnings. Please review before submission.`,
            variant: "warning",
          });
        } else {
          toast({
            title: "Enhanced Validation Passed",
            description: "Document meets regulatory requirements.",
            variant: "success",
          });
        }
      } catch (validationError) {
        console.error('Enhanced validation failed:', validationError);
        // Fallback to basic validation if enhanced validation fails
        const validationResult = await validationService.validateDocument(response.data._id, docName.toLowerCase().replace(/\s+/g, '_'));
        setValidationResults(prev => ({
          ...prev,
          [docName]: validationResult
        }));
      }
      
      setUploadProgress(prev => ({ ...prev, [docName]: 100 }));
      setUploadedDocuments(prev => ({ ...prev, [docName]: response.data }));
    } catch (error) {
      setUploadErrors(prev => ({ ...prev, [docName]: error.message || "Failed to upload file" }));
      setUploadProgress(prev => ({ ...prev, [docName]: undefined }));
    }
  };

  const handleRemoveFile = (docName) => {
    setUploadedDocuments(prev => {
      const newDocs = { ...prev };
      delete newDocs[docName];
      return newDocs;
    });
    setUploadProgress(prev => {
      const newProg = { ...prev };
      delete newProg[docName];
      return newProg;
    });
    setUploadErrors(prev => {
      const newErrs = { ...prev };
      delete newErrs[docName];
      return newErrs;
    });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // First create the package without documents
      const packageData = {
        country: selectedCountry,
        flagCode: countryData[selectedCountry].flagCode,
        type: "Initial Submission",
        priority: "Medium",
        status: "Pending",
        documents: [], // Start with empty documents array
        createdBy: '507f1f77bcf86cd799439011', // Example MongoDB ObjectId format
        auditTrail: [{
          action: "created",
          user: '507f1f77bcf86cd799439011', // Example MongoDB ObjectId format
          timestamp: new Date().toISOString(),
          details: {
            country: selectedCountry,
            type: "Initial Submission",
            priority: "Medium"
          }
        }]
      };

      // Create the package first
      const response = await regulatoryPackageService.createPackage(packageData);
      const packageId = response.regulatoryPackage._id;
      setCreatedPackageId(packageId);

      // Upload documents with metadata
      const documentUploads = await Promise.all(
        Object.entries(uploadedDocuments).map(async ([docName, file]) => {
          if (file instanceof File) {
            const formData = new FormData();
            formData.append('file', file);
            
            // Add metadata as JSON string
            const metadata = {
              documentTitle: docName,
              version: "1.0",
              documentDate: new Date().toISOString(),
              status: "Pending",
              fileSize: file.size,
              fileFormat: file.type,
              fileName: file.name,
              uploadedBy: '507f1f77bcf86cd799439011',
              country: selectedCountry,
              type: "Initial Submission"
            };
            
            formData.append('metadata', JSON.stringify(metadata));
            
            // Upload document and get the response with fileUrl
            const uploadResponse = await regulatoryPackageService.uploadDocument(packageId, formData);
            return uploadResponse.document; // Return the complete document object from the response
          }
          return null;
        })
      );

      // Filter out any null values and update the package with document information
      const validDocuments = documentUploads.filter(doc => doc !== null);
      if (validDocuments.length > 0) {
        await regulatoryPackageService.updatePackage(packageId, {
          documents: validDocuments,
          auditTrail: [{
            action: "documents_added",
            user: '507f1f77bcf86cd799439011',
            timestamp: new Date().toISOString(),
            details: {
              documents: validDocuments.map(doc => doc.documentTitle)
            }
          }]
        });
      }
      
      toast({
        title: "Success",
        description: "Regulatory package created successfully",
      });
      
      // Reset form
      setSelectedCountry('');
      setUploadedDocuments({});
      setUploadProgress({});
      setUploadErrors({});
      setCurrentStep(1);
      
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create regulatory package. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStepChange = async (step) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setCurrentStep(step);
    setIsLoading(false);
  };

  const getRequirementBadge = (requirement) => {
    const variants = {
      Mandatory: "destructive",
      Recommended: "default",
      "If applicable": "secondary"
    };
    return (
      <Badge variant={variants[requirement] || "default"}>{requirement}</Badge>
    );
  };

  const filteredCountries = Object.entries(countryData).filter(([code, data]) => 
    data.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    data.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if all mandatory documents are uploaded
  const allMandatoryUploaded = countryData[selectedCountry]?.documents
    .filter(doc => doc.requirement === "Mandatory")
    .every(doc => uploadedDocuments[doc.document_name]);

  const handleUploadMethod = (docName, method) => {
    setSelectedUploadMethod(prev => ({ ...prev, [docName]: method }));
    
    if (method === 'upload') {
      document.getElementById(`upload-${docName}`)?.click();
    } else if (method === 'import') {
      setSelectedDocForTMF(docName);
      setShowTMFBrowser(true);
    } else if (method === 'generate') {
      setSelectedDocForGeneration(docName);
      setShowGenerator(true);
    }
  };

  const handleTMFDocumentSelect = async (document) => {
    try {
      if (!createdPackageId) {
        // If package is not created yet, create it first
        const packageData = {
          country: selectedCountry,
          flagCode: countryData[selectedCountry].flagCode,
          type: "Initial Submission",
          priority: "Medium",
          status: "Pending",
          documents: [],
          createdBy: '507f1f77bcf86cd799439011',
          auditTrail: [{
            action: "created",
            user: '507f1f77bcf86cd799439011',
            timestamp: new Date().toISOString(),
            details: {
              country: selectedCountry,
              type: "Initial Submission",
              priority: "Medium"
            }
          }]
        };

        const response = await regulatoryPackageService.createPackage(packageData);
        setCreatedPackageId(response.regulatoryPackage._id);
      }

      // Import the document
      const importResponse = await tmfService.importDocument(document.id, createdPackageId);
      
      // Update the UI
      setUploadedDocuments(prev => ({
        ...prev,
        [selectedDocForTMF]: importResponse.document
      }));
      
      setUploadProgress(prev => ({
        ...prev,
        [selectedDocForTMF]: 100
      }));

      toast({
        title: "Success",
        description: "Document imported successfully from TMF",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to import document from TMF",
        variant: "destructive",
      });
    }
  };

  const handleGeneratedDocument = (generatedContent) => {
    if (selectedDocForGeneration) {
      // Create a file from the generated content
      const file = new File(
        [generatedContent.content],
        `${selectedDocForGeneration}_${new Date().toISOString()}.txt`,
        { type: 'text/plain' }
      );

      // Simulate file upload
      handleFileChange(selectedDocForGeneration, "Mandatory", { target: { files: [file] } });
      
      // Reset states
      setShowGenerator(false);
      setSelectedDocForGeneration(null);
    }
  };

  const handleRevalidate = async (documentId) => {
    try {
      const validationResult = await validationService.validateDocument(documentId);
      setValidationResults(prev => ({
        ...prev,
        [documentId]: validationResult
      }));
      
      toast({
        title: "Revalidation Complete",
        description: `Document ${validationResult.status === 'PASS' ? 'passed' : 'failed'} validation.`,
        variant: validationResult.status === 'PASS' ? 'success' : 'destructive',
      });
    } catch (error) {
      toast({
        title: "Revalidation Failed",
        description: error.message || "Failed to revalidate document",
        variant: "destructive",
      });
    }
  };

  const handleValidate = async (docName, file) => {
    try {
      setUploadProgress(prev => ({ ...prev, [docName]: 0 }));
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock validation result
      const mockValidationResult = {
        status: Math.random() > 0.3 ? 'PASS' : (Math.random() > 0.5 ? 'WARNING' : 'FAIL'),
        summary: {
          totalIssues: Math.floor(Math.random() * 10),
          criticalIssues: Math.floor(Math.random() * 3),
          warnings: Math.floor(Math.random() * 5),
          errors: Math.floor(Math.random() * 4)
        },
        validationDetails: {
          documentInfo: {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            lastModified: new Date().toISOString(),
            documentType: docName,
            version: "1.0"
          },
          validationMetadata: {
            validationDate: new Date().toISOString(),
            validationTool: "Pinnacle21 Community",
            validationVersion: "3.1.2",
            validationRules: "CDISC SDTM v3.4",
            validationEnvironment: "Development"
          },
          issues: [
            {
              id: "SD0001",
              severity: "ERROR",
              category: "Data Structure",
              message: "Variable name 'USUBJID' is not found in the dataset",
              location: {
                dataset: "DM",
                variable: "USUBJID",
                record: null
              },
              context: "Required identifier variable for all SDTM datasets",
              recommendation: "Add USUBJID variable to the dataset",
              reference: "SDTM IG v3.4, Section 2.2.1"
            },
            {
              id: "SD0002",
              severity: "WARNING",
              category: "Data Quality",
              message: "Inconsistent date format in VISIT variable",
              location: {
                dataset: "EX",
                variable: "VISIT",
                record: "EX-001"
              },
              context: "Date format should be ISO 8601 (YYYY-MM-DD)",
              recommendation: "Standardize date format across all records",
              reference: "SDTM IG v3.4, Section 4.1.4.4"
            },
            {
              id: "SD0003",
              severity: "CRITICAL",
              category: "Compliance",
              message: "Missing required variable 'DOMAIN' in dataset",
              location: {
                dataset: "AE",
                variable: "DOMAIN",
                record: null
              },
              context: "DOMAIN is a required variable for all SDTM datasets",
              recommendation: "Add DOMAIN variable to the dataset",
              reference: "SDTM IG v3.4, Section 2.2.1"
            }
          ],
          datasetSummary: {
            DM: {
              totalRecords: 50,
              issues: 2,
              status: "WARNING"
            },
            EX: {
              totalRecords: 120,
              issues: 1,
              status: "PASS"
            },
            AE: {
              totalRecords: 85,
              issues: 3,
              status: "ERROR"
            }
          },
          complianceSummary: {
            sdtm: {
              version: "3.4",
              compliance: "PARTIAL",
              issues: 3
            },
            cdisc: {
              version: "2023-03-31",
              compliance: "PARTIAL",
              issues: 2
            },
            regulatory: {
              fda: "PARTIAL",
              pmda: "PARTIAL",
              ema: "PARTIAL"
            }
          }
        },
        recommendations: [
          {
            priority: "HIGH",
            category: "Data Structure",
            message: "Add required identifier variables (USUBJID, DOMAIN) to all datasets",
            impact: "Critical for regulatory submission",
            action: "Review SDTM IG v3.4 Section 2.2.1 for required variables"
          },
          {
            priority: "MEDIUM",
            category: "Data Quality",
            message: "Standardize date formats across all datasets to ISO 8601",
            impact: "Improves data consistency and regulatory compliance",
            action: "Update date formats in VISIT, EXSTDTC, and AESTDTC variables"
          },
          {
            priority: "HIGH",
            category: "Units",
            message: "Standardize weight measurements to kilograms",
            impact: "Ensures consistent data analysis",
            action: "Convert all weight measurements to kilograms and update VSSTRESU"
          }
        ],
        technicalDetails: {
          validationTime: "2.5 seconds",
          memoryUsage: "256MB",
          processingSteps: [
            "File parsing",
            "Structure validation",
            "Content validation",
            "Cross-dataset validation",
            "Regulatory compliance check"
          ],
          validationLog: [
            "INFO: Starting validation process",
            "INFO: Parsing dataset structure",
            "WARNING: Inconsistent date formats detected",
            "ERROR: Missing required variables",
            "INFO: Validation completed"
          ]
        }
      };
      
      // Store validation results
      setValidationResults(prev => ({
        ...prev,
        [docName]: mockValidationResult
      }));
      
      // Show validation results toast with more detailed message
      if (mockValidationResult.status === 'FAIL') {
        toast({
          title: "Validation Failed",
          description: `Document failed validation with ${mockValidationResult.summary.criticalIssues} critical issues, ${mockValidationResult.summary.errors} errors, and ${mockValidationResult.summary.warnings} warnings.`,
          variant: "destructive",
        });
      } else if (mockValidationResult.status === 'WARNING') {
        toast({
          title: "Validation Warnings",
          description: `Document has ${mockValidationResult.summary.warnings} warnings and ${mockValidationResult.summary.errors} errors. Please review before submission.`,
          variant: "warning",
        });
      } else {
        toast({
          title: "Validation Passed",
          description: `Document meets FDA requirements with ${mockValidationResult.summary.warnings} minor warnings.`,
          variant: "success",
        });
      }
      
      setUploadProgress(prev => ({ ...prev, [docName]: 100 }));
      setUploadedDocuments(prev => ({ ...prev, [docName]: file }));
      
      return mockValidationResult;
    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: "Validation Error",
        description: error.message || "Failed to validate document",
        variant: "destructive",
      });
      setUploadProgress(prev => ({ ...prev, [docName]: undefined }));
    }
  };

  const handleValidateAll = async () => {
    setIsValidationInProgress(true);
    let pass = 0, warning = 0, fail = 0;
    let detailedSummary = {
      totalDocuments: 0,
      totalIssues: 0,
      criticalIssues: 0,
      errors: 0,
      warnings: 0,
      datasetIssues: {},
      complianceIssues: [],
      recommendations: []
    };

    try {
      // Use enhanced validation for all documents
      const documentsForValidation = Object.entries(uploadedDocuments)
        .filter(([_, file]) => file)
        .map(([docName, file]) => ({
          id: docName,
          file: file instanceof File ? file : null,
          name: file instanceof File ? file.name : docName,
          metadata: {
            documentTitle: docName,
            country: selectedCountry,
            type: "Initial Submission"
          }
        }));

      if (documentsForValidation.length > 0) {
        // Show enhanced validation panel
        setShowLorenzValidation(true);
        return;
      }

      // Fallback to basic validation if no documents
      for (const [docName, file] of Object.entries(uploadedDocuments)) {
        if (file) {
          const result = await handleValidate(docName, file);
          if (result) {
            detailedSummary.totalDocuments++;
            detailedSummary.totalIssues += result.summary.totalIssues;
            detailedSummary.criticalIssues += result.summary.criticalIssues;
            detailedSummary.errors += result.summary.errors;
            detailedSummary.warnings += result.summary.warnings;

            if (result.status === 'PASS') pass++;
            else if (result.status === 'WARNING') warning++;
            else if (result.status === 'FAIL') fail++;
          }
        }
      }

      setValidationSummary({
        pass,
        warning,
        fail,
        detailedSummary
      });

      toast({
        title: "Validation Complete",
        description: `Validated ${detailedSummary.totalDocuments} documents. Found ${detailedSummary.criticalIssues} critical issues, ${detailedSummary.errors} errors, and ${detailedSummary.warnings} warnings.`,
        variant: detailedSummary.criticalIssues > 0 ? "destructive" : (detailedSummary.errors > 0 ? "warning" : "success"),
      });

    } catch (error) {
      console.error('Error validating all documents:', error);
      setValidationSummary(null);
      toast({
        title: "Validation Error",
        description: error.message || "Failed to validate documents",
        variant: "destructive",
      });
    } finally {
      setIsValidationInProgress(false);
    }
  };

  const handleLorenzValidationComplete = (results) => {
    setLorenzValidationResults(results);
    setShowLorenzValidation(false);
    
    // Update validation summary with enhanced validation results
    const summary = {
      pass: results.successfulValidations,
      fail: results.failedValidations,
      warning: 0, // Enhanced validation doesn't have a separate warning count
      detailedSummary: {
        totalDocuments: results.totalDocuments,
        totalIssues: 0,
        criticalIssues: 0,
        errors: 0,
        warnings: 0
      }
    };

    // Calculate issues from enhanced validation results
    Object.values(results.results).forEach(result => {
      summary.detailedSummary.totalIssues += result.summary.totalIssues;
      summary.detailedSummary.criticalIssues += result.summary.criticalIssues;
      summary.detailedSummary.errors += result.summary.errors;
      summary.detailedSummary.warnings += result.summary.warnings;
    });

    setValidationSummary(summary);

    toast({
      title: "Enhanced Validation Complete",
      description: `Successfully validated ${results.successfulValidations} documents using enhanced validation engine.`,
      variant: results.failedValidations > 0 ? "destructive" : "success",
    });
  };

  const handleLorenzValidationError = (error) => {
    setShowLorenzValidation(false);
    toast({
      title: "Enhanced Validation Error",
      description: error.message || "Enhanced validation failed",
      variant: "destructive",
    });
  };

  // Helper function to get agency for country
  const getAgencyForCountry = (country) => {
    const agencyMap = {
      'USA': 'FDA',
      'JAPAN': 'PMDA',
      'CANADA': 'Health-Canada',
      'UK': 'MHRA',
      'GERMANY': 'BfArM',
      'EUROPE': 'EMA'
    };
    return agencyMap[country] || 'FDA';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8">
      {/* Progress Steps */}
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={cn(
                "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200",
                currentStep >= step
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground/20 text-muted-foreground",
                "hover:scale-110 cursor-pointer"
              )}
              onClick={() => currentStep > step && handleStepChange(step)}
            >
              {currentStep > step ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : step}
            </div>
            {step < 3 && (
              <div
                className={cn(
                  "w-16 sm:w-32 h-0.5 transition-colors duration-200",
                  currentStep > step ? "bg-primary" : "bg-muted-foreground/20"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <Card className="border-none shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl sm:text-2xl font-semibold">
            {currentStep === 1 && "Select Target Country"}
            {currentStep === 2 && "Upload Required Documents"}
            {currentStep === 3 && "Review & Confirm"}
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            {currentStep === 1 && "Choose the country for which you want to create a regulatory package"}
            {currentStep === 2 && "Upload the required documents for your regulatory package (PDF or DOCX only)"}
            {currentStep === 3 && "Review your selections before creating the package"}
          </CardDescription>
        </CardHeader>
        <Separator className="mb-6" />
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search countries..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filteredCountries.map(([code, data]) => (
                        <div
                          key={code}
                          className={cn(
                            "flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all duration-200",
                            "hover:border-primary/50 hover:shadow-md",
                            "focus-within:ring-2 focus-within:ring-primary/20",
                            "active:scale-[0.98]",
                            selectedCountry === code && "border-primary bg-primary/5"
                          )}
                          onClick={() => handleCountrySelect(code)}
                        >
                          <FlagImage code={data.flagCode} className="w-10 h-7" />
                          <div className="flex-1">
                            <h3 className="font-medium">{data.name}</h3>
                            <p className="text-sm text-muted-foreground">{data.region}</p>
                          </div>
                          {selectedCountry === code && (
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={() => handleStepChange(2)}
                      disabled={!selectedCountry || isLoading}
                      className="w-32"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          Continue
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-end pt-4">
                      <Button
                        onClick={handleValidateAll}
                        disabled={isValidationInProgress || !allMandatoryUploaded}
                        className={`w-40 font-semibold rounded shadow-md transition-colors duration-200
                          ${isValidationInProgress || !allMandatoryUploaded
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'}
                        `}
                      >
                        {isValidationInProgress ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Validate All"
                        )}
                      </Button>
                    </div>
                    {countryData[selectedCountry]?.documents.map((doc) => (
                      <div key={doc.document_name} className="space-y-4">
                        <div className={cn(
                          "flex flex-col gap-2 p-4 border rounded-lg transition-all duration-200 group",
                          "hover:border-primary/50 hover:shadow-md",
                          "focus-within:ring-2 focus-within:ring-primary/20",
                          "active:scale-[0.98]"
                        )}>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{doc.document_name}</span>
                              {getRequirementBadge(doc.requirement)}
                            </div>
                            {uploadedDocuments[doc.document_name] && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={e => { e.stopPropagation(); handleRemoveFile(doc.document_name); }}
                                className="text-red-500 hover:text-red-700 remove-btn"
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{doc.description}</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="w-4 h-4" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{doc.description}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          {doc.template_link !== "N/A" && (
                            <a
                              href={doc.template_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:text-primary/80 transition-colors duration-200 flex items-center gap-1"
                            >
                              View Template
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          {/* Upload Options */}
                          <div className="flex gap-2 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUploadMethod(doc.document_name, 'import')}
                              className={cn(
                                "flex items-center gap-2",
                                selectedUploadMethod[doc.document_name] === 'import' && "border-primary"
                              )}
                            >
                              <Database className="w-4 h-4" />
                              Import from TMF
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUploadMethod(doc.document_name, 'upload')}
                              className={cn(
                                "flex items-center gap-2",
                                selectedUploadMethod[doc.document_name] === 'upload' && "border-primary"
                              )}
                            >
                              <Upload className="w-4 h-4" />
                              Upload
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUploadMethod(doc.document_name, 'generate')}
                              className={cn(
                                "flex items-center gap-2",
                                selectedUploadMethod[doc.document_name] === 'generate' && "border-primary"
                              )}
                            >
                              <Wand2 className="w-4 h-4" />
                              Generate
                            </Button>
                          </div>
                          <div className="flex items-center gap-4 mt-2 w-full">
                            <input
                              type="file"
                              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                              id={`upload-${doc.document_name}`}
                              className="hidden"
                              onChange={(e) => handleFileChange(doc.document_name, doc.requirement, e)}
                              disabled={isLoading || isSubmitting || uploadProgress[doc.document_name] > 0 && uploadProgress[doc.document_name] < 100}
                            />
                            {uploadProgress[doc.document_name] > 0 && uploadProgress[doc.document_name] < 100 && (
                              <div className="flex-1 flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Uploading...</span>
                                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="bg-primary h-2 rounded-full transition-all duration-200"
                                    style={{ width: `${uploadProgress[doc.document_name]}%` }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground">{uploadProgress[doc.document_name]}%</span>
                              </div>
                            )}
                            {uploadedDocuments[doc.document_name] && uploadProgress[doc.document_name] === 100 && (
                              <div className="flex items-center gap-2">
                                {getFileIcon(uploadedDocuments[doc.document_name])}
                                <span className="text-green-600 font-medium">
                                  {uploadedDocuments[doc.document_name].name}
                                </span>
                              </div>
                            )}
                            {uploadErrors[doc.document_name] && (
                              <span className="text-red-500 text-xs ml-2">{uploadErrors[doc.document_name]}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Validation Summary */}
                  {validationSummary && (
                    <div className="mt-6 p-4 border rounded-lg bg-muted/50">
                      <div className="flex flex-col items-center">
                        <div className="text-lg font-semibold mb-4">Validation Summary</div>
                        <div className="grid grid-cols-4 gap-6 mb-4 w-full max-w-3xl">
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{validationSummary.pass}</div>
                            <div className="text-sm text-green-700">Passed</div>
                          </div>
                          <div className="text-center p-3 bg-yellow-50 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-600">{validationSummary.warning}</div>
                            <div className="text-sm text-yellow-700">Warnings</div>
                          </div>
                          <div className="text-center p-3 bg-red-50 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">{validationSummary.fail}</div>
                            <div className="text-sm text-red-700">Failed</div>
                          </div>
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{validationSummary.detailedSummary?.totalDocuments || 0}</div>
                            <div className="text-sm text-blue-700">Total Documents</div>
                          </div>
                        </div>
                        <div className="w-full max-w-3xl">
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="p-3 bg-red-50 rounded-lg text-center">
                              <div className="text-xl font-bold text-red-600">{validationSummary.detailedSummary?.criticalIssues || 0}</div>
                              <div className="text-sm text-red-700">Critical Issues</div>
                            </div>
                            <div className="p-3 bg-orange-50 rounded-lg text-center">
                              <div className="text-xl font-bold text-orange-600">{validationSummary.detailedSummary?.errors || 0}</div>
                              <div className="text-sm text-orange-700">Errors</div>
                            </div>
                            <div className="p-3 bg-yellow-50 rounded-lg text-center">
                              <div className="text-xl font-bold text-yellow-600">{validationSummary.detailedSummary?.warnings || 0}</div>
                              <div className="text-sm text-yellow-700">Warnings</div>
                            </div>
                          </div>
                          {validationSummary.detailedSummary?.recommendations && validationSummary.detailedSummary.recommendations.length > 0 && (
                            <div className="mt-4">
                              <h4 className="font-medium mb-2">Key Recommendations</h4>
                              <div className="space-y-2">
                                {validationSummary.detailedSummary.recommendations.slice(0, 3).map((rec, index) => (
                                  <div key={index} className="p-3 bg-white rounded-lg border">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge variant={rec.priority === 'HIGH' ? 'destructive' : 'warning'}>
                                        {rec.priority}
                                      </Badge>
                                      <span className="font-medium">{rec.category}</span>
                                    </div>
                                    <p className="text-sm">{rec.message}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={() => handleStepChange(1)}
                      className="w-32"
                      disabled={isLoading}
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      onClick={() => handleStepChange(3)}
                      disabled={!allMandatoryUploaded || isLoading}
                      className="w-32"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          Continue
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <h3 className="font-medium mb-2">Selected Country</h3>
                      <div className="flex items-center gap-3">
                        <FlagImage code={countryData[selectedCountry]?.flagCode} className="w-12 h-8" />
                        <div>
                          <p className="font-medium">{countryData[selectedCountry]?.name}</p>
                          <p className="text-sm text-muted-foreground">{countryData[selectedCountry]?.region}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <h3 className="font-medium mb-4">Selected Documents</h3>
                      <ul className="space-y-3">
                        {Object.entries(uploadedDocuments)
                          .filter(([_, file]) => file)
                          .map(([docName]) => (
                            <li key={docName} className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-primary" />
                              <span>{docName}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={() => handleStepChange(2)}
                      className="w-32"
                      disabled={isSubmitting}
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button 
                      onClick={handleSubmit}
                      className="w-32"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Create Package"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {showGenerator && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <DocumentGenerator
              onDocumentGenerated={handleGeneratedDocument}
              documentType={selectedDocForGeneration}
            />
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => {
                setShowGenerator(false);
                setSelectedDocForGeneration(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {showTMFBrowser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <TMFDocumentBrowser
              onDocumentSelect={handleTMFDocumentSelect}
              onClose={() => {
                setShowTMFBrowser(false);
                setSelectedDocForTMF(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Enhanced Validation Panel Modal */}
      {showLorenzValidation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Enhanced Validation Engine</h2>
              <Button
                variant="outline"
                onClick={() => setShowLorenzValidation(false)}
              >
                Close
              </Button>
            </div>
            <LorenzValidationPanel
              documents={Object.entries(uploadedDocuments)
                .filter(([_, file]) => file)
                .map(([docName, file]) => ({
                  id: docName,
                  file: file instanceof File ? file : null,
                  name: file instanceof File ? file.name : docName,
                  metadata: {
                    documentTitle: docName,
                    country: selectedCountry,
                    type: "Initial Submission"
                  }
                }))}
              targetCountry={selectedCountry}
              packageId={createdPackageId}
              onValidationComplete={handleLorenzValidationComplete}
              onValidationError={handleLorenzValidationError}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateRegulatoryPackage; 