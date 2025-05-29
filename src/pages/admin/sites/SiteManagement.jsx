import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit2, Trash2 } from "lucide-react";
import SiteAssignmentForm from '@/components/sites/SiteAssignmentForm';

// Mock data for initial development
const mockStudies = [
  { id: 'STUDY001', title: 'Phase III Clinical Trial for Alzheimer\'s Treatment' },
  { id: 'STUDY002', title: 'Phase II Oncology Study - Lung Cancer' },
  { id: 'STUDY003', title: 'Phase I Cardiovascular Research' },
];

const mockFacilities = [
  {
    id: 'FAC001',
    name: 'Mayo Clinic',
    contact: {
      phone: '+1 (507) 284-2511',
      email: 'contact@mayoclinic.org'
    }
  },
  {
    id: 'FAC002',
    name: 'Cleveland Clinic',
    contact: {
      phone: '+1 (216) 444-2200',
      email: 'contact@clevelandclinic.org'
    }
  },
  {
    id: 'FAC003',
    name: 'Johns Hopkins Hospital',
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

const mockSites = [
  {
    id: 1,
    study: mockStudies[0],
    facility: mockFacilities[0],
    principalInvestigator: mockUsers[0],
    status: 'Active'
  },
  {
    id: 2,
    study: mockStudies[1],
    facility: mockFacilities[1],
    principalInvestigator: mockUsers[1],
    status: 'Active'
  },
  {
    id: 3,
    study: mockStudies[2],
    facility: mockFacilities[2],
    principalInvestigator: mockUsers[2],
    status: 'Pending'
  }
];

const FacilityManagement = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);
  const [sites, setSites] = useState(mockSites);
  const [studies, setStudies] = useState(mockStudies);
  const [facilities, setFacilities] = useState(mockFacilities);
  const [users, setUsers] = useState(mockUsers);

  const handleSaveSite = (data) => {
    if (selectedSite) {
      // Update existing site
      setSites(sites.map(site => 
        site.id === selectedSite.id ? { ...site, ...data } : site
      ));
    } else {
      // Add new site
      const newSite = {
        id: sites.length + 1,
        study: studies.find(s => s.id === data.studyId),
        facility: facilities.find(f => f.id === data.facilityId),
        principalInvestigator: users.find(u => u.id === data.principalInvestigatorId),
        status: 'Active'
      };
      setSites([...sites, newSite]);
    }
    setShowDialog(false);
    setSelectedSite(null);
  };

  const handleEdit = (site) => {
    setSelectedSite(site);
    setShowDialog(true);
  };

  const handleDelete = (siteId) => {
    if (window.confirm('Are you sure you want to delete this site?')) {
      setSites(sites.filter(site => site.id !== siteId));
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Site Management</h1>
        <Button onClick={() => setShowDialog(true)}>
          Add New Site
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Study</TableHead>
              <TableHead>Facility</TableHead>
              <TableHead>Principal Investigator</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sites.map((site) => (
              <TableRow key={site.id}>
                <TableCell className="font-medium">{site.study.title}</TableCell>
                <TableCell>
                  {site.facility.name}
                  <br />
                  <span className="text-sm text-gray-500">
                    {site.facility.contact.phone}
                  </span>
                </TableCell>
                <TableCell>
                  {site.principalInvestigator.name}
                  <br />
                  <span className="text-sm text-gray-500">
                    {site.principalInvestigator.email}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    site.status === 'Active' ? 'bg-green-100 text-green-800' :
                    site.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {site.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(site)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(site.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedSite ? 'Edit Site' : 'Add New Site'}
            </DialogTitle>
          </DialogHeader>
          <SiteAssignmentForm
            studies={studies}
            facilities={facilities}
            users={users}
            onSubmit={handleSaveSite}
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

export default FacilityManagement; 