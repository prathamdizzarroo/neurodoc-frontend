import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { regulatoryPackageService } from '../../services/regulatoryPackageService';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Eye, Pencil, Trash2, FileText, AlertCircle, ExternalLink, ChevronDown, ChevronUp, Upload } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  MoreHorizontal,
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  CheckCircle2,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const FlagImage = ({ code, className }) => (
  <div className={cn(
    "relative w-8 h-6 rounded-md overflow-hidden shadow-sm",
    "border border-border/50",
    "transition-all duration-200",
    "hover:shadow-md hover:scale-105",
    "group",
    className
  )}>
    <img
      src={`https://flagcdn.com/w80/${code.toLowerCase()}.png`}
      alt={`${code.toUpperCase()} flag`}
      className="w-full h-full object-cover"
      loading="lazy"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
  </div>
);

const RegulatoryPackageTable = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("lastUpdated");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [editForm, setEditForm] = useState({ 
    status: '', 
    priority: '', 
    type: '',
    documents: [] 
  });
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const data = await regulatoryPackageService.getAllPackages();
      setPackages(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching packages:', err);
      setError('Failed to fetch regulatory packages');
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleDelete = async (id) => {
    try {
      await regulatoryPackageService.deletePackage(id);
      await fetchPackages();
      toast({
        title: "Success",
        description: "Package deleted successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error deleting package:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete package.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'Pending': 'warning',
      'Review': 'info',
      'Active': 'success',
      'Completed': 'default'
    };
    return (
      <Badge variant={variants[status] || 'default'}>
        {status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      'High': 'destructive',
      'Medium': 'warning',
      'Low': 'success'
    };
    return (
      <Badge variant={variants[priority] || 'default'}>
        {priority}
      </Badge>
    );
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const openViewDialog = (pkg) => {
    setSelectedPackage(pkg);
    setViewDialogOpen(true);
  };

  const openEditDialog = (pkg) => {
    setSelectedPackage(pkg);
    setEditForm({ 
      status: pkg.status, 
      priority: pkg.priority, 
      type: pkg.type,
      documents: pkg.documents || []
    });
    setEditDialogOpen(true);
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingDocument(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', file);
      
      // Add metadata
      const metadata = {
        documentTitle: file.name,
        version: "1.0",
        documentDate: new Date().toISOString(),
        status: "Pending",
        fileSize: file.size,
        fileFormat: file.type,
        fileName: file.name,
        uploadedBy: '507f1f77bcf86cd799439011',
        country: selectedPackage.country,
        type: selectedPackage.type
      };
      
      formData.append('metadata', JSON.stringify(metadata));
      
      const response = await regulatoryPackageService.uploadDocument(selectedPackage._id, formData);
      
      setEditForm(prev => ({
        ...prev,
        documents: [...prev.documents, response.document]
      }));

      toast({
        title: "Success",
        description: "Document uploaded successfully",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setUploadingDocument(false);
      setUploadProgress(0);
    }
  };

  const handleDocumentDelete = async (documentIndex) => {
    try {
      const updatedDocuments = [...editForm.documents];
      updatedDocuments.splice(documentIndex, 1);
      
      setEditForm(prev => ({
        ...prev,
        documents: updatedDocuments
      }));

      toast({
        title: "Success",
        description: "Document removed successfully",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove document",
        variant: "destructive",
      });
    }
  };

  const handleEditSave = async () => {
    try {
      const updateData = {
        ...editForm,
        country: selectedPackage.country,
        createdBy: selectedPackage.createdBy,
        updatedBy: '507f1f77bcf86cd799439011',
        auditTrail: [{
          action: 'updated',
          user: '507f1f77bcf86cd799439011',
          timestamp: new Date().toISOString(),
          details: {
            previousStatus: selectedPackage.status,
            newStatus: editForm.status,
            previousPriority: selectedPackage.priority,
            newPriority: editForm.priority,
            previousType: selectedPackage.type,
            newType: editForm.type,
            documentsUpdated: true
          }
        }]
      };
      
      await regulatoryPackageService.updatePackage(selectedPackage._id, updateData);
      await fetchPackages();
      setEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Package updated successfully",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update package",
        variant: "destructive",
      });
    }
  };

  // Filter packages based on search and filters
  const filteredPackages = (packages || []).filter(pkg => {
    if (!pkg) return false;
    
    const matchesSearch = 
      (pkg.country?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (pkg._id?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || pkg.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || pkg.priority === selectedPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Sort packages
  const sortedPackages = [...filteredPackages].sort((a, b) => {
    if (!a || !b) return 0;
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return sortDirection === 'asc'
      ? aValue - bValue
      : bValue - aValue;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error Loading Packages</h3>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={fetchPackages} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  if (!packages || packages.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Packages Found</h3>
        <p className="text-muted-foreground">There are no regulatory packages available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">Regulatory Packages</h2>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search packages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[300px]"
            icon={<Search className="w-4 h-4" />}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Status
                {selectedStatus !== 'all' && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedStatus}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSelectedStatus('all')}>
                All Status
              </DropdownMenuItem>
              {["Pending", "Review", "Active", "Completed"].map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                >
                  {getStatusBadge(status)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Priority
                {selectedPriority !== 'all' && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedPriority}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSelectedPriority('all')}>
                All Priority
              </DropdownMenuItem>
              {["High", "Medium", "Low"].map((priority) => (
                <DropdownMenuItem
                  key={priority}
                  onClick={() => setSelectedPriority(priority)}
                >
                  {getPriorityBadge(priority)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-muted/50">
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('packageId')}
              >
                <div className="flex items-center gap-2">
                  Package ID
                  {sortField === 'packageId' && (
                    sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('country')}
              >
                <div className="flex items-center gap-2">
                  Country
                  {sortField === 'country' && (
                    sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('type')}
              >
                <div className="flex items-center gap-2">
                  Type
                  {sortField === 'type' && (
                    sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-2">
                  Status
                  {sortField === 'status' && (
                    sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('priority')}
              >
                <div className="flex items-center gap-2">
                  Priority
                  {sortField === 'priority' && (
                    sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('documents')}
              >
                <div className="flex items-center gap-2">
                  Documents
                  {sortField === 'documents' && (
                    sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPackages.map((pkg) => (
              <TableRow 
                key={pkg._id}
                className="group hover:bg-muted/50 transition-colors"
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span>{pkg._id}</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Click to view details</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <FlagImage code={pkg.flagCode} />
                    <span className="font-medium">{pkg.country}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-normal">
                    {pkg.type}
                  </Badge>
                </TableCell>
                <TableCell>{getStatusBadge(pkg.status)}</TableCell>
                <TableCell>{getPriorityBadge(pkg.priority)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-normal">
                      {pkg.documents?.length || 0} files
                    </Badge>
                    {pkg.documents?.length > 0 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <FileText className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View documents</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openViewDialog(pkg)}
                            className="hover:bg-primary/10"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View details</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(pkg)}
                            className="hover:bg-primary/10"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit package</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(pkg._id)}
                            className="hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete package</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-xl w-[90vw] sm:w-[80vw] md:w-[70vw] lg:w-[50vw] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Package Details</DialogTitle>
          </DialogHeader>
          {selectedPackage && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-2 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground">Package ID</h4>
                  <p className="mt-1 text-sm break-all">{selectedPackage._id}</p>
                </div>
                <div className="p-2 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground">Country</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <img 
                      src={`https://flagcdn.com/w20/${selectedPackage.flagCode.toLowerCase()}.png`}
                      alt={selectedPackage.country}
                      className="w-5 h-4 object-cover rounded"
                    />
                    <span className="text-sm">{selectedPackage.country}</span>
                  </div>
                </div>
                <div className="p-2 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                  <div className="mt-1">{getStatusBadge(selectedPackage.status)}</div>
                </div>
                <div className="p-2 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground">Priority</h4>
                  <div className="mt-1">{getPriorityBadge(selectedPackage.priority)}</div>
                </div>
                <div className="p-2 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground">Type</h4>
                  <p className="mt-1 text-sm">{selectedPackage.type}</p>
                </div>
                <div className="p-2 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground">Created By</h4>
                  <p className="mt-1 text-sm break-all">{selectedPackage.createdBy}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Documents</h4>
                {selectedPackage.documents && selectedPackage.documents.length > 0 ? (
                  <div className="space-y-2 max-h-[150px] overflow-y-auto">
                    {selectedPackage.documents.map((doc, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 border rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2 mb-1 sm:mb-0">
                          <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm break-all">{doc.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(doc.fileUrl, '_blank')}
                            className="flex-shrink-0 h-8 w-8 p-0"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
                )}
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Audit Trail</h4>
                <div className="space-y-2 max-h-[150px] overflow-y-auto">
                  {selectedPackage.auditTrail && selectedPackage.auditTrail.map((entry, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 border rounded-lg bg-muted/30">
                      <div className="flex-shrink-0 mt-1">
                        {entry.action === 'created' && <Plus className="w-4 h-4 text-green-500" />}
                        {entry.action === 'updated' && <Pencil className="w-4 h-4 text-blue-500" />}
                        {entry.action === 'deleted' && <Trash2 className="w-4 h-4 text-red-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{entry.action.charAt(0).toUpperCase() + entry.action.slice(1)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleString()}
                        </p>
                        {entry.details && (
                          <pre className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap break-all">
                            {JSON.stringify(entry.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Package</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Status</h4>
                <select
                  value={editForm.status}
                  onChange={(e) => handleEditChange('status', e.target.value)}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2"
                >
                  <option value="Pending">Pending</option>
                  <option value="Review">Review</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Priority</h4>
                <select
                  value={editForm.priority}
                  onChange={(e) => handleEditChange('priority', e.target.value)}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Type</h4>
                <select
                  value={editForm.type}
                  onChange={(e) => handleEditChange('type', e.target.value)}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2"
                >
                  <option value="Initial Submission">Initial Submission</option>
                  <option value="Amendment">Amendment</option>
                  <option value="Renewal">Renewal</option>
                </select>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Documents</h4>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleDocumentUpload}
                    className="hidden"
                    id="document-upload"
                    accept=".pdf,.doc,.docx"
                  />
                  <label
                    htmlFor="document-upload"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                  >
                    {uploadingDocument ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Document
                      </>
                    )}
                  </label>
                </div>
              </div>

              {uploadProgress > 0 && (
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {editForm.documents && editForm.documents.length > 0 ? (
                  editForm.documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{doc.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(doc.fileUrl, '_blank')}
                          className="h-8 w-8 p-0"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDocumentDelete(index)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditSave}>
                Save Changes
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RegulatoryPackageTable; 