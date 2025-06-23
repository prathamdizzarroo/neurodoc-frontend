import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Download, Copy, CheckCircle2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { geminiService } from '@/services/geminiService';

const DocumentGenerator = ({ onDocumentGenerated }) => {
  const [context, setContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!context.trim()) {
      toast({
        title: "Error",
        description: "Please provide some context for the cover letter.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await geminiService.generateDocument('cover_letter', { text: context });
      setGeneratedContent(result);
      toast({
        title: "Success",
        description: "Cover letter generated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate cover letter.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (generatedContent?.content) {
      navigator.clipboard.writeText(generatedContent.content);
      toast({
        title: "Success",
        description: "Content copied to clipboard!",
      });
    }
  };

  const handleDownload = () => {
    if (generatedContent?.content) {
      const blob = new Blob([generatedContent.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cover_letter_${new Date().toISOString()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleUseDocument = () => {
    if (generatedContent && onDocumentGenerated) {
      onDocumentGenerated(generatedContent);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Generate Cover Letter</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Context</label>
          <Textarea
            placeholder="Enter details about the study, sponsor, and any specific requirements for the cover letter..."
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !context.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Cover Letter"
          )}
        </Button>

        {generatedContent && (
          <div className="space-y-4 mt-4">
            <div className="p-4 border rounded-lg bg-muted/50">
              <pre className="whitespace-pre-wrap text-sm">{generatedContent.content}</pre>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="flex-1"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                size="sm"
                onClick={handleUseDocument}
                className="flex-1"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Use Document
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentGenerator; 