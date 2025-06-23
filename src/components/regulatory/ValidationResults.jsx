import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, Download, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { validationService } from '@/services/validationService';

const ValidationResults = ({ results, documentId, onRevalidate }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isRevalidating, setIsRevalidating] = useState(false);
  const [activeTab, setActiveTab] = useState('issues');

  if (!results) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PASS':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'FAIL':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PASS':
        return 'bg-green-500/10 text-green-500';
      case 'FAIL':
        return 'bg-red-500/10 text-red-500';
      case 'WARNING':
        return 'bg-yellow-500/10 text-yellow-500';
      default:
        return '';
    }
  };

  const handleRevalidate = async () => {
    if (!documentId) return;
    setIsRevalidating(true);
    try {
      await onRevalidate(documentId);
    } finally {
      setIsRevalidating(false);
    }
  };

  const handleExportReport = () => {
    const report = {
      status: results.status,
      summary: results.summary,
      details: results.details,
      recommendations: results.recommendations,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `validation-report-${documentId}-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full border-l-4" style={{ borderLeftColor: results.status === 'PASS' ? '#22c55e' : results.status === 'FAIL' ? '#ef4444' : '#eab308' }}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Validation Results</CardTitle>
            <Badge variant="outline" className={getStatusColor(results.status)}>
              {results.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRevalidate}
              disabled={isRevalidating}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRevalidating ? 'animate-spin' : ''}`} />
              Revalidate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportReport}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        <CardDescription>
          Last validated: {new Date().toLocaleString()}
        </CardDescription>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Total Issues</div>
                <div className="text-2xl font-bold">{results.summary.totalIssues}</div>
                <Progress value={(results.summary.totalIssues / 10) * 100} className="mt-2" />
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Critical Issues</div>
                <div className="text-2xl font-bold text-red-500">{results.summary.criticalIssues}</div>
                <Progress value={(results.summary.criticalIssues / 5) * 100} className="mt-2" />
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Errors</div>
                <div className="text-2xl font-bold text-orange-500">{results.summary.errors}</div>
                <Progress value={(results.summary.errors / 5) * 100} className="mt-2" />
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Warnings</div>
                <div className="text-2xl font-bold text-yellow-500">{results.summary.warnings}</div>
                <Progress value={(results.summary.warnings / 5) * 100} className="mt-2" />
              </div>
            </div>

            {/* Tabs for Issues and Recommendations */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="issues">Issues ({results.details.length})</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations ({results.recommendations.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="issues">
                <ScrollArea className="h-[300px] rounded-md border p-4">
                  <div className="space-y-4">
                    {results.details.map((issue, index) => (
                      <Alert 
                        key={index} 
                        variant={issue.severity === 'CRITICAL' ? 'destructive' : 'default'}
                        className="transition-all duration-200 hover:shadow-md"
                      >
                        <div className="flex items-start gap-2">
                          {issue.severity === 'CRITICAL' ? (
                            <AlertCircle className="w-5 h-5" />
                          ) : (
                            <AlertTriangle className="w-5 h-5" />
                          )}
                          <div>
                            <AlertTitle className="flex items-center gap-2">
                              {issue.severity}
                              {issue.location && (
                                <span className="text-sm font-normal text-muted-foreground">
                                  at {issue.location}
                                </span>
                              )}
                            </AlertTitle>
                            <AlertDescription>{issue.message}</AlertDescription>
                            {issue.recommendation && (
                              <div className="mt-2 text-sm text-muted-foreground">
                                Recommendation: {issue.recommendation}
                              </div>
                            )}
                          </div>
                        </div>
                      </Alert>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="recommendations">
                <ScrollArea className="h-[300px] rounded-md border p-4">
                  <div className="space-y-2">
                    {results.recommendations.map((rec, index) => (
                      <div 
                        key={index} 
                        className="flex items-start gap-2 p-3 bg-muted rounded-lg transition-all duration-200 hover:shadow-md"
                      >
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          {typeof rec === 'string' ? rec : rec.recommendation}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ValidationResults; 