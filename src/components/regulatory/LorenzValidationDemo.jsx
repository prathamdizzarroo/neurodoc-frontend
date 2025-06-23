import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { 
  Shield, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  Zap,
  Globe,
  Database
} from 'lucide-react';
import { lorenzValidationService } from '@/services/lorenzValidationService';

const LorenzValidationDemo = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const { toast } = useToast();

  // Mock document for demo
  const mockDocument = {
    file: new File(['Mock document content'], 'protocol.pdf', { type: 'application/pdf' }),
    metadata: {
      documentTitle: 'Protocol Document',
      country: 'USA',
      type: 'Initial Submission',
      version: '1.0'
    }
  };

  const handleDemoValidation = async () => {
    setIsValidating(true);
    setValidationResult(null);

    try {
      // Simulate LORENZ validation
      const result = await lorenzValidationService.validateDocument(
        mockDocument,
        'eCTD',
        'FDA'
      );

      setValidationResult(result);

      toast({
        title: "LORENZ Validation Complete",
        description: `Document ${result.status === 'PASS' ? 'passed' : 'failed'} LORENZ validation`,
        variant: result.status === 'PASS' ? 'success' : 'destructive',
      });

    } catch (error) {
      console.error('Demo validation failed:', error);
      toast({
        title: "Validation Error",
        description: "LORENZ validation service is not available in demo mode",
        variant: "destructive",
      });

      // Show mock result for demo purposes
      setValidationResult({
        status: 'WARNING',
        summary: {
          totalIssues: 3,
          criticalIssues: 0,
          errors: 1,
          warnings: 2,
          info: 0
        },
        validationDetails: {
          validationMetadata: {
            validationTool: 'LORENZ eValidator',
            validationVersion: '25.1',
            validationEnvironment: 'LORENZ Cloud'
          },
          issues: [
            {
              id: 'LORENZ-001',
              severity: 'WARNING',
              category: 'Document Structure',
              message: 'Document title should be more descriptive',
              recommendation: 'Consider adding study identifier to title'
            },
            {
              id: 'LORENZ-002',
              severity: 'ERROR',
              category: 'Content',
              message: 'Missing required section: Study Objectives',
              recommendation: 'Add study objectives section'
            },
            {
              id: 'LORENZ-003',
              severity: 'WARNING',
              category: 'Formatting',
              message: 'Inconsistent date format detected',
              recommendation: 'Use ISO 8601 date format (YYYY-MM-DD)'
            }
          ]
        },
        recommendations: [
          {
            priority: 'MEDIUM',
            category: 'Document Quality',
            message: 'Improve document structure and formatting',
            impact: 'Better regulatory compliance',
            action: 'Review and update document sections'
          }
        ],
        lorenzMetadata: {
          validationId: 'demo-123',
          sessionId: 'demo-session',
          timestamp: new Date().toISOString(),
          apiVersion: '1.0'
        }
      });
    } finally {
      setIsValidating(false);
    }
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
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            LORENZ Validation Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Demo Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <FileText className="w-4 h-4" />
              <span className="font-medium">Protocol Document</span>
            </div>
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <Globe className="w-4 h-4" />
              <span className="font-medium">Target: FDA</span>
            </div>
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <Database className="w-4 h-4" />
              <span className="font-medium">eCTD 4.0</span>
            </div>
          </div>

          {/* Validation Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleDemoValidation}
              disabled={isValidating}
              className="flex items-center gap-2"
              size="lg"
            >
              {isValidating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Zap className="w-4 h-4" />
              )}
              {isValidating ? 'Validating with LORENZ...' : 'Start LORENZ Validation Demo'}
            </Button>
          </div>

          {/* Validation Results */}
          {validationResult && (
            <Card className="border-l-4" style={{ borderLeftColor: validationResult.status === 'PASS' ? '#22c55e' : validationResult.status === 'FAIL' ? '#ef4444' : '#eab308' }}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle>LORENZ Validation Results</CardTitle>
                    <Badge variant="outline" className={getStatusColor(validationResult.status)}>
                      {validationResult.status}
                    </Badge>
                  </div>
                  {getStatusIcon(validationResult.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <div className="text-2xl font-bold">{validationResult.summary.totalIssues}</div>
                    <div className="text-sm text-gray-600">Total Issues</div>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600">{validationResult.summary.criticalIssues}</div>
                    <div className="text-sm text-red-600">Critical</div>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600">{validationResult.summary.errors}</div>
                    <div className="text-sm text-orange-600">Errors</div>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-600">{validationResult.summary.warnings}</div>
                    <div className="text-sm text-yellow-600">Warnings</div>
                  </div>
                </div>

                {/* Issues */}
                {validationResult.validationDetails?.issues && (
                  <div>
                    <h4 className="font-medium mb-3">Validation Issues</h4>
                    <div className="space-y-2">
                      {validationResult.validationDetails.issues.map((issue, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={issue.severity === 'CRITICAL' ? 'destructive' : issue.severity === 'ERROR' ? 'destructive' : 'warning'}>
                              {issue.severity}
                            </Badge>
                            <span className="font-medium">{issue.category}</span>
                          </div>
                          <p className="text-sm mb-2">{issue.message}</p>
                          {issue.recommendation && (
                            <p className="text-xs text-gray-600">
                              <strong>Recommendation:</strong> {issue.recommendation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {validationResult.recommendations && validationResult.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">LORENZ Recommendations</h4>
                    <div className="space-y-2">
                      {validationResult.recommendations.map((rec, index) => (
                        <div key={index} className="p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={rec.priority === 'HIGH' ? 'destructive' : 'warning'}>
                              {rec.priority}
                            </Badge>
                            <span className="font-medium">{rec.category}</span>
                          </div>
                          <p className="text-sm mb-1">{rec.message}</p>
                          <p className="text-xs text-gray-600">
                            <strong>Impact:</strong> {rec.impact}
                          </p>
                          <p className="text-xs text-gray-600">
                            <strong>Action:</strong> {rec.action}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* LORENZ Metadata */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">LORENZ Validation Metadata</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Validation Tool:</span>
                      <span className="ml-2 font-medium">{validationResult.validationDetails?.validationMetadata?.validationTool}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Version:</span>
                      <span className="ml-2 font-medium">{validationResult.validationDetails?.validationMetadata?.validationVersion}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Environment:</span>
                      <span className="ml-2 font-medium">{validationResult.validationDetails?.validationMetadata?.validationEnvironment}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Validation ID:</span>
                      <span className="ml-2 font-medium">{validationResult.lorenzMetadata?.validationId}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Demo Note */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2">Demo Information</h4>
            <p className="text-sm text-gray-600">
              This is a demonstration of LORENZ validation integration. In a production environment, 
              this would connect to the actual LORENZ eValidator API for real-time validation against 
              regulatory standards. The demo shows the expected response format and user interface.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LorenzValidationDemo; 