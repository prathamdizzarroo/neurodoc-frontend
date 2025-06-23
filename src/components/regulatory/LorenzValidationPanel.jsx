import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  RefreshCw,
  Download,
  Upload,
  Shield,
  FileText,
  Database,
  Globe,
  Settings,
  Clock,
  Zap,
  Target,
  CheckSquare,
  XSquare,
  MinusSquare
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { lorenzValidationService } from '@/services/lorenzValidationService';

const LorenzValidationPanel = ({ 
  documents, 
  targetCountry, 
  packageId, 
  onValidationComplete,
  onValidationError 
}) => {
  const [validationResults, setValidationResults] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);
  const [selectedValidationType, setSelectedValidationType] = useState('eCTD');
  const [activeTab, setActiveTab] = useState('summary');
  const [packageValidationResult, setPackageValidationResult] = useState(null);
  const [validationHistory, setValidationHistory] = useState([]);
  const { toast } = useToast();

  // Validation types supported by LORENZ
  const validationTypes = [
    { value: 'eCTD', label: 'eCTD 4.0', description: 'Electronic Common Technical Document' },
    { value: 'SDTM', label: 'SDTM 3.4', description: 'Study Data Tabulation Model' },
    { value: 'ADaM', label: 'ADaM 1.1', description: 'Analysis Data Model' },
    { value: 'DEFINE-XML', label: 'DEFINE-XML 2.1', description: 'Define XML for Clinical Data' },
    { value: 'SEND', label: 'SEND 3.1', description: 'Standard for Exchange of Nonclinical Data' }
  ];

  // Agency mapping for countries
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PASS':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'FAIL':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PASS':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'FAIL':
        return 'bg-red-500/10 text-red-700 border-red-200';
      case 'WARNING':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      default:
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
    }
  };

  const validateDocument = async (document, index) => {
    try {
      const targetAgency = getAgencyForCountry(targetCountry);
      
      const result = await lorenzValidationService.validateDocument(
        document,
        selectedValidationType,
        targetAgency
      );

      setValidationResults(prev => ({
        ...prev,
        [document.id || index]: result
      }));

      return result;
    } catch (error) {
      console.error(`Validation failed for document ${index}:`, error);
      throw error;
    }
  };

  const validateAllDocuments = async () => {
    if (!documents || documents.length === 0) {
      toast({
        title: "No Documents",
        description: "Please upload documents before validation",
        variant: "destructive"
      });
      return;
    }

    setIsValidating(true);
    setValidationProgress(0);
    setValidationResults({});

    try {
      const totalDocuments = documents.length;
      let completedDocuments = 0;
      let successfulValidations = 0;
      let failedValidations = 0;

      for (let i = 0; i < documents.length; i++) {
        const document = documents[i];
        
        try {
          await validateDocument(document, i);
          successfulValidations++;
        } catch (error) {
          failedValidations++;
          console.error(`Document ${i} validation failed:`, error);
        }

        completedDocuments++;
        setValidationProgress((completedDocuments / totalDocuments) * 100);
      }

      // Validate the entire package
      if (packageId) {
        try {
          const packageResult = await lorenzValidationService.validateRegulatoryPackage(
            { documents, country: targetCountry },
            targetCountry
          );
          setPackageValidationResult(packageResult);
        } catch (error) {
          console.error('Package validation failed:', error);
        }
      }

      // Show completion toast
      toast({
        title: "Validation Complete",
        description: `Successfully validated ${successfulValidations} documents. ${failedValidations} failed.`,
        variant: failedValidations > 0 ? "destructive" : "success"
      });

      if (onValidationComplete) {
        onValidationComplete({
          successfulValidations,
          failedValidations,
          totalDocuments,
          results: validationResults,
          packageResult: packageValidationResult
        });
      }

    } catch (error) {
      console.error('Validation process failed:', error);
      toast({
        title: "Validation Failed",
        description: error.message || "An error occurred during validation",
        variant: "destructive"
      });

      if (onValidationError) {
        onValidationError(error);
      }
    } finally {
      setIsValidating(false);
      setValidationProgress(0);
    }
  };

  const revalidateDocument = async (documentId) => {
    const document = documents.find(doc => doc.id === documentId);
    if (!document) return;

    try {
      const result = await validateDocument(document, documentId);
      setValidationResults(prev => ({
        ...prev,
        [documentId]: result
      }));

      toast({
        title: "Revalidation Complete",
        description: `Document ${result.status === 'PASS' ? 'passed' : 'failed'} validation`,
        variant: result.status === 'PASS' ? 'success' : 'destructive'
      });
    } catch (error) {
      toast({
        title: "Revalidation Failed",
        description: error.message || "Failed to revalidate document",
        variant: "destructive"
      });
    }
  };

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

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lorenz-validation-report-${packageId || 'package'}-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Report Exported",
      description: "Validation report has been downloaded",
    });
  };

  const getOverallStatus = () => {
    const results = Object.values(validationResults);
    if (results.length === 0) return 'PENDING';
    
    const hasFailures = results.some(r => r.status === 'FAIL');
    const hasWarnings = results.some(r => r.status === 'WARNING');
    
    if (hasFailures) return 'FAIL';
    if (hasWarnings) return 'WARNING';
    return 'PASS';
  };

  const getOverallSummary = () => {
    const results = Object.values(validationResults);
    if (results.length === 0) return { total: 0, pass: 0, fail: 0, warning: 0 };

    return {
      total: results.length,
      pass: results.filter(r => r.status === 'PASS').length,
      fail: results.filter(r => r.status === 'FAIL').length,
      warning: results.filter(r => r.status === 'WARNING').length
    };
  };

  return (
    <div className="space-y-6">
      {/* Validation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            LORENZ Validation Engine
          </CardTitle>
          <CardDescription>
            Validate your regulatory package using LORENZ eValidator and docuBridge
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Validation Type</label>
              <Select value={selectedValidationType} onValueChange={setSelectedValidationType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {validationTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Target Agency</label>
              <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                <Globe className="w-4 h-4" />
                <span className="font-medium">{getAgencyForCountry(targetCountry)}</span>
                <Badge variant="outline">{targetCountry}</Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Documents</label>
              <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                <FileText className="w-4 h-4" />
                <span className="font-medium">{documents?.length || 0} documents</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={validateAllDocuments}
              disabled={isValidating || !documents?.length}
              className="flex items-center gap-2"
            >
              {isValidating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              {isValidating ? 'Validating...' : 'Start LORENZ Validation'}
            </Button>

            <Button
              variant="outline"
              onClick={exportValidationReport}
              disabled={Object.keys(validationResults).length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>

          {isValidating && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Validation Progress</span>
                <span>{Math.round(validationProgress)}%</span>
              </div>
              <Progress value={validationProgress} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validation Results */}
      {Object.keys(validationResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(getOverallStatus())}
              Validation Results
              <Badge variant="outline" className={getStatusColor(getOverallStatus())}>
                {getOverallStatus()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="package">Package</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  {(() => {
                    const summary = getOverallSummary();
                    return [
                      { label: 'Total', value: summary.total, icon: FileText, color: 'text-blue-600' },
                      { label: 'Passed', value: summary.pass, icon: CheckSquare, color: 'text-green-600' },
                      { label: 'Failed', value: summary.fail, icon: XSquare, color: 'text-red-600' },
                      { label: 'Warnings', value: summary.warning, icon: MinusSquare, color: 'text-yellow-600' }
                    ].map((item, index) => (
                      <div key={index} className="p-4 border rounded-lg text-center">
                        <item.icon className={`w-6 h-6 mx-auto mb-2 ${item.color}`} />
                        <div className="text-2xl font-bold">{item.value}</div>
                        <div className="text-sm text-muted-foreground">{item.label}</div>
                      </div>
                    ));
                  })()}
                </div>

                {packageValidationResult && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Package Validation</AlertTitle>
                    <AlertDescription>
                      Package validation completed with status: {packageValidationResult.status}
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                <ScrollArea className="h-[400px]">
                  {Object.entries(validationResults).map(([docId, result]) => {
                    const document = documents?.find(doc => doc.id === docId);
                    return (
                      <Card key={docId} className="mb-4">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(result.status)}
                              <span className="font-medium">
                                {document?.name || `Document ${docId}`}
                              </span>
                              <Badge variant="outline" className={getStatusColor(result.status)}>
                                {result.status}
                              </Badge>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => revalidateDocument(docId)}
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Revalidate
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Issues:</span>
                              <span className="ml-2 font-medium">{result.summary.totalIssues}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Critical:</span>
                              <span className="ml-2 font-medium text-red-600">{result.summary.criticalIssues}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Errors:</span>
                              <span className="ml-2 font-medium text-orange-600">{result.summary.errors}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Warnings:</span>
                              <span className="ml-2 font-medium text-yellow-600">{result.summary.warnings}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="package" className="space-y-4">
                {packageValidationResult ? (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Package Compliance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm text-muted-foreground">Overall Status:</span>
                            <div className="flex items-center gap-2 mt-1">
                              {getStatusIcon(packageValidationResult.status)}
                              <span className="font-medium">{packageValidationResult.status}</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Submission Ready:</span>
                            <div className="mt-1">
                              <Badge variant={packageValidationResult.submissionReadiness?.ready ? 'success' : 'destructive'}>
                                {packageValidationResult.submissionReadiness?.ready ? 'Yes' : 'No'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {packageValidationResult.recommendations?.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Package Recommendations</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {packageValidationResult.recommendations.slice(0, 5).map((rec, index) => (
                              <Alert key={index}>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>{rec.category}</AlertTitle>
                                <AlertDescription>{rec.message}</AlertDescription>
                              </Alert>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Package validation not yet performed
                  </div>
                )}
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>LORENZ Metadata</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Validation Tool:</span>
                          <span className="ml-2 font-medium">LORENZ eValidator</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Version:</span>
                          <span className="ml-2 font-medium">25.1</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Environment:</span>
                          <span className="ml-2 font-medium">LORENZ Cloud</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Validation Type:</span>
                          <span className="ml-2 font-medium">{selectedValidationType}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Validation Rules Applied</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {lorenzValidationService.getValidationRules(targetCountry).additionalRules.map((rule, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span>{rule}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LorenzValidationPanel; 