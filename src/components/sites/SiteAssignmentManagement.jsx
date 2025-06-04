import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Building2, User2, Pencil, Trash2 } from 'lucide-react';
import SiteAssignmentForm from './SiteAssignmentForm';
import { Badge } from "@/components/ui/badge";

// Mock data for studies, facilities, and users
const mockStudies = [
  { id: 'STUDY001', title: 'Phase III Clinical Trial for Alzheimer\'s Treatment' },
  { id: 'STUDY002', title: 'Phase II Oncology Study - Lung Cancer' },
  { id: 'STUDY003', title: 'Phase I Cardiovascular Research' },
];

const mockFacilities = [
  {
      id: 'FAC001',
      name: 'Mayo Clinic',
      location: 'Rochester, MN',
      type: 'HOSPITAL',
    contact: {
      phone: '+1 (507) 284-2511',
      email: 'contact@mayoclinic.org'
    }
  },
  {
    id: 'FAC002',
    name: 'Cleveland Clinic',
    location: 'Cleveland, OH',
    type: 'HOSPITAL',
    contact: {
      phone: '+1 (216) 444-2200',
      email: 'contact@clevelandclinic.org'
    }
  },
  {
    id: 'FAC003',
    name: 'Johns Hopkins Hospital',
    location: 'Baltimore, MD',
    type: 'HOSPITAL',
    contact: {
      phone: '+1 (410) 955-5000',
      email: 'contact@jhmi.edu'
    }
  }
];

const mockUsers = [
  {
      id: 'USER001',
      name: 'Dr. Sarah Johnson',
      role: 'Principal Investigator',
      email: 's.johnson@mayoclinic.org',
      phone: '+1 (507) 284-2511'
  },
  {
      id: 'USER002',
      name: 'Dr. Michael Chen',
      role: 'Principal Investigator',
      email: 'm.chen@clevelandclinic.org',
      phone: '+1 (216) 444-2200'
  },
  {
      id: 'USER003',
      name: 'Dr. Emily Rodriguez',
      role: 'Principal Investigator',
      email: 'e.rodriguez@jhmi.edu',
      phone: '+1 (410) 955-5000'
  }
];

// Mock sites data
const mockSites = [
  {
    id: 'SITE001',
    siteCode: 'SITE-ALZ001-MAYO-PI001',
    study: mockStudies[0],
    facility: mockFacilities[0],
    principalInvestigator: mockUsers[0],
      status: 'ACTIVE',
    enrollment: {
      current: 45,
      target: 100
    }
  },
  {
    id: 'SITE002',
    siteCode: 'SITE-ONC002-CLEV-PI002',
    study: mockStudies[1],
    facility: mockFacilities[1],
    principalInvestigator: mockUsers[1],
    status: 'ACTIVE',
    enrollment: {
      current: 32,
      target: 75
    }
  },
  {
    id: 'SITE003',
    siteCode: 'SITE-CVD003-JH-PI003',
    study: mockStudies[2],
    facility: mockFacilities[2],
    principalInvestigator: mockUsers[2],
    status: 'PENDING',
    enrollment: {
      current: 0,
      target: 50
    }
  }
];

const SiteAssignmentManagement = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);
  const [sites, setSites] = useState(mockSites);
  const [filters, setFilters] = useState({
    search: '',
    study: 'all',
    facility: 'all',
    status: 'all'
  });

  // Filter handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Filter sites based on search and filters
  const filteredSites = sites.filter(site => {
    const searchLower = filters.search.toLowerCase();
    const searchMatch = 
      site.study.title.toLowerCase().includes(searchLower) ||
      site.facility.name.toLowerCase().includes(searchLower) ||
      site.principalInvestigator.name.toLowerCase().includes(searchLower) ||
      site.siteCode.toLowerCase().includes(searchLower);

    const studyMatch = filters.study === 'all' || site.study.id === filters.study;
    const facilityMatch = filters.facility === 'all' || site.facility.id === filters.facility;
    const statusMatch = filters.status === 'all' || site.status === filters.status;

    return searchMatch && studyMatch && facilityMatch && statusMatch;
  });

  const handleDelete = (siteId) => {
    if (window.confirm('Are you sure you want to delete this site?')) {
      setSites(sites.filter(site => site.id !== siteId));
    }
  };

  return (
    <div className="space-y-6 p-6">
        <div>
        <h1 className="text-2xl font-semibold mb-2">Site Assignments</h1>
      </div>

      <div className="flex flex-col space-y-4">
        <h2 className="text-xl font-semibold">Sites</h2>
          <p className="text-muted-foreground">
            Manage unique combinations of studies, facilities, and assigned personnel
          </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
                <Input
                  placeholder="Search sites..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Study</label>
              <Select
                value={filters.study}
                onValueChange={(value) => handleFilterChange('study', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Study" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Studies</SelectItem>
              {mockStudies.map((study) => (
                <SelectItem key={study.id} value={study.id}>
                  {study.title}
                </SelectItem>
              ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Facility</label>
              <Select
                value={filters.facility}
                onValueChange={(value) => handleFilterChange('facility', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Facility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Facilities</SelectItem>
              {mockFacilities.map((facility) => (
                <SelectItem key={facility.id} value={facility.id}>
                  {facility.name}
                </SelectItem>
              ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

      {/* Sites Table */}
      <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Site Code</TableHead>
            <TableHead>Study Details</TableHead>
            <TableHead>Facility</TableHead>
            <TableHead>Site Personnel</TableHead>
            <TableHead>Enrollment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSites.map((site) => (
            <TableRow key={site.id}>
              <TableCell>
                <Badge variant="outline" className="font-mono">
                  {site.siteCode}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 mt-1 text-gray-500" />
                  <div>
                    <div className="font-medium">{site.study.title}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-start gap-2">
                  <Building2 className="h-4 w-4 mt-1 text-gray-500" />
                  <div>
                    <div className="font-medium">{site.facility.name}</div>
                    <div className="text-sm text-gray-500">
                      {site.facility.location} • {site.facility.type}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-start gap-2">
                  <User2 className="h-4 w-4 mt-1 text-gray-500" />
                  <div>
                      <div className="font-medium">{site.principalInvestigator.name}</div>
                    <div className="text-sm text-gray-500">
                        {site.principalInvestigator.role}
                      </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                    <div className="font-medium">{site.enrollment.current}/{site.enrollment.target}</div>
                  <div className="w-24 h-2 bg-gray-100 rounded-full mt-1">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ 
                          width: `${(site.enrollment.current / site.enrollment.target) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    site.status === 'ACTIVE' ? 'success' :
                    site.status === 'PENDING' ? 'warning' :
                      'default'
                  }
                >
                  {site.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                      size="icon"
                    onClick={() => {
                      setSelectedSite(site);
                        setShowDialog(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(site.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>

      {/* Add New Site Button */}
      <div className="flex justify-end">
        <Button onClick={() => setShowDialog(true)}>
          Add New Site
        </Button>
      </div>

      {/* Add/Edit Site Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedSite ? 'Edit Site' : 'Add New Site'}
            </DialogTitle>
          </DialogHeader>
          <SiteAssignmentForm
            studies={mockStudies}
            facilities={mockFacilities}
            users={mockUsers}
            onSubmit={(data) => {
              if (selectedSite) {
                // Update existing site
                setSites(sites.map(site => 
                  site.id === selectedSite.id ? {
                    ...site,
                    study: mockStudies.find(s => s.id === data.studyId),
                    facility: mockFacilities.find(f => f.id === data.facilityId),
                    principalInvestigator: mockUsers.find(u => u.id === data.principalInvestigatorId),
                  } : site
                ));
              } else {
                // Add new site
                const newSite = {
                  id: `SITE${String(sites.length + 1).padStart(3, '0')}`,
                  siteCode: `SITE-${data.studyId.slice(-3)}-${data.facilityId.slice(-3)}-${data.principalInvestigatorId.slice(-3)}`,
                  study: mockStudies.find(s => s.id === data.studyId),
                  facility: mockFacilities.find(f => f.id === data.facilityId),
                  principalInvestigator: mockUsers.find(u => u.id === data.principalInvestigatorId),
                  status: 'PENDING',
                  enrollment: {
                    current: 0,
                    target: 50
                  }
                };
                setSites([...sites, newSite]);
              }
              setShowDialog(false);
              setSelectedSite(null);
            }}
            onCancel={() => {
              setShowDialog(false);
              setSelectedSite(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SiteAssignmentManagement; 