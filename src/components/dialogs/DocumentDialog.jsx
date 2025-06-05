import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Upload, Loader2 } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast"
import tmfService from '../../services/tmf.serivce';
import { artifactSubartifacts } from '@/data/artifactSubartifacts';

// Section mapping
const sectionMapping = {
  "01.01": "Trial Oversight",
  "01.02": "Trial Team",
  "01.03": "Trial Committee",
  "01.04": "Meetings",
  "01.05": "General",
  "02.01": "Product and Trial Documentation",
  "02.02": "Subject Documentation",
  "02.03": "Reports",
  "02.04": "General",
  "03.01": "Trial Approval",
  "03.02": "Investigational Medicinal Product",
  "03.03": "Trial Status Reporting",
  "03.04": "General",
  "04.01": "IRB or IEC Trial Approval",
  "04.02": "Other Committees",
  "04.03": "Trial Status Reporting",
  "04.04": "General",
  "05.01": "Site Selection",
  "05.02": "Site Set-up",
  "05.03": "Site Initiation",
  "05.04": "Site Management",
  "05.05": "General",
  "06.01": "IP Documentation",
  "06.02": "IP Release Process Documentation",
  "06.03": "IP Allocation Documentation",
  "06.04": "Storage",
  "06.05": "Non-IP Documentation",
  "06.06": "Interactive Response Technology",
  "06.07": "General",
  "07.01": "Safety Documentation",
  "07.02": "Trial Status Reporting",
  "07.03": "General",
  "08.01": "Facility Documentation",
  "08.02": "Sample Documentation",
  "08.03": "General",
  "09.01": "Third Party Oversight",
  "09.02": "Third Party Set-up",
  "09.03": "General",
  "10.01": "Data Management Oversight",
  "10.02": "Data Capture",
  "10.03": "Database",
  "10.04": "EDC Management",
  "10.05": "General",
  "11.01": "Statistics Oversight",
  "11.02": "Randomization",
  "11.03": "Analysis",
  "11.04": "Report",
  "11.05": "General"
};

// Predefined list of zone names
const zoneNames = [
  "Central Trial Documents",
  "Site Management",
  "Statistics",
  "Regulatory",
  "IRB or IEC and other Approvals",
  "Trial Management",
  "IP and Trial Supplies",
  "Safety Reporting",
  "Central and Local Testing",
  "Third parties",
  "Data Management"
];

// Predefined list of section names
const sectionNames = [
  "Product and Trial Documentation",
  "Site Set-up",
  "Statistics Oversight",
  "Randomization",
  "Analysis",
  "Report",
  "General",
  "Subject Documentation",
  "Trial Approval",
  "Other Committees",
  "IRB or IEC Trial Approval",
  "Trial Status Reporting",
  "Trial Team",
  "Trial Committee",
  "Meetings",
  "Trial Oversight",
  "Reports",
  "Investigational Medicinal Product",
  "Site Selection",
  "Site Initiation",
  "Site Management",
  "IP Documentation",
  "IP Release Process Documentation",
  "IP Allocation Documentation",
  "Storage",
  "Non-IP Documentation",
  "Interactive Response Technology",
  "Safety Documentation",
  "Facility Documentation",
  "Sample Documentation",
  "Third Party Oversight",
  "Third Party Set-up",
  "Data Management Oversight",
  "Data Capture",
  "Database",
  "EDC Management"
];

// Predefined list of artifact names
const artifactNames = [
  "Trial Master File Plan",
  "Trial Management Plan",
  "Quality Plan",
  "List of SOPs Current During Trial",
  "Operational Procedure Manual",
  "Recruitment Plan",
  "Communication Plan",
  "Monitoring Plan",
  "Medical Monitoring Plan",
  "Publication Policy",
  "Debarment Statement",
  "Trial Status Report",
  "Investigator Newsletter",
  "Audit Certificate",
  "Filenote Master List",
  "Risk Management Plan",
  "Vendor Management Plan",
  "Roles and Responsibility Matrix",
  "Transfer of Regulatory Obligations",
  "Operational Oversight",
  "Trial Team Details",
  "Trial Team Curriculum Vitae",
  "Committee Process",
  "Committee Member List",
  "Committee Output",
  "Committee Member Curriculum Vitae",
  "Committee Member Financial Disclosure Form",
  "Committee Member Contract",
  "Committee Member Confidentiality Disclosure Agreement",
  "Kick-off Meeting Material",
  "Trial Team Training Material",
  "Investigators Meeting Material",
  "Trial Team Evidence of Training",
  "Relevant Communications",
  "Tracking Information",
  "Other Meeting Material",
  "Filenote",
  "Investigator's Brochure",
  "Protocol",
  "Protocol Synopsis",
  "Protocol Amendment",
  "Financial Disclosure Summary",
  "Insurance",
  "Sample Case Report Form",
  "Report of Prior Investigations",
  "Marketed Product Material",
  "Subject Diary",
  "Subject Questionnaire",
  "Informed Consent Form",
  "Subject Information Sheet",
  "Subject Participation Card",
  "Advertisements for Subject Recruitment",
  "Other Information Given to Subjects",
  "Clinical Study Report",
  "Bioanalytical Report",
  "Regulatory Submission",
  "Regulatory Authority Decision",
  "Notification of Regulatory Identification Number",
  "Public Registration",
  "Import or Export License Application",
  "Import or Export Documentation",
  "Notification of Safety or Trial Information",
  "Regulatory Progress Report",
  "Regulatory Notification of Trial Termination",
  "IRB or IEC Submission",
  "IRB or IEC Decision",
  "IRB or IEC Composition",
  "IRB or IEC Documentation of Non-Voting Status",
  "IRB or IEC Compliance Documentation",
  "Other Submissions",
  "Other Approvals",
  "Notification to IRB or IEC of Safety Information",
  "IRB or IEC Progress Report",
  "IRB or IEC Notification of Trial Termination",
  "Site Contact Details",
  "Confidentiality Agreement",
  "Feasibility Documentation",
  "Pre Trial Monitoring Report",
  "Sites Evaluated but not Selected",
  "Acceptance of Investigator Brochure",
  "Protocol Signature Page",
  "Protocol Amendment Signature Page",
  "Principal Investigator Curriculum Vitae",
  "Sub-Investigator Curriculum Vitae",
  "Other Curriculum Vitae",
  "Site Staff Qualification Supporting Information",
  "Form FDA 1572",
  "Investigator Regulatory Agreement",
  "Financial Disclosure Form",
  "Data Privacy Agreement",
  "Clinical Trial Agreement",
  "Indemnity",
  "Other Financial Agreement",
  "IP Site Release Documentation",
  "Site Signature Sheet",
  "Investigators Agreement (Device)",
  "Coordinating Investigator Documentation",
  "Trial Initiation Monitoring Report",
  "Site Training Material",
  "Site Evidence of Training",
  "Subject Log",
  "Source Data Verification",
  "Monitoring Visit Report",
  "Visit Log",
  "Additional Monitoring Activity",
  "Protocol Deviations",
  "Financial Documentation",
  "Final Trial Close Out Monitoring Report",
  "Notification to Investigators of Safety Information",
  "Subject Identification Log",
  "Source Data",
  "Monitoring Visit Follow-up Documentation",
  "Subject Eligibility Verification Forms and Worksheets",
  "IP Supply Plan",
  "IP Instructions for Handling",
  "IP Sample Label",
  "IP Shipment Documentation",
  "IP Accountability Documentation",
  "IP Transfer Documentation",
  "IP Re-labeling Documentation",
  "IP Recall Documentation",
  "IP Quality Complaint Form",
  "IP Return Documentation",
  "IP Certificate of Destruction",
  "IP Retest and Expiry Documentation",
  "QP (Qualified Person) Certification",
  "IP Regulatory Release Documentation",
  "IP Verification Statements",
  "Certificate of Analysis",
  "IP Treatment Allocation Documentation",
  "IP Unblinding Plan",
  "IP Treatment Decoding Documentation",
  "IP Storage Condition Documentation",
  "IP Storage Condition Excursion Documentation",
  "Maintenance Logs",
  "Non-IP Supply Plan",
  "Non-IP Shipment Documentation",
  "Non-IP Return Documentation",
  "Non-IP Storage Documentation",
  "IRT User Requirement Specification",
  "IRT Validation Certification",
  "IRT User Acceptance Testing (UAT) Certification",
  "IRT User Manual",
  "IRT User Account Management",
  "Safety Management Plan",
  "Pharmacovigilance Database Line Listing",
  "Expedited Safety Report",
  "SAE Report",
  "Pregnancy Report",
  "Special Events of Interest",
  "Certification or Accreditation",
  "Laboratory Validation Documentation",
  "Laboratory Results Documentation",
  "Normal Ranges",
  "Manual",
  "Supply Import Documentation",
  "Head of Facility Curriculum Vitae",
  "Standardization Methods",
  "Specimen Label",
  "Shipment Records",
  "Sample Storage Condition Log",
  "Sample Import or Export Documentation",
  "Record of Retained Samples",
  "Qualification and Compliance",
  "Third Party Curriculum Vitae",
  "Ongoing Third Party Oversight",
  "Confidentiality Agreement",
  "Vendor Selection",
  "Contractual Agreement",
  "Data Management Plan",
  "CRF Completion Requirements",
  "Annotated CRF",
  "Documentation of Corrections to Entered Data",
  "Final Subject Data",
  "Database Requirements",
  "Edit Check Plan",
  "Edit Check Programming",
  "Edit Check Testing",
  "Approval for Database Activation",
  "External Data Transfer Specifications",
  "Data Entry Guidelines (Paper)",
  "SAE Reconciliation",
  "Dictionary Coding",
  "Data Review Documentation",
  "Database Lock and Unlock Approval",
  "Database Change Control",
  "System Account Management",
  "Technical Design Document",
  "Validation Documentation",
  "Statistical Analysis Plan",
  "Sample Size Calculation",
  "Randomization Plan",
  "Randomization Procedure",
  "Master Randomization List",
  "Randomization Programming",
  "Randomization Sign Off",
  "End of Trial or Interim Unblinding",
  "Data Definitions for Analysis Datasets",
  "Analysis QC Documentation",
  "Interim Analysis Raw Datasets",
  "Interim Analysis Programs",
  "Interim Analysis Datasets",
  "Interim Analysis Output",
  "Final Analysis Raw Datasets",
  "Final Analysis Programs",
  "Final Analysis Datasets",
  "Final Analysis Output",
  "Subject Evaluability Criteria and Subject Classification",
  "Interim Statistical Report(s)",
  "Statistical Report"
];

// Predefined list of sub-artifact names
const subArtifactNames = [
  "Version 1.0",
  "Version 2.0",
  "Version 3.0",
  "Draft",
  "Final",
  "Approved",
  "Pending Review",
  "Under Review",
  "Revision 1",
  "Revision 2",
  "Revision 3",
  "Initial Submission",
  "Updated Submission",
  "Final Submission",
  "Interim Report",
  "Final Report",
  "Annual Report",
  "Quarterly Report",
  "Monthly Report",
  "Weekly Report",
  "Daily Report",
  "Summary Report",
  "Detailed Report",
  "Technical Report",
  "Progress Report",
  "Status Report",
  "Compliance Report",
  "Quality Report",
  "Safety Report",
  "Efficacy Report"
];

// Predefined list of section numbers
const sectionNumbers = [
  "01.01", "01.02", "01.03", "01.04", "01.05",
  "02.01", "02.02", "02.03", "02.04",
  "03.01", "03.02", "03.03", "03.04",
  "04.01", "04.02", "04.03", "04.04",
  "05.01", "05.02", "05.03", "05.04", "05.05",
  "06.01", "06.02", "06.03", "06.04", "06.05", "06.06", "06.07",
  "07.01", "07.02", "07.03",
  "08.01", "08.02", "08.03",
  "09.01", "09.02", "09.03",
  "10.01", "10.02", "10.03", "10.04", "10.05",
  "11.01", "11.02", "11.03", "11.04", "11.05"
];

const DocumentDialog = ({ 
  open, 
  initialSelectedItem,
  onClose, 
  onSubmit 
}) => {
  // File state management
  const [fileState, setFileState] = useState({
    file: null,
    fileName: '',
    fileSize: 0,
    fileType: '',
    error: ''
  });

  // Add state to track if document info should be shown
  const [showDocumentInfo, setShowDocumentInfo] = useState(false);

  const { toast } = useToast()

  // Hierarchy state management
  const [hierarchyState, setHierarchyState] = useState({
    zones: [],
    sections: {},
    artifacts: {},
    subArtifacts: {},
    loading: {
      zones: false,
      sections: false,
      artifacts: false,
      subArtifacts: false
    }
  });

  // Selected hierarchy tracking
  const [selectedHierarchy, setSelectedHierarchy] = useState({
    zone: null,
    section: null,
    artifact: null,
    subArtifact: null
  });

  // Form management with react-hook-form
  const { 
    register, 
    handleSubmit, 
    reset, 
    control,
    setValue,
    formState: { errors, isSubmitting }, 
    watch 
  } = useForm({
    defaultValues: {
      documentTitle: '',
      description: '',
      documentType: '',
      tmfReference: '',
      effectiveDate: null,
      expirationDate: null,
      accessLevel: 'Restricted',
      version: '1.0',
      study: '',
      site: '',
      country: '',
      indication: '',
      mimeType: '',
      pageCount: '',
      language: 'en',
      documentDate: null,
      approvalDate: null,
      author: '',
      contributors: [],
      qualityControlStatus: 'PENDING',
      completenessStatus: 'PENDING_REVIEW',
      archivalStatus: 'ACTIVE',
      regulatoryAuthority: '',
      gcpComplianceStatus: 'PENDING_REVIEW',
      retentionDuration: '',
      retentionStartDate: null,
      retentionEndDate: null,
      // Zone fields
      zoneNumber: '',
      zoneName: '',
      zoneDescription: '',
      // Section fields
      sectionNumber: '',
      sectionName: '',
      sectionDescription: '',
      // Artifact fields
      artifactNumber: '',
      artifactName: '',
      artifactDescription: '',
      mandatory: false,
      // Document fields
      status: 'Draft',
      uploadDate: new Date()
    }
  });

  // Watchers for dynamic form updates
  const accessLevel = watch('accessLevel');
  const effectiveDate = watch('effectiveDate');
  const expirationDate = watch('expirationDate');

  // Add watchers for artifactNumber and subArtifactName
  const artifactNumber = watch('artifactNumber');
  const subArtifactName = watch('subArtifactName');

  // Add watchers for sectionNumber
  const sectionNumber = watch('sectionNumber');

  // Effect to handle section number changes
  useEffect(() => {
    if (sectionNumber && sectionMapping[sectionNumber]) {
      setValue('sectionName', sectionMapping[sectionNumber]);
    }
  }, [sectionNumber, setValue]);

  // Effect to handle artifact number changes
  useEffect(() => {
    if (artifactNumber && artifactSubartifacts[artifactNumber]) {
      setValue('artifactName', artifactSubartifacts[artifactNumber].name);
      // Reset sub-artifact when artifact changes
      setValue('subArtifactName', '');
    }
  }, [artifactNumber, setValue]);

  // Effect to handle initialSelectedItem changes
  useEffect(() => {
    console.log('DocumentDialog - initialSelectedItem:', initialSelectedItem);
    
    if (open && initialSelectedItem) {
      // Reset form first
      reset();
      
      // Auto-fill zone information if available
      if (initialSelectedItem.type === 'zone') {
        const zoneData = initialSelectedItem.item || initialSelectedItem;
        console.log('Setting zone values:', {
          zoneNumber: zoneData.zoneNumber,
          zoneName: zoneData.zoneName
        });
        
        setValue('zoneNumber', zoneData.zoneNumber);
        setValue('zoneName', zoneData.zoneName);
      }
    }
  }, [open, initialSelectedItem, setValue, reset]);

  // Add a watcher to see the current form values
  const zoneName = watch('zoneName');
  const zoneNumber = watch('zoneNumber');

  useEffect(() => {
    console.log('Current form values:', { zoneName, zoneNumber });
  }, [zoneName, zoneNumber]);

  // Initial data loading effect
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch zones
        setHierarchyState(prev => ({ 
          ...prev, 
          loading: { ...prev.loading, zones: true } 
        }));
        const zones = await tmfService.zones.getAll();
        
        setHierarchyState(prev => ({ 
          ...prev, 
          zones, 
          loading: { ...prev.loading, zones: false } 
        }));

        // Handle initial selection if provided
        if (initialSelectedItem && initialSelectedItem.type && initialSelectedItem.item) {
          const { type, item } = initialSelectedItem;
          
          // Set initial hierarchy based on the selected item type
          switch (type) {
            case 'zone':
              setSelectedHierarchy(prev => ({ ...prev, zone: item }));
              if (item._id) {
                await handleZoneChange(item._id);
              }
              break;
            case 'section':
              if (item.zone && item.zone._id) {
                setSelectedHierarchy(prev => ({ 
                  ...prev, 
                  zone: item.zone,
                  section: item 
                }));
                await handleZoneChange(item.zone._id);
                if (item._id) {
                  await handleSectionChange(item._id);
                }
              }
              break;
            case 'artifact':
              if (item.section && item.section.zone && item.section.zone._id) {
                setSelectedHierarchy(prev => ({ 
                  ...prev, 
                  zone: item.section.zone,
                  section: item.section,
                  artifact: item 
                }));
                await handleZoneChange(item.section.zone._id);
                if (item.section._id) {
                  await handleSectionChange(item.section._id);
                }
                if (item._id) {
                  await handleArtifactChange(item._id);
                }
              }
              break;
            case 'subArtifact':
              if (item.artifact && item.artifact.section && item.artifact.section.zone && item.artifact.section.zone._id) {
                setSelectedHierarchy(prev => ({ 
                  ...prev, 
                  zone: item.artifact.section.zone,
                  section: item.artifact.section,
                  artifact: item.artifact,
                  subArtifact: item 
                }));
                await handleZoneChange(item.artifact.section.zone._id);
                if (item.artifact.section._id) {
                  await handleSectionChange(item.artifact.section._id);
                }
                if (item.artifact._id) {
                  await handleArtifactChange(item.artifact._id);
                }
              }
              break;
          }
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast({
          title: "Error",
          description: "Failed to load initial data",
          variant: "destructive"
        });
        setHierarchyState(prev => ({ 
          ...prev, 
          loading: { ...prev.loading, zones: false } 
        }));
      }
    };

    if (open) {
      fetchInitialData();
    }
  }, [open, initialSelectedItem]);

  // Hierarchy change handlers
  const handleZoneChange = async (zoneId) => {
    if (!zoneId) return;
    
    try {
      setHierarchyState(prev => ({ 
        ...prev, 
        loading: { ...prev.loading, sections: true },
        sections: {},
        artifacts: {},
        subArtifacts: {}
      }));

      const sections = await tmfService.sections.getAllByZone(zoneId);
      
      setHierarchyState(prev => ({ 
        ...prev, 
        sections: { [zoneId]: sections }, 
        loading: { ...prev.loading, sections: false } 
      }));

      // Reset dependent selections
      setSelectedHierarchy(prev => ({ 
        ...prev, 
        section: null,
        artifact: null,
        subArtifact: null 
      }));
    } catch (error) {
      console.error("Error fetching sections:", error);
      toast({
        title: "Error",
        description: "Failed to load sections",
        variant: "destructive"
      });
      setHierarchyState(prev => ({ 
        ...prev, 
        loading: { ...prev.loading, sections: false } 
      }));
    }
  };

  const handleSectionChange = async (sectionId) => {
    if (!sectionId) return;
    
    try {
      setHierarchyState(prev => ({ 
        ...prev, 
        loading: { ...prev.loading, artifacts: true },
        artifacts: {},
        subArtifacts: {}
      }));

      const artifacts = await tmfService.artifacts.getAllBySection(sectionId);
      
      setHierarchyState(prev => ({ 
        ...prev, 
        artifacts: { [sectionId]: artifacts }, 
        loading: { ...prev.loading, artifacts: false } 
      }));

      // Reset dependent selections
      setSelectedHierarchy(prev => ({ 
        ...prev, 
        artifact: null,
        subArtifact: null 
      }));
    } catch (error) {
      console.error("Error fetching artifacts:", error);
      toast({
        title: "Error",
        description: "Failed to load artifacts",
        variant: "destructive"
      });
      setHierarchyState(prev => ({ 
        ...prev, 
        loading: { ...prev.loading, artifacts: false } 
      }));
    }
  };

  const handleArtifactChange = async (artifactId) => {
    if (!artifactId) return;
    
    try {
      setHierarchyState(prev => ({ 
        ...prev, 
        loading: { ...prev.loading, subArtifacts: true },
        subArtifacts: {}
      }));

      const subArtifacts = await tmfService.subArtifacts.getAllByArtifact(artifactId);
      
      setHierarchyState(prev => ({ 
        ...prev, 
        subArtifacts: { [artifactId]: subArtifacts }, 
        loading: { ...prev.loading, subArtifacts: false } 
      }));

      // Reset dependent selections
      setSelectedHierarchy(prev => ({ 
        ...prev, 
        subArtifact: null 
      }));
    } catch (error) {
      console.error("Error fetching sub-artifacts:", error);
      toast({
        title: "Error",
        description: "Failed to load sub-artifacts",
        variant: "destructive"
      });
      setHierarchyState(prev => ({ 
        ...prev, 
        loading: { ...prev.loading, subArtifacts: false } 
      }));
    }
  };

  const handleAccessLevelChange = (value) => {
    setValue('accessLevel', value);
  };

  const handleEffectiveDateChange = (date) => {
    setValue('effectiveDate', date);
  };

  const handleExpirationDateChange = (date) => {
    setValue('expirationDate', date);
  };

  // File upload handler
  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    
    if (selectedFile) {
      // Set max file size to 50MB
      const maxSize = 50 * 1024 * 1024; 
      
      if (selectedFile.size > maxSize) {
        setFileState({
          file: null,
          fileName: '',
          fileSize: 0,
          fileType: '',
          error: 'File size exceeds 50MB limit'
        });
        setShowDocumentInfo(false);
        return;
      }
      
      // Update document type based on file extension
      const fileExtension = selectedFile.name.split('.').pop().toUpperCase();
      if (['PDF', 'DOCX', 'XLSX', 'PPTX', 'TXT'].includes(fileExtension)) {
        setValue('documentType', fileExtension);
      }
      
      setFileState({
        file: selectedFile,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        error: ''
      });

      // Show document info section
      setShowDocumentInfo(true);

      // Populate document information based on file
      try {
        // Set basic document information
        setValue('documentTitle', selectedFile.name.split('.')[0]); // Use filename without extension as title
        setValue('mimeType', selectedFile.type);
        setValue('documentDate', new Date().toISOString().split('T')[0]); // Set current date as document date
        setValue('uploadDate', new Date().toISOString().split('T')[0]);
        
        // If it's a PDF, try to get page count
        if (selectedFile.type === 'application/pdf') {
          // You would need to implement a PDF page count function here
          // For now, we'll set it to null
          setValue('pageCount', null);
        }

        // Set default language to English
        setValue('language', 'en');

        // Set default status to DRAFT
        setValue('status', 'DRAFT');

        // Set default version to 1.0
        setValue('version', '1.0');

        // Set default quality control status
        setValue('qualityControlStatus', 'PENDING');
        setValue('completenessStatus', 'PENDING_REVIEW');
        setValue('archivalStatus', 'ACTIVE');

        // Set default GCP compliance status
        setValue('gcpComplianceStatus', 'PENDING_REVIEW');

      } catch (error) {
        console.error("Error populating document information:", error);
        toast({
          title: "Error",
          description: "Failed to populate document information",
          variant: "destructive"
        });
      }
    }
  };

  // Form submission handler
  const submitForm = async (data) => {
    if (!fileState.file) {
      toast({
        title: "Error",
        description: "Please upload a document file",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Prepare document data to match schema
      const documentData = {
        // Zone Information
        zoneNumber: data.zoneNumber,
        zoneName: data.zoneName,
        zoneDescription: data.zoneDescription,
        
        // Section Information
        sectionNumber: data.sectionNumber,
        sectionName: data.sectionName,
        sectionDescription: data.sectionDescription,
        
        // Artifact Information
        artifactNumber: data.artifactNumber,
        artifactName: data.artifactName,
        artifactDescription: data.artifactDescription,
        mandatory: data.mandatory,
        
        // Document Information
        version: data.version,
        status: data.status,
        uploadDate: new Date(data.uploadDate),
        
        // File Information
        fileName: fileState.fileName,
        fileSize: fileState.fileSize,
        fileFormat: fileState.fileType,
        
        // File object for upload
        file: fileState.file
      };
      
      // Call onSubmit with the prepared document data
      await onSubmit(documentData);
      
      // Reset form after successful submission
      resetForm();
    } catch (error) {
      console.error("Document submission error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create document",
        variant: "destructive"
      });
    }
  };

  // Form reset handler
  const resetForm = () => {
    reset();
    setFileState({
      file: null,
      fileName: '',
      fileSize: 0,
      fileType: '',
      error: ''
    });
    setShowDocumentInfo(false);
    setSelectedHierarchy({
      zone: null,
      section: null,
      artifact: null,
      subArtifact: null
    });
    setHierarchyState(prev => ({
      ...prev,
      sections: {},
      artifacts: {},
      subArtifacts: {}
    }));
    onClose();
  };

  // File size formatting utility
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={resetForm}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold">Create New Document</DialogTitle>
          <DialogDescription className="text-base">
            Add a new document to the selected location
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(submitForm)} className="space-y-6">
          {/* Zone Information Section */}
          <div className="space-y-4 bg-gray-50/50 p-6 rounded-lg border border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-semibold">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Zone Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="zoneNumber" className="text-sm font-medium text-gray-700">Zone Number</Label>
                <Input
                  id="zoneNumber"
                  placeholder="e.g., 1"
                  className="h-10"
                  {...register('zoneNumber', { required: 'Zone number is required' })}
                />
                {errors.zoneNumber && (
                  <p className="text-sm text-red-500 mt-1">{errors.zoneNumber.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="zoneName" className="text-sm font-medium text-gray-700">Zone Name</Label>
                <Input
                  id="zoneName"
                  placeholder="e.g., Trial Management"
                  className="h-10"
                  {...register('zoneName', { required: 'Zone name is required' })}
                />
                {errors.zoneName && (
                  <p className="text-sm text-red-500 mt-1">{errors.zoneName.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="zoneDescription" className="text-sm font-medium text-gray-700">Zone Description</Label>
              <Input
                id="zoneDescription"
                placeholder="e.g., High-level category"
                className="h-10"
                {...register('zoneDescription')}
              />
            </div>
          </div>

          {/* Section Information */}
          <div className="space-y-4 bg-gray-50/50 p-6 rounded-lg border border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-semibold">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Section Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="sectionNumber" className="text-sm font-medium text-gray-700">Section Number</Label>
                <Select
                  value={watch('sectionNumber')}
                  onValueChange={(value) => setValue('sectionNumber', value)}
                >
                  <SelectTrigger id="sectionNumber" className="h-10">
                    <SelectValue placeholder="Select section number" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(sectionMapping).map((number) => (
                      <SelectItem key={number} value={number}>
                        {number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.sectionNumber && (
                  <p className="text-sm text-red-500 mt-1">{errors.sectionNumber.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sectionName" className="text-sm font-medium text-gray-700">Section Name</Label>
                <Input
                  id="sectionName"
                  placeholder="e.g., Trial Oversight"
                  className="h-10"
                  {...register('sectionName', { required: 'Section name is required' })}
                  readOnly
                />
                {errors.sectionName && (
                  <p className="text-sm text-red-500 mt-1">{errors.sectionName.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sectionDescription" className="text-sm font-medium text-gray-700">Section Description</Label>
              <Input
                id="sectionDescription"
                placeholder="e.g., Sub-category"
                className="h-10"
                {...register('sectionDescription')}
              />
            </div>
          </div>
          
          {/* Artifact Information */}
          <div className="space-y-4 bg-gray-50/50 p-6 rounded-lg border border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600 font-semibold">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Artifact Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="artifactNumber" className="text-sm font-medium text-gray-700">Artifact Number</Label>
                <Select
                  value={watch('artifactNumber')}
                  onValueChange={(value) => setValue('artifactNumber', value)}
                >
                  <SelectTrigger id="artifactNumber" className="h-10">
                    <SelectValue placeholder="Select artifact number" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(artifactSubartifacts).map((number) => (
                      <SelectItem key={number} value={number}>
                        {number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.artifactNumber && (
                  <p className="text-sm text-red-500 mt-1">{errors.artifactNumber.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="artifactName" className="text-sm font-medium text-gray-700">Artifact Name</Label>
                <Input
                  id="artifactName"
                  placeholder="e.g., Trial Management Plan"
                  className="h-10"
                  {...register('artifactName', { required: 'Artifact name is required' })}
                  readOnly
                />
                {errors.artifactName && (
                  <p className="text-sm text-red-500 mt-1">{errors.artifactName.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subArtifactName" className="text-sm font-medium text-gray-700">Sub-Artifact</Label>
              <Select
                value={watch('subArtifactName')}
                onValueChange={(value) => setValue('subArtifactName', value)}
                disabled={!artifactNumber}
              >
                <SelectTrigger id="subArtifactName" className="h-10">
                  <SelectValue placeholder="Select sub-artifact" />
                </SelectTrigger>
                <SelectContent>
                  {artifactNumber && artifactSubartifacts[artifactNumber]?.subartifacts.map((subArtifact) => (
                    <SelectItem key={subArtifact} value={subArtifact}>
                      {subArtifact}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.subArtifactName && (
                <p className="text-sm text-red-500 mt-1">{errors.subArtifactName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="artifactDescription" className="text-sm font-medium text-gray-700">Artifact Description</Label>
              <Input
                id="artifactDescription"
                placeholder="e.g., Document expected here"
                className="h-10"
                {...register('artifactDescription')}
              />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="mandatory"
                {...register('mandatory')}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="mandatory" className="text-sm font-medium text-gray-700">Mandatory Document</Label>
            </div>
          </div>
          
          {/* Document Information - Only show when file is uploaded */}
          {showDocumentInfo && (
            <div className="space-y-4 bg-gray-50/50 p-6 rounded-lg border border-gray-100">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="text-orange-600 font-semibold">4</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Document Information</h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="documentType" className="text-sm font-medium text-gray-700">Document Type</Label>
                  <Select 
                    value={watch('documentType')} 
                    onValueChange={(value) => setValue('documentType', value)}
                  >
                    <SelectTrigger id="documentType" className="h-10">
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PROTOCOL">Protocol</SelectItem>
                      <SelectItem value="INVESTIGATOR_BROCHURE">Investigator Brochure</SelectItem>
                      <SelectItem value="INFORMED_CONSENT">Informed Consent</SelectItem>
                      <SelectItem value="REGULATORY_DOCUMENT">Regulatory Document</SelectItem>
                      <SelectItem value="CLINICAL_REPORT">Clinical Report</SelectItem>
                      <SelectItem value="SAFETY_REPORT">Safety Report</SelectItem>
                      <SelectItem value="QUALITY_DOCUMENT">Quality Document</SelectItem>
                      <SelectItem value="TRAINING_DOCUMENT">Training Document</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tmfReference" className="text-sm font-medium text-gray-700">TMF Reference</Label>
                  <Input
                    id="tmfReference"
                    placeholder="Enter TMF reference"
                    className="h-10"
                    {...register('tmfReference', { required: 'TMF reference is required' })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="version" className="text-sm font-medium text-gray-700">Version</Label>
                  <Input
                    id="version"
                    placeholder="e.g., 1.0"
                    className="h-10"
                    {...register('version', { required: 'Version is required' })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium text-gray-700">Status</Label>
                  <Select 
                    value={watch('status')} 
                    onValueChange={(value) => setValue('status', value)}
                  >
                    <SelectTrigger id="status" className="h-10">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="IN_REVIEW">In Review</SelectItem>
                      <SelectItem value="IN_QC">In QC</SelectItem>
                      <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                      <SelectItem value="EXPIRED">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="documentDate" className="text-sm font-medium text-gray-700">Document Date</Label>
                  <Input
                    id="documentDate"
                    type="date"
                    className="h-10"
                    {...register('documentDate', { required: 'Document date is required' })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="approvalDate" className="text-sm font-medium text-gray-700">Approval Date</Label>
                  <Input
                    id="approvalDate"
                    type="date"
                    className="h-10"
                    {...register('approvalDate')}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="language" className="text-sm font-medium text-gray-700">Language</Label>
                  <Select 
                    value={watch('language')} 
                    onValueChange={(value) => setValue('language', value)}
                  >
                    <SelectTrigger id="language" className="h-10">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="it">Italian</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                      <SelectItem value="ru">Russian</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                      <SelectItem value="ja">Japanese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pageCount" className="text-sm font-medium text-gray-700">Page Count</Label>
                  <Input
                    id="pageCount"
                    type="number"
                    placeholder="Enter page count"
                    className="h-10"
                    {...register('pageCount')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* File Upload Section */}
          <div className="space-y-4 bg-gray-50/50 p-6 rounded-lg border border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-600 font-semibold">{showDocumentInfo ? '5' : '4'}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">File Upload</h3>
            </div>
            <div 
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => document.getElementById('fileUpload').click()}
            >
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-base text-gray-600 mb-2">
                {fileState.fileName ? fileState.fileName : 'Click to upload or drag and drop'}
              </p>
              {fileState.fileSize > 0 && (
                <p className="text-sm text-gray-500">{formatFileSize(fileState.fileSize)}</p>
              )}
              <input
                id="fileUpload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            {fileState.error && (
              <p className="text-sm text-red-500 mt-2">{fileState.error}</p>
            )}
          </div>
          
          {/* Form Submission Buttons */}
          <DialogFooter className="pt-6">
            <Button type="button" variant="outline" onClick={resetForm} className="h-10 px-6">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="h-10 px-6">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Document'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentDialog;