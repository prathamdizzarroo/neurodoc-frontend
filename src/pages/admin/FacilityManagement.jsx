import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Plus, Pencil, Trash2, Search, Filter, Building2, Users, ClipboardList, 
  Download, Upload, BarChart3, Clock, FileText, Activity, RefreshCcw, 
  ChevronDown, ChevronUp, FileSpreadsheet, AlertTriangle, CheckCircle2, Eye
} from 'lucide-react';
import FacilityForm from '../../components/facilities/FacilityForm';
import { Badge } from "@/components/ui/badge.jsx";
import { Progress } from "@/components/ui/progress.jsx";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip.jsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.jsx";
import { Calendar, MapPin, Phone, Mail } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox.jsx";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import facilityService from '../../services/facility.service';

// Dummy users data
const dummyUsers = [
  { _id: 'USER001', name: 'Dr. Sarah Johnson', role: 'Principal Investigator', email: 's.johnson@mayoclinic.org' },
  { _id: 'USER002', name: 'Dr. Michael Chen', role: 'Sub-Investigator', email: 'm.chen@mayoclinic.org' },
  { _id: 'USER003', name: 'Dr. Emily Rodriguez', role: 'Study Coordinator', email: 'e.rodriguez@mayoclinic.org' },
  { _id: 'USER004', name: 'Dr. James Wilson', role: 'Principal Investigator', email: 'j.wilson@jhmi.edu' },
  { _id: 'USER005', name: 'Dr. Lisa Thompson', role: 'Sub-Investigator', email: 'l.thompson@jhmi.edu' },
  { _id: 'USER006', name: 'Dr. Robert Brown', role: 'Study Coordinator', email: 'r.brown@jhmi.edu' },
  { _id: 'USER007', name: 'Dr. Patricia Lee', role: 'Principal Investigator', email: 'p.lee@ccf.org' },
  { _id: 'USER008', name: 'Dr. David Kim', role: 'Sub-Investigator', email: 'd.kim@ccf.org' },
  { _id: 'USER009', name: 'Dr. Maria Garcia', role: 'Study Coordinator', email: 'm.garcia@ccf.org' },
  { _id: 'USER010', name: 'Dr. Thomas White', role: 'Principal Investigator', email: 't.white@mgh.harvard.edu' },
  { _id: 'USER011', name: 'Dr. Jennifer Adams', role: 'Sub-Investigator', email: 'j.adams@mgh.harvard.edu' },
  { _id: 'USER012', name: 'Dr. Christopher Moore', role: 'Study Coordinator', email: 'c.moore@mgh.harvard.edu' },
  { _id: 'USER013', name: 'Dr. Elizabeth Taylor', role: 'Principal Investigator', email: 'e.taylor@stanford.edu' },
  { _id: 'USER014', name: 'Dr. William Clark', role: 'Sub-Investigator', email: 'w.clark@stanford.edu' },
  { _id: 'USER015', name: 'Dr. Rachel Green', role: 'Study Coordinator', email: 'r.green@stanford.edu' }
];

// Dummy sites data
const dummyFacilities = [
  {
    _id: '1',
    siteId: 'HOSP1A2B3C4D-HOSP-STUDY1A2B',
    name: 'Mayo Clinic',
    status: 'ACTIVE',
    siteType: 'HOSPITAL',
    address: {
      street: '200 First St SW',
      city: 'Rochester',
      state: 'MN',
      country: 'United States',
      postalCode: '55905'
    },
    contactInfo: {
      phone: '(507) 284-2511',
      email: 'research@mayoclinic.org',
      fax: '(507) 284-2512'
    },
    startDate: '2023-01-15',
    estimatedEndDate: '2024-12-31',
    enrollmentTarget: 200,
    actualEnrollment: 150,
    studies: [
      {
        _id: 'STUDY1A2B3C4D-ALZ-001',
        title: 'Phase III Clinical Trial for Alzheimer\'s Treatment',
        status: 'ACTIVE',
        startDate: '2023-01-15',
        endDate: '2024-12-31'
      }
    ]
  },
  {
    _id: '2',
    siteId: 'HOSP5E6F7G8H-HOSP-STUDY3B4C',
    name: 'Johns Hopkins Hospital',
    status: 'ACTIVE',
    siteType: 'HOSPITAL',
    address: {
      street: '1800 Orleans St',
      city: 'Baltimore',
      state: 'MD',
      country: 'United States',
      postalCode: '21287'
    },
    contactInfo: {
      phone: '(410) 955-5000',
      email: 'clinicaltrials@jhmi.edu',
      fax: '(410) 955-5001'
    },
    startDate: '2023-03-01',
    estimatedEndDate: '2024-06-30',
    enrollmentTarget: 150,
    actualEnrollment: 120,
    studies: []
  },
  {
    _id: '3',
    siteId: 'HOSP9I0J1K2L-CLIN-STUDY5D6E',
    name: 'Cleveland Clinic',
    status: 'PLANNED',
    siteType: 'CLINIC',
    address: {
      street: '9500 Euclid Ave',
      city: 'Cleveland',
      state: 'OH',
      country: 'United States',
      postalCode: '44195'
    },
    contactInfo: {
      phone: '(216) 444-2200',
      email: 'research@ccf.org',
      fax: '(216) 444-2201'
    },
    startDate: '2023-06-01',
    estimatedEndDate: '2024-12-31',
    enrollmentTarget: 180,
    actualEnrollment: 0,
    studies: []
  },
  {
    _id: '4',
    siteId: 'HOSP3M4N5O6P-RES-STUDY7F8G',
    name: 'Massachusetts General Hospital',
    status: 'SUSPENDED',
    siteType: 'RESEARCH_CENTER',
    address: {
      street: '55 Fruit St',
      city: 'Boston',
      state: 'MA',
      country: 'United States',
      postalCode: '02114'
    },
    contactInfo: {
      phone: '(617) 726-2000',
      email: 'clinicaltrials@mgh.harvard.edu',
      fax: '(617) 726-2001'
    },
    startDate: '2023-02-15',
    estimatedEndDate: '2024-08-31',
    enrollmentTarget: 160,
    actualEnrollment: 80,
    studies: []
  },
  {
    _id: '5',
    siteId: 'HOSP7Q8R9S0T-PHY-STUDY9H0I',
    name: 'Stanford Medical Center',
    status: 'ACTIVE',
    siteType: 'PHYSICIAN_OFFICE',
    address: {
      street: '300 Pasteur Dr',
      city: 'Stanford',
      state: 'CA',
      country: 'United States',
      postalCode: '94305'
    },
    contactInfo: {
      phone: '(650) 723-4000',
      email: 'clinicaltrials@stanford.edu',
      fax: '(650) 723-4001'
    },
    startDate: '2023-04-01',
    estimatedEndDate: '2024-10-31',
    enrollmentTarget: 140,
    actualEnrollment: 110,
    studies: []
  },
  // International sites
  {
    _id: '6',
    siteId: 'HOSP1U2V3W4X-HOSP-STUDY1J2K',
    name: 'Great Ormond Street Hospital',
    status: 'ACTIVE',
    siteType: 'HOSPITAL',
    address: {
      street: 'Great Ormond Street',
      city: 'London',
      state: '',
      country: 'United Kingdom',
      postalCode: 'WC1N 3JH'
    },
    contactInfo: {
      phone: '+44 20 7405 9200',
      email: 'research@gosh.nhs.uk',
      fax: '+44 20 7405 9201'
    },
    startDate: '2023-02-10',
    estimatedEndDate: '2024-08-15',
    enrollmentTarget: 120,
    actualEnrollment: 85,
    studies: [
      {
        _id: 'STUDY5E6F7G8H-ALZ-002',
        title: 'Phase III Clinical Trial for Alzheimer\'s Treatment',
        status: 'ACTIVE',
        startDate: '2023-02-10',
        endDate: '2024-08-15'
      }
    ]
  },
  {
    _id: '7',
    siteId: 'HOSP5Y6Z7A8B-HOSP-STUDY3L4M',
    name: 'Charité - Universitätsmedizin Berlin',
    status: 'ACTIVE',
    siteType: 'HOSPITAL',
    address: {
      street: 'Charitéplatz 1',
      city: 'Berlin',
      state: '',
      country: 'Germany',
      postalCode: '10117'
    },
    contactInfo: {
      phone: '+49 30 450 50',
      email: 'trials@charite.de',
      fax: '+49 30 450 51'
    },
    startDate: '2023-01-20',
    estimatedEndDate: '2024-09-30',
    enrollmentTarget: 160,
    actualEnrollment: 120,
    studies: [
      {
        _id: 'STUDY9I0J1K2L-PAR-001',
        title: 'Parkinson\'s Disease Treatment Study',
        status: 'ACTIVE',
        startDate: '2023-01-20',
        endDate: '2024-09-30'
      }
    ]
  },
  {
    _id: '8',
    siteId: 'HOSP8C9D0E1F-HOSP-STUDY4N5O',
    name: 'Karolinska University Hospital',
    status: 'ACTIVE',
    siteType: 'HOSPITAL',
    address: {
      street: 'Karolinska vägen',
      city: 'Stockholm',
      state: '',
      country: 'Sweden',
      postalCode: '17176'
    },
    contactInfo: {
      phone: '+46 8 517 700 00',
      email: 'research@karolinska.se',
      fax: '+46 8 517 700 01'
    },
    startDate: '2023-03-05',
    estimatedEndDate: '2024-11-15',
    enrollmentTarget: 140,
    actualEnrollment: 95,
    studies: [
      {
        _id: 'STUDY3M4N5O6P-EPI-001',
        title: 'Epilepsy Treatment Study',
        status: 'ACTIVE',
        startDate: '2023-03-05',
        endDate: '2024-11-15'
      }
    ]
  },
  {
    _id: '9',
    siteId: 'HOSP2G3H4I5J-HOSP-STUDY6P7Q',
    name: 'All India Institute of Medical Sciences',
    status: 'ACTIVE',
    siteType: 'HOSPITAL',
    address: {
      street: 'Ansari Nagar',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      postalCode: '110029'
    },
    contactInfo: {
      phone: '+91 11 2658 8500',
      email: 'research@aiims.edu',
      fax: '+91 11 2658 8501'
    },
    startDate: '2023-02-25',
    estimatedEndDate: '2024-10-30',
    enrollmentTarget: 200,
    actualEnrollment: 145,
    studies: [
      {
        _id: 'STUDY7Q8R9S0T-MSL-001',
        title: 'Multiple Sclerosis Treatment Research',
        status: 'ACTIVE',
        startDate: '2023-02-25',
        endDate: '2024-10-30'
      }
    ]
  },
  {
    _id: '10',
    siteId: 'HOSP6K7L8M9N-RES-STUDY8R9S',
    name: 'National Center for Neurology and Psychiatry',
    status: 'ACTIVE',
    siteType: 'RESEARCH_CENTER',
    address: {
      street: '4-1-1 Ogawahigashi',
      city: 'Kodaira',
      state: 'Tokyo',
      country: 'Japan',
      postalCode: '187-8551'
    },
    contactInfo: {
      phone: '+81 42 341 2711',
      email: 'research@ncnp.go.jp',
      fax: '+81 42 341 2712'
    },
    startDate: '2023-04-10',
    estimatedEndDate: '2024-12-15',
    enrollmentTarget: 180,
    actualEnrollment: 110,
    studies: [
      {
        _id: 'STUDY1U2V3W4X-ALZ-003',
        title: 'Phase III Clinical Trial for Alzheimer\'s Treatment',
        status: 'ACTIVE',
        startDate: '2023-04-10',
        endDate: '2024-12-15'
      }
    ]
  },
  {
    _id: '11',
    siteId: 'HOSP0O1P2Q3R-HOSP-STUDY0T1U',
    name: 'Singapore General Hospital',
    status: 'ACTIVE',
    siteType: 'HOSPITAL',
    address: {
      street: 'Outram Road',
      city: 'Singapore',
      state: '',
      country: 'Singapore',
      postalCode: '169608'
    },
    contactInfo: {
      phone: '+65 6222 3322',
      email: 'research@sgh.com.sg',
      fax: '+65 6222 3323'
    },
    startDate: '2023-03-15',
    estimatedEndDate: '2024-11-20',
    enrollmentTarget: 150,
    actualEnrollment: 105,
    studies: [
      {
        _id: 'STUDY5Y6Z7A8B-PAR-002',
        title: 'Parkinson\'s Disease Treatment Study',
        status: 'ACTIVE',
        startDate: '2023-03-15',
        endDate: '2024-11-20'
      }
    ]
  },
  {
    _id: '12',
    siteId: 'HOSP4S5T6U7V-HOSP-STUDY2V3W',
    name: 'Hospital Italiano de Buenos Aires',
    status: 'PLANNED',
    siteType: 'HOSPITAL',
    address: {
      street: 'Juan D. Perón 4190',
      city: 'Buenos Aires',
      state: '',
      country: 'Argentina',
      postalCode: 'C1181ACH'
    },
    contactInfo: {
      phone: '+54 11 4959 0200',
      email: 'investigacion@hospitalitaliano.org.ar',
      fax: '+54 11 4959 0201'
    },
    startDate: '2023-07-01',
    estimatedEndDate: '2025-01-15',
    enrollmentTarget: 130,
    actualEnrollment: 0,
    studies: []
  },
  {
    _id: '13',
    siteId: 'HOSP8W9X0Y1Z-HOSP-STUDY4X5Y',
    name: 'Peking Union Medical College Hospital',
    status: 'ACTIVE',
    siteType: 'HOSPITAL',
    address: {
      street: 'No.1 Shuaifuyuan',
      city: 'Beijing',
      state: '',
      country: 'China',
      postalCode: '100730'
    },
    contactInfo: {
      phone: '+86 10 6915 6114',
      email: 'research@pumch.cn',
      fax: '+86 10 6915 6115'
    },
    startDate: '2023-02-05',
    estimatedEndDate: '2024-10-15',
    enrollmentTarget: 220,
    actualEnrollment: 175,
    studies: [
      {
        _id: 'STUDY8C9D0E1F-ALZ-004',
        title: 'Phase III Clinical Trial for Alzheimer\'s Treatment',
        status: 'ACTIVE',
        startDate: '2023-02-05',
        endDate: '2024-10-15'
      }
    ]
  },
  {
    _id: '14',
    siteId: 'HOSP2A3B4C5D-HOSP-STUDY6Z7A',
    name: 'Royal Melbourne Hospital',
    status: 'ACTIVE',
    siteType: 'HOSPITAL',
    address: {
      street: '300 Grattan Street',
      city: 'Melbourne',
      state: 'Victoria',
      country: 'Australia',
      postalCode: '3050'
    },
    contactInfo: {
      phone: '+61 3 9342 7000',
      email: 'research@mh.org.au',
      fax: '+61 3 9342 7001'
    },
    startDate: '2023-03-20',
    estimatedEndDate: '2024-09-30',
    enrollmentTarget: 160,
    actualEnrollment: 125,
    studies: [
      {
        _id: 'STUDY2G3H4I5J-MSL-002',
        title: 'Multiple Sclerosis Treatment Research',
        status: 'ACTIVE',
        startDate: '2023-03-20',
        endDate: '2024-09-30'
      }
    ]
  },
  {
    _id: '15',
    siteId: 'HOSP6E7F8G9H-HOSP-STUDY8B9C',
    name: 'University Hospital Zurich',
    status: 'SUSPENDED',
    siteType: 'HOSPITAL',
    address: {
      street: 'Rämistrasse 100',
      city: 'Zurich',
      state: '',
      country: 'Switzerland',
      postalCode: '8091'
    },
    contactInfo: {
      phone: '+41 44 255 11 11',
      email: 'research@usz.ch',
      fax: '+41 44 255 11 12'
    },
    startDate: '2023-01-25',
    estimatedEndDate: '2024-08-15',
    enrollmentTarget: 140,
    actualEnrollment: 60,
    studies: [
      {
        _id: 'STUDY6K7L8M9N-EPI-002',
        title: 'Epilepsy Treatment Study',
        status: 'SUSPENDED',
        startDate: '2023-01-25',
        endDate: '2024-08-15'
      }
    ]
  }
];

// Add these near the top of the file, after the imports
const siteTypes = ['HOSPITAL', 'CLINIC', 'RESEARCH_CENTER', 'PHYSICIAN_OFFICE', 'OTHER'];
const statusOptions = ['PLANNED', 'ACTIVE', 'COMPLETED', 'SUSPENDED', 'TERMINATED'];
const countries = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 'India', 'Germany', 'France', 
  'China', 'Japan', 'Brazil', 'South Africa', 'Mexico', 'Italy', 'Spain', 'Netherlands', 
  'Russia', 'South Korea', 'Turkey', 'Sweden', 'Switzerland', 'Singapore', 'Israel'
];

// Add activity log sample data
const activityLogData = {
  "1": [
    { id: "log-001", action: "Facility Created", user: "Dr. Sarah Johnson", timestamp: "2023-01-10T14:30:00Z", details: "Initial facility setup completed" },
    { id: "log-002", action: "Study Assigned", user: "Dr. Sarah Johnson", timestamp: "2023-01-15T09:45:00Z", details: "Added to Phase III Alzheimer's Treatment Trial" },
    { id: "log-003", action: "User Assigned", user: "Admin", timestamp: "2023-01-15T10:30:00Z", details: "Dr. Michael Chen assigned as Sub-Investigator" },
    { id: "log-004", action: "Facility Activated", user: "Admin", timestamp: "2023-01-15T14:20:00Z", details: "Facility status changed to ACTIVE" },
    { id: "log-005", action: "Enrollment Updated", user: "Dr. Emily Rodriguez", timestamp: "2023-02-20T11:15:00Z", details: "Enrollment changed from 0 to 25" },
    { id: "log-006", action: "Study Assigned", user: "Admin", timestamp: "2023-03-01T16:40:00Z", details: "Added to Parkinson's Disease Treatment Study" },
    { id: "log-007", action: "Enrollment Updated", user: "Dr. Emily Rodriguez", timestamp: "2023-04-10T09:30:00Z", details: "Enrollment increased to 75" },
    { id: "log-008", action: "User Assigned", user: "Admin", timestamp: "2023-06-05T15:20:00Z", details: "Dr. Mark Wilson assigned as Data Manager" },
    { id: "log-009", action: "Enrollment Updated", user: "Dr. Emily Rodriguez", timestamp: "2023-07-22T13:45:00Z", details: "Enrollment increased to 120" },
    { id: "log-010", action: "Facility Information Updated", user: "Admin", timestamp: "2023-09-14T10:10:00Z", details: "Contact information updated" },
    { id: "log-011", action: "Enrollment Updated", user: "Dr. Emily Rodriguez", timestamp: "2023-11-30T14:05:00Z", details: "Enrollment increased to 150" }
  ],
  "2": [
    { id: "log-101", action: "Facility Created", user: "Admin", timestamp: "2023-02-25T11:20:00Z", details: "Initial facility setup completed" },
    { id: "log-102", action: "Facility Activated", user: "Admin", timestamp: "2023-03-01T09:30:00Z", details: "Facility status changed to ACTIVE" },
    { id: "log-103", action: "User Assigned", user: "Admin", timestamp: "2023-03-01T10:15:00Z", details: "Dr. James Wilson assigned as Principal Investigator" }
  ],
  "3": [
    { id: "log-201", action: "Facility Created", user: "Admin", timestamp: "2023-05-15T13:40:00Z", details: "Initial facility setup completed" },
    { id: "log-202", action: "Facility Status Changed", user: "Admin", timestamp: "2023-06-01T15:20:00Z", details: "Facility status set to PLANNED" }
  ],
  "4": [
    { id: "log-301", action: "Facility Created", user: "Admin", timestamp: "2023-02-10T10:15:00Z", details: "Initial facility setup completed" },
    { id: "log-302", action: "Facility Activated", user: "Admin", timestamp: "2023-02-15T16:30:00Z", details: "Facility status changed to ACTIVE" },
    { id: "log-303", action: "Enrollment Updated", user: "Dr. Thomas White", timestamp: "2023-04-20T11:45:00Z", details: "Enrollment changed from 0 to 30" },
    { id: "log-304", action: "Enrollment Updated", user: "Dr. Thomas White", timestamp: "2023-06-10T14:20:00Z", details: "Enrollment increased to 60" },
    { id: "log-305", action: "Enrollment Updated", user: "Dr. Thomas White", timestamp: "2023-07-05T09:50:00Z", details: "Enrollment increased to 80" },
    { id: "log-306", action: "Facility Suspended", user: "Admin", timestamp: "2023-08-15T13:10:00Z", details: "Facility status changed to SUSPENDED due to protocol violation" }
  ],
  "5": [
    { id: "log-401", action: "Facility Created", user: "Admin", timestamp: "2023-03-25T14:50:00Z", details: "Initial facility setup completed" },
    { id: "log-402", action: "Facility Activated", user: "Admin", timestamp: "2023-04-01T10:20:00Z", details: "Facility status changed to ACTIVE" }
  ],
  "6": [
    { id: "log-501", action: "Facility Created", user: "Dr. William Harrington", timestamp: "2023-02-08T09:15:00Z", details: "Initial facility setup completed" },
    { id: "log-502", action: "Facility Activated", user: "Admin", timestamp: "2023-02-10T11:30:00Z", details: "Facility status changed to ACTIVE" },
    { id: "log-503", action: "Study Assigned", user: "Admin", timestamp: "2023-02-10T14:45:00Z", details: "Added to Phase III Alzheimer's Treatment Trial" },
    { id: "log-504", action: "Enrollment Updated", user: "Dr. William Harrington", timestamp: "2023-04-15T10:20:00Z", details: "Enrollment changed from 0 to 40" },
    { id: "log-505", action: "Enrollment Updated", user: "Dr. William Harrington", timestamp: "2023-07-22T15:30:00Z", details: "Enrollment increased to 85" }
  ],
  "7": [
    { id: "log-601", action: "Facility Created", user: "Dr. Lukas Schmidt", timestamp: "2023-01-18T10:45:00Z", details: "Initial facility setup completed" },
    { id: "log-602", action: "Facility Activated", user: "Admin", timestamp: "2023-01-20T14:20:00Z", details: "Facility status changed to ACTIVE" },
    { id: "log-603", action: "Study Assigned", user: "Admin", timestamp: "2023-01-20T16:15:00Z", details: "Added to Parkinson's Disease Treatment Study" },
    { id: "log-604", action: "Enrollment Updated", user: "Dr. Lukas Schmidt", timestamp: "2023-04-05T11:10:00Z", details: "Enrollment changed from 0 to 50" },
    { id: "log-605", action: "Enrollment Updated", user: "Dr. Lukas Schmidt", timestamp: "2023-07-10T09:45:00Z", details: "Enrollment increased to 90" },
    { id: "log-606", action: "Enrollment Updated", user: "Dr. Lukas Schmidt", timestamp: "2023-10-18T14:30:00Z", details: "Enrollment increased to 120" }
  ],
  "9": [
    { id: "log-701", action: "Facility Created", user: "Dr. Rajiv Patel", timestamp: "2023-02-22T13:15:00Z", details: "Initial facility setup completed" },
    { id: "log-702", action: "Facility Activated", user: "Admin", timestamp: "2023-02-25T10:45:00Z", details: "Facility status changed to ACTIVE" },
    { id: "log-703", action: "Study Assigned", user: "Admin", timestamp: "2023-02-25T14:30:00Z", details: "Added to Multiple Sclerosis Treatment Research" },
    { id: "log-704", action: "Enrollment Updated", user: "Dr. Rajiv Patel", timestamp: "2023-04-12T11:20:00Z", details: "Enrollment changed from 0 to 60" },
    { id: "log-705", action: "Enrollment Updated", user: "Dr. Rajiv Patel", timestamp: "2023-07-05T15:45:00Z", details: "Enrollment increased to 110" },
    { id: "log-706", action: "Enrollment Updated", user: "Dr. Rajiv Patel", timestamp: "2023-10-20T09:30:00Z", details: "Enrollment increased to 145" }
  ],
  "13": [
    { id: "log-801", action: "Facility Created", user: "Dr. Li Wei", timestamp: "2023-02-02T09:45:00Z", details: "Initial facility setup completed" },
    { id: "log-802", action: "Facility Activated", user: "Admin", timestamp: "2023-02-05T13:20:00Z", details: "Facility status changed to ACTIVE" },
    { id: "log-803", action: "Study Assigned", user: "Admin", timestamp: "2023-02-05T16:15:00Z", details: "Added to Phase III Alzheimer's Treatment Trial" },
    { id: "log-804", action: "Enrollment Updated", user: "Dr. Li Wei", timestamp: "2023-04-10T10:30:00Z", details: "Enrollment changed from 0 to 70" },
    { id: "log-805", action: "Enrollment Updated", user: "Dr. Li Wei", timestamp: "2023-07-15T14:45:00Z", details: "Enrollment increased to 130" },
    { id: "log-806", action: "Enrollment Updated", user: "Dr. Li Wei", timestamp: "2023-11-05T11:20:00Z", details: "Enrollment increased to 175" }
  ],
  "15": [
    { id: "log-901", action: "Facility Created", user: "Dr. Martin Weber", timestamp: "2023-01-22T13:10:00Z", details: "Initial facility setup completed" },
    { id: "log-902", action: "Facility Activated", user: "Admin", timestamp: "2023-01-25T10:45:00Z", details: "Facility status changed to ACTIVE" },
    { id: "log-903", action: "Study Assigned", user: "Admin", timestamp: "2023-01-25T14:30:00Z", details: "Added to Epilepsy Treatment Study" },
    { id: "log-904", action: "Enrollment Updated", user: "Dr. Martin Weber", timestamp: "2023-03-15T11:20:00Z", details: "Enrollment changed from 0 to 30" },
    { id: "log-905", action: "Enrollment Updated", user: "Dr. Martin Weber", timestamp: "2023-05-20T09:45:00Z", details: "Enrollment increased to 60" },
    { id: "log-906", action: "Facility Suspended", user: "Admin", timestamp: "2023-07-12T14:30:00Z", details: "Facility status changed to SUSPENDED due to protocol deviation concerns" }
  ]
};

// Add function to format timestamp
const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Update the getStatusColor function to remove background colors
const getStatusColor = (status) => {
  switch (status) {
    case 'ACTIVE':
      return {
        text: 'text-green-600',
        border: 'border-green-200',
        color: 'green',
        variant: 'success'
      };
    case 'PLANNED':
      return {
        text: 'text-blue-600',
        border: 'border-blue-200',
        color: 'blue',
        variant: 'secondary'
      };
    case 'SUSPENDED':
      return {
        text: 'text-amber-600',
        border: 'border-amber-200',
        color: 'amber',
        variant: 'warning'
      };
    case 'TERMINATED':
      return {
        text: 'text-red-600',
        border: 'border-red-200',
        color: 'red',
        variant: 'destructive'
      };
    case 'COMPLETED':
      return {
        text: 'text-purple-600',
        border: 'border-purple-200',
        color: 'purple',
        variant: 'default'
      };
    default:
      return {
        text: 'text-gray-600',
        border: 'border-gray-200',
        color: 'gray',
        variant: 'outline'
      };
  }
};

const FacilityManagement = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [sites] = useState(dummyFacilities);
  const [error, setError] = useState(null);

  // Inside the component, add these filter states
  const [filters, setFilters] = useState({
    siteType: '',
    status: '',
    country: '',
    search: '',
    enrollmentStatus: '',
    assignedStudy: '',
    assignedUser: ''
  });

  // Fetch all studies for assignment
  const { data: studies } = useQuery({
    queryKey: ['studies'],
    queryFn: async () => {
      return [
        {
          _id: 'STUDY001',
          title: 'Phase III Clinical Trial for Alzheimer\'s Treatment',
          sites: ['1', '2'] // Facility IDs assigned to this study
        },
        {
          _id: 'STUDY002',
          title: 'Parkinson\'s Disease Treatment Study',
          sites: ['2', '3']
        },
        {
          _id: 'STUDY003',
          title: 'Multiple Sclerosis Treatment Research',
          sites: ['4']
        },
        {
          _id: 'STUDY004',
          title: 'Epilepsy Treatment Study',
          sites: ['5']
        }
      ];
    }
  });

  // Fetch facilities with filters
  const { data: facilitiesData, isLoading } = useQuery({
    queryKey: ['facilities', filters],
    queryFn: async () => {
      const response = await facilityService.getFacilities(filters);
      if (!response.success) {
        setError(response.error);
        return { data: [] };
      }
      return response;
    }
  });

  // Create/Update facility mutation
  const facilityMutation = useMutation({
    mutationFn: (facilityData) => {
      if (selectedFacility) {
        return facilityService.updateFacility(selectedFacility._id, facilityData);
      }
      return facilityService.createFacility(facilityData);
    },
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries(['facilities']);
        setShowForm(false);
        setSelectedFacility(null);
        setError(null);
      } else {
        setError(response.error);
      }
    },
    onError: (error) => {
      setError(error.message);
    }
  });

  // Delete facility mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => facilityService.deleteFacility(id),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries(['facilities']);
        setError(null);
      } else {
        setError(response.error);
      }
    },
    onError: (error) => {
      setError(error.message);
    }
  });

  // Batch import mutation
  const batchImportMutation = useMutation({
    mutationFn: (file) => facilityService.batchImport(file),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries(['facilities']);
        setShowBatchImport(false);
        setBatchImportFile(null);
        setError(null);
      } else {
        setError(response.error);
      }
    },
    onError: (error) => {
      setError(error.message);
    }
  });

  const handleEdit = (facility) => {
    setSelectedFacility(facility);
    setShowForm(true);
  };

  const handleDelete = (facility) => {
    if (window.confirm('Are you sure you want to delete this facility?')) {
      deleteMutation.mutate(facility._id);
    }
  };

  const handleSubmit = (formData) => {
    facilityMutation.mutate(formData);
  };

  // Replace the existing search state with the filter state update
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add state for batch import and activity log
  const [selectedFacilities] = useState([]);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [selectedFacilityForActivity, setSelectedFacilityForActivity] = useState(null);
  const [showBatchImport, setShowBatchImport] = useState(false);
  const fileInputRef = useRef(null);
  const [batchImportFile, setBatchImportFile] = useState(null);
  const [isImporting] = useState(false);
  const [showStudiesDialog, setShowStudiesDialog] = useState(false);
  const [showStaffDialog, setShowStaffDialog] = useState(false);
  const [selectedFacilityForStudies, setSelectedFacilityForStudies] = useState(null);
  const [selectedFacilityForStaff, setSelectedFacilityForStaff] = useState(null);

  // Add batch import handler
  const handleBatchImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setBatchImportFile(e.target.files[0]);
      setShowBatchImport(true);
    }
  };

  const handleBatchImport = () => {
    if (batchImportFile) {
      batchImportMutation.mutate(batchImportFile);
    }
  };

  // Add activity log viewer handler
  const handleViewActivity = (facility) => {
    setSelectedFacilityForActivity(facility);
    setShowActivityLog(true);
  };

  return (
    <Card className="mt-4">
      <CardContent className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Facility Management</h2>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setShowAnalytics(!showAnalytics)}>
              <BarChart3 className="mr-2 h-4 w-4" />
              {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
            </Button>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" onClick={handleBatchImportClick}>
                    <Upload className="mr-2 h-4 w-4" />
                    Batch Import
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Import multiple sites via CSV or Excel
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv,.xlsx,.xls"
              className="hidden"
            />
            
            <Button onClick={() => {
              setSelectedFacility(null);
              setShowForm(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Assign Facility
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Search</h3>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search facilities..."
                      name="search"
                      value={filters.search}
                      onChange={handleFilterChange}
                      className="pl-8"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Facility Type</h3>
                  <select
                    name="siteType"
                    value={filters.siteType}
                    onChange={handleFilterChange}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">All Types</option>
                    {siteTypes.map(type => (
                      <option key={type} value={type}>
                        {type.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Status</h3>
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">All Statuses</option>
                    {statusOptions.map(status => (
                      <option 
                        key={status} 
                        value={status}
                        className={getStatusColor(status).text}
                      >
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Country</h3>
                  <select
                    name="country"
                    value={filters.country}
                    onChange={handleFilterChange}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">All Countries</option>
                    {countries.map(country => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Enrollment Status</h3>
                  <select
                    name="enrollmentStatus"
                    value={filters.enrollmentStatus}
                    onChange={handleFilterChange}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">All</option>
                    <option value="FULL">Full (100%)</option>
                    <option value="PARTIAL">Partial</option>
                    <option value="NONE">None (0%)</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Assigned Study</h3>
                  <select
                    name="assignedStudy"
                    value={filters.assignedStudy}
                    onChange={handleFilterChange}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">All Studies</option>
                    {studies ? studies.map(study => (
                      <option key={study._id} value={study._id}>
                        {study.title}
                      </option>
                    )) : null}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Assigned User</h3>
                  <select
                    name="assignedUser"
                    value={filters.assignedUser}
                    onChange={handleFilterChange}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">All Users</option>
                    {dummyUsers.map(user => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2 flex items-end">
                  <Button 
                    onClick={() => setFilters({
                      siteType: '',
                      status: '',
                      country: '',
                      search: '',
                      enrollmentStatus: '',
                      assignedStudy: '',
                      assignedUser: ''
                    })}
                    variant="outline"
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Facility Code</TableHead>
                <TableHead>Facility Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>City, Country</TableHead>
                <TableHead className="text-center">Active Studies</TableHead>
                <TableHead className="text-center">Assigned Staff</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {facilitiesData?.data.map((facility) => (
                <TableRow 
                  key={facility._id} 
                  className={`hover:bg-gray-50 ${
                    selectedFacilities.includes(facility._id) 
                      ? 'bg-blue-50' 
                      : ''
                  }`}
                >
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {facility.siteId}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium">{facility.name}</div>
                        <div className="text-sm text-gray-500">{facility.siteType}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={getStatusColor(facility.status).variant}
                      className={`px-2 py-1 ${getStatusColor(facility.status).text}`}
                    >
                      {facility.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{facility.address?.city}, {facility.address?.country}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Badge variant="secondary">
                        {facility.studies?.length || 0} Studies
                      </Badge>
                      {facility.studies?.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedFacilityForStudies(facility);
                            setShowStudiesDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Badge variant="secondary">
                        {facility.assignedUsers?.length || 0} Staff
                      </Badge>
                      {facility.assignedUsers?.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedFacilityForStaff(facility);
                            setShowStaffDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewActivity(facility)}
                            >
                              <Activity className="h-4 w-4 text-gray-600" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View Activity Log</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(facility)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit Facility</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(facility)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete Facility</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {showForm && (
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  Assign Facility
                </DialogTitle>
              </DialogHeader>
              <FacilityForm
                facility={selectedFacility}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setSelectedFacility(null);
                }}
              />
            </DialogContent>
          </Dialog>
        )}

        {showBatchImport && batchImportFile && (
          <Dialog open={showBatchImport} onOpenChange={setShowBatchImport}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Batch Import Facilities</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-blue-50 rounded-md">
                  <FileSpreadsheet className="h-8 w-8 text-blue-500 mr-4" />
                  <div>
                    <p className="font-medium">{batchImportFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(batchImportFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Import Options</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Checkbox id="skipHeader" />
                      <label htmlFor="skipHeader" className="ml-2 text-sm">
                        Skip header row
                      </label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox id="updateExisting" />
                      <label htmlFor="updateExisting" className="ml-2 text-sm">
                        Update existing facilities (match by Facility ID)
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Required Columns</h3>
                  <p className="text-sm text-gray-600">
                    Your import file must include these columns: Facility ID, Name, Type, Status, 
                    Address, City, State, Country, Postal Code, Contact Email, Contact Phone, 
                    Enrollment Target
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowBatchImport(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBatchImport} disabled={isImporting}>
                  {isImporting ? (
                    <>
                      <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : "Start Import"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {showActivityLog && selectedFacilityForActivity && (
          <Dialog open={showActivityLog} onOpenChange={setShowActivityLog}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Activity Log - {selectedFacilityForActivity.name}</DialogTitle>
                <DialogDescription>
                  View all activity and changes for this facility
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-2">
                      {activityLogData[selectedFacilityForActivity._id]?.length || 0} Events
                    </Badge>
                    <span className="text-sm text-gray-500">
                      Most recent activity: {
                        activityLogData[selectedFacilityForActivity._id]?.length > 0 
                          ? formatDate(activityLogData[selectedFacilityForActivity._id][0].timestamp)
                          : 'No activity'
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Export Log
                    </Button>
                  </div>
                </div>
                
                <div className="border rounded-md">
                  {activityLogData[selectedFacilityForActivity._id]?.length > 0 ? (
                    <div className="divide-y">
                      {activityLogData[selectedFacilityForActivity._id]
                        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                        .map(log => (
                        <div key={log.id} className={`p-3 hover:bg-gray-50 ${
                          log.action.includes("Status") || log.action.includes("Activated") || log.action.includes("Suspended")
                            ? `border-l-4 ${getStatusColor(log.details.includes("ACTIVE") ? "ACTIVE" : 
                                    log.details.includes("SUSPENDED") ? "SUSPENDED" : 
                                    log.details.includes("PLANNED") ? "PLANNED" : 
                                    log.details.includes("TERMINATED") ? "TERMINATED" : 
                                    log.details.includes("COMPLETED") ? "COMPLETED" : "").border}`
                            : ""
                        }`}>
                          <div className="flex justify-between">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                                {log.action === "Facility Created" && <Building2 className="h-4 w-4 text-blue-500" />}
                                {log.action === "Study Assigned" && <ClipboardList className="h-4 w-4 text-purple-500" />}
                                {log.action === "User Assigned" && <Users className="h-4 w-4 text-green-500" />}
                                {log.action === "Facility Activated" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                {log.action === "Facility Suspended" && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                                {log.action === "Enrollment Updated" && <Activity className="h-4 w-4 text-blue-500" />}
                                {log.action === "Facility Information Updated" && <Pencil className="h-4 w-4 text-gray-500" />}
                                {log.action === "Facility Status Changed" && <RefreshCcw className="h-4 w-4 text-amber-500" />}
                              </div>
                              <div>
                                <div className="font-medium">{log.action}</div>
                                <div className="text-sm text-gray-500">{log.details}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-500">{formatDate(log.timestamp)}</div>
                              <div className="text-xs text-gray-400">By {log.user}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      No activity recorded for this facility
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {showStudiesDialog && selectedFacilityForStudies && (
          <Dialog open={showStudiesDialog} onOpenChange={setShowStudiesDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Active Studies - {selectedFacilityForStudies.name}</DialogTitle>
                <DialogDescription>
                  List of all studies assigned to this facility
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {selectedFacilityForStudies.studies.map(study => (
                  <div key={study._id} className="flex items-start space-x-4 p-4 border rounded-lg bg-gray-50">
                    <div className="flex-1">
                      <h4 className="font-medium">{study.title}</h4>
                      <div className="mt-1 text-sm text-gray-500 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusColor(study.status).variant}>
                            {study.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{study.startDate} - {study.endDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {showStaffDialog && selectedFacilityForStaff && (
          <Dialog open={showStaffDialog} onOpenChange={setShowStaffDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Assigned Staff - {selectedFacilityForStaff.name}</DialogTitle>
                <DialogDescription>
                  List of all staff members assigned to this facility
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {selectedFacilityForStaff.assignedUsers?.map(user => (
                  <div key={user._id} className="flex items-start space-x-4 p-4 border rounded-lg bg-gray-50">
                    <div className="flex-1">
                      <h4 className="font-medium">{user.name}</h4>
                      <div className="mt-1 text-sm text-gray-500 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{user.role}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {showAnalytics && (
          <Card className="mb-6 border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Facilities Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* existing analytics cards */}
              </div>
              
              {/* Add facility metrics visualization */}
              <div className="mt-6">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="enrollment-metrics">
                    <AccordionTrigger className="text-base font-medium">
                      Enrollment Metrics by Facility
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pt-4">
                        <div className="space-y-4">
                          {sites.map(facility => (
                            <div key={facility._id} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                  <Building2 className="w-4 h-4 mr-2 text-gray-500" />
                                  <span className="font-medium">{facility.name}</span>
                                </div>
                                <div className="text-sm">
                                  <span className="font-medium">{facility.actualEnrollment}</span>
                                  <span className="text-gray-500">/{facility.enrollmentTarget}</span>
                                  <span className="ml-2 text-gray-500">
                                    ({Math.round((facility.actualEnrollment / facility.enrollmentTarget) * 100)}%)
                                  </span>
                                </div>
                              </div>
                              <Progress 
                                value={(facility.actualEnrollment / facility.enrollmentTarget) * 100} 
                                className="h-2"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="status-distribution">
                    <AccordionTrigger className="text-base font-medium">
                      Facility Status Distribution
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pt-4">
                        <div className="grid grid-cols-4 gap-2">
                          {['ACTIVE', 'PLANNED', 'SUSPENDED', 'TERMINATED'].map(status => {
                            const count = sites.filter(facility => facility.status === status).length;
                            const percentage = Math.round((count / sites.length) * 100);
                            const statusStyle = getStatusColor(status);
                            
                            return (
                              <div key={status} className={`flex flex-col items-center p-4 border rounded-md ${statusStyle.border}`}>
                                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-2">
                                  <span className={`text-2xl font-bold ${statusStyle.text}`}>
                                    {count}
                                  </span>
                                </div>
                                <Badge variant={statusStyle.variant} className={statusStyle.text}>
                                  {status}
                                </Badge>
                                <span className="text-sm mt-1">{percentage}%</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="geographical-spread">
                    <AccordionTrigger className="text-base font-medium">
                      Geographical Spread
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pt-4">
                        <div className="space-y-3">
                          {Array.from(new Set(sites.map(facility => facility.address?.country))).map(country => {
                            if (!country) return null;
                            
                            const sitesInCountry = sites.filter(facility => facility.address?.country === country);
                            const percentage = Math.round((sitesInCountry.length / sites.length) * 100);
                            
                            return (
                              <div key={country} className="flex items-center">
                                <div className="w-28 pr-4 font-medium">{country}</div>
                                <div className="flex-1">
                                  <div className="h-5 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-blue-500 rounded-full"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                                <div className="w-16 pl-2 text-right text-sm">
                                  {sitesInCountry.length} ({percentage}%)
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default FacilityManagement; 