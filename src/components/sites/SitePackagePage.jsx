import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, FileText, File as FileIcon, Upload, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

const ethicsBoard = {
  name: "OCREB: Ontario Cancer Research Ethics Board",
  documents: [
    { name: "Completed PIA Form", requirement: "Mandatory" },
    { name: "Study Protocol", requirement: "Mandatory" },
    { name: "Investigators Brochure", requirement: "Mandatory" },
    { name: "OCREB approved Consent Forms", requirement: "Mandatory" },
    { name: "Participant Materials", requirement: "Mandatory" },
    { name: "Principal Investigators CV and other information", requirement: "Mandatory" },
    { name: "Conflict of Interest Declarations", requirement: "If applicable" },
    { name: "Data Safety Monitoring Plan", requirement: "Mandatory" },
    { name: "Recruitment Procedures", requirement: "If applicable" },
    { name: "PIA Form Signature", requirement: "Mandatory" }
  ]
};

const getFileIcon = (file) => {
  if (!file) return <FileIcon className="w-5 h-5 text-muted-foreground" />;
  const ext = file.name.split('.').pop().toLowerCase();
  if (ext === 'pdf') return <FileText className="w-5 h-5 text-red-500" />;
  if (ext === 'docx') return <FileText className="w-5 h-5 text-blue-500" />;
  return <FileIcon className="w-5 h-5 text-muted-foreground" />;
};

const getRequirementBadge = (requirement) => {
  const variants = {
    Mandatory: "destructive",
    "If applicable": "secondary"
  };
  return <Badge variant={variants[requirement] || "default"}>{requirement}</Badge>;
};

const SitePackagePage = () => {
  const [uploadedDocs, setUploadedDocs] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleFileChange = (docName, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedTypes.includes(file.type)) {
      setUploadErrors(prev => ({ ...prev, [docName]: "Only PDF or DOCX files are allowed." }));
      setUploadedDocs(prev => ({ ...prev, [docName]: undefined }));
      setUploadProgress(prev => ({ ...prev, [docName]: undefined }));
      return;
    }
    setUploadErrors(prev => ({ ...prev, [docName]: undefined }));
    setUploadedDocs(prev => ({ ...prev, [docName]: undefined }));
    simulateUpload(docName, file);
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
        setUploadedDocs(prev => ({ ...prev, [docName]: file }));
      } else {
        setUploadProgress(prev => ({ ...prev, [docName]: progress }));
      }
    }, 150);
  };

  const handleRemoveFile = (docName) => {
    setUploadedDocs(prev => {
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

  const allMandatoryUploaded = ethicsBoard.documents
    .filter(doc => doc.requirement === "Mandatory")
    .every(doc => uploadedDocs[doc.name]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1200));
    if (!allMandatoryUploaded) {
      setSubmitError("Please upload all mandatory documents before submitting.");
      setIsSubmitting(false);
      return;
    }
    setSubmitSuccess(true);
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 py-8">
      <Card className="border-none shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl sm:text-2xl font-semibold">Site Package: {ethicsBoard.name}</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Upload and manage required documents for ethics board submission.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Document</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Requirement</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Upload / Status</th>
                </tr>
              </thead>
              <tbody>
                {ethicsBoard.documents.map((doc) => (
                  <tr key={doc.name} className="border-b last:border-0">
                    <td className="px-4 py-3 whitespace-nowrap font-medium">{doc.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{getRequirementBadge(doc.requirement)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          id={`upload-${doc.name}`}
                          className="hidden"
                          onChange={e => handleFileChange(doc.name, e)}
                          disabled={isSubmitting || uploadProgress[doc.name] > 0 && uploadProgress[doc.name] < 100}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn("flex items-center gap-2", uploadProgress[doc.name] > 0 && uploadProgress[doc.name] < 100 && "opacity-60 cursor-not-allowed")}
                          onClick={() => document.getElementById(`upload-${doc.name}`)?.click()}
                          disabled={isSubmitting || uploadProgress[doc.name] > 0 && uploadProgress[doc.name] < 100}
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          {uploadedDocs[doc.name] ? "Replace" : "Upload"}
                        </Button>
                        {uploadProgress[doc.name] > 0 && uploadProgress[doc.name] < 100 && (
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="bg-primary h-2 rounded-full transition-all duration-200"
                                style={{ width: `${uploadProgress[doc.name]}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">{uploadProgress[doc.name]}%</span>
                          </div>
                        )}
                        {uploadedDocs[doc.name] && uploadProgress[doc.name] === 100 && (
                          <div className="flex items-center gap-2">
                            {getFileIcon(uploadedDocs[doc.name])}
                            <span className="text-green-600 font-medium max-w-[120px] truncate">{uploadedDocs[doc.name].name}</span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleRemoveFile(doc.name)}
                              disabled={isSubmitting}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                        {uploadErrors[doc.name] && (
                          <span className="text-red-500 text-xs ml-2">{uploadErrors[doc.name]}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !allMandatoryUploaded}
              className="w-40"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              Submit Package
            </Button>
            {submitError && <span className="text-red-500 text-sm">{submitError}</span>}
            {submitSuccess && <span className="text-green-600 text-sm">Package submitted successfully!</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SitePackagePage; 