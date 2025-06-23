import React, { useState } from 'react';
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Search,
  Filter,
  Eye,
  Edit,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const mockSitePackages = [
  {
    id: 'SP-001',
    study: 'Study A',
    site: 'Site 1',
    ethicsBoard: 'OCREB',
    status: 'Draft',
    lastUpdated: '2024-06-06',
  },
  {
    id: 'SP-002',
    study: 'Study B',
    site: 'Site 2',
    ethicsBoard: 'OCREB',
    status: 'Submitted',
    lastUpdated: '2024-06-05',
  },
  {
    id: 'SP-003',
    study: 'Study A',
    site: 'Site 3',
    ethicsBoard: 'OCREB',
    status: 'Approved',
    lastUpdated: '2024-06-04',
  },
];

const getStatusBadge = (status) => {
  const variants = {
    Draft: 'secondary',
    Submitted: 'warning',
    Approved: 'success',
    Rejected: 'destructive',
  };
  const icons = {
    Draft: <Clock className="w-4 h-4" />,
    Submitted: <CheckCircle2 className="w-4 h-4" />,
    Approved: <CheckCircle2 className="w-4 h-4" />,
    Rejected: <AlertCircle className="w-4 h-4" />,
  };
  return (
    <Badge variant={variants[status] || 'default'} className="flex items-center gap-1">
      {icons[status]}
      {status}
    </Badge>
  );
};

const SitePackageListPage = ({ onSelectPackage, onCreateNew }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortField, setSortField] = useState("lastUpdated");
  const [sortDirection, setSortDirection] = useState("desc");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

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
    setEditDialogOpen(true);
  };

  const filteredPackages = mockSitePackages
    .filter(pkg => {
      const matchesSearch =
        pkg.study.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.site.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.ethicsBoard.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus === "all" || pkg.status === selectedStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const direction = sortDirection === "asc" ? 1 : -1;
      return a[sortField] > b[sortField] ? direction : -direction;
    });

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search site packages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedStatus("all")}>All Status</DropdownMenuItem>
              <DropdownMenuSeparator />
              {["Draft", "Submitted", "Approved", "Rejected"].map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                >
                  {getStatusBadge(status)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={onCreateNew} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Site Package
          </Button>
        </div>
      </div>
      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px] cursor-pointer" onClick={() => handleSort('study')}>
                Study {sortField === 'study' && (sortDirection === 'asc' ? <ChevronUp className="inline w-4 h-4" /> : <ChevronDown className="inline w-4 h-4" />)}
              </TableHead>
              <TableHead className="w-[120px] cursor-pointer" onClick={() => handleSort('site')}>
                Site {sortField === 'site' && (sortDirection === 'asc' ? <ChevronUp className="inline w-4 h-4" /> : <ChevronDown className="inline w-4 h-4" />)}
              </TableHead>
              <TableHead>Ethics Board</TableHead>
              <TableHead className="w-[120px] cursor-pointer" onClick={() => handleSort('status')}>
                Status {sortField === 'status' && (sortDirection === 'asc' ? <ChevronUp className="inline w-4 h-4" /> : <ChevronDown className="inline w-4 h-4" />)}
              </TableHead>
              <TableHead className="w-[140px] cursor-pointer" onClick={() => handleSort('lastUpdated')}>
                Last Updated {sortField === 'lastUpdated' && (sortDirection === 'asc' ? <ChevronUp className="inline w-4 h-4" /> : <ChevronDown className="inline w-4 h-4" />)}
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPackages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No site packages found.
                </TableCell>
              </TableRow>
            ) : (
              filteredPackages.map(pkg => (
                <TableRow key={pkg.id} className="hover:bg-primary/5 transition cursor-pointer">
                  <TableCell className="font-medium">{pkg.study}</TableCell>
                  <TableCell>{pkg.site}</TableCell>
                  <TableCell>{pkg.ethicsBoard}</TableCell>
                  <TableCell>{getStatusBadge(pkg.status)}</TableCell>
                  <TableCell>{pkg.lastUpdated}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openViewDialog(pkg)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(pkg)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Package
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Site Package Details</DialogTitle>
            <DialogDescription>All details for package {selectedPackage?.id}</DialogDescription>
          </DialogHeader>
          {selectedPackage && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <span className="font-medium">Study:</span> {selectedPackage.study}
              </div>
              <div className="flex gap-2">
                <span className="font-medium">Site:</span> {selectedPackage.site}
              </div>
              <div className="flex gap-2">
                <span className="font-medium">Ethics Board:</span> {selectedPackage.ethicsBoard}
              </div>
              <div className="flex gap-2">
                <span className="font-medium">Status:</span> {getStatusBadge(selectedPackage.status)}
              </div>
              <div className="flex gap-2">
                <span className="font-medium">Last Updated:</span> {selectedPackage.lastUpdated}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)} variant="outline">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Edit Package Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Site Package</DialogTitle>
            <DialogDescription>Edit details for package {selectedPackage?.id}</DialogDescription>
          </DialogHeader>
          {selectedPackage && (
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); setEditDialogOpen(false); }}>
              <div className="flex flex-col gap-2">
                <label className="font-medium">Status</label>
                <select
                  className="border rounded px-2 py-1"
                  value={selectedPackage.status}
                  onChange={() => {}}
                  required
                >
                  {["Draft", "Submitted", "Approved", "Rejected"].map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SitePackageListPage; 