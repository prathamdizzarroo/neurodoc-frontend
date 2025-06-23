import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users, FileText, Settings, Activity, Shield, 
  BarChart3, Building2, Globe2, AlertTriangle,
  Clock, TrendingUp, CheckCircle2, XCircle,
  TrendingDown, Link, Plus, ClipboardList, FileSearch,
  ChevronRight, FileCheck, FolderArchive, Bell, Search,
  Download, Upload, Filter, RefreshCw, Calendar,
  BookOpen, FileWarning, History, HelpCircle,
  UserCircle, LogOut, User
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StudyManagement from './studies/StudyManagement';
import UserManagement from './users/UserManagement';
import ComplianceDashboard from './compliance/ComplianceDashboard';
import SystemSettings from './settings/SystemSettings';
import FacilityManagement from './FacilityManagement';
import SiteAssignmentManagement from '../../components/sites/SiteAssignmentManagement';
import ClinicalTrialsPage from '../clinical-trials/ClinicalTrialsPage';
import TMF_Viewer from '../tmf_viewer/TMFViewer';
import RegulatoryPackageTable from '../../components/regulatory/RegulatoryPackageTable';
import CreateRegulatoryPackage from '../../components/regulatory/CreateRegulatoryPackage';
import { useToast } from "@/components/ui/use-toast";
import axios from 'axios';
import { config } from '../../config/config';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import SitePackagePage from '../../components/sites/SitePackagePage';
import SitePackageListPage from '../../components/sites/SitePackageListPage';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedStudy, setSelectedStudy] = useState("");
  const [selectedSite, setSelectedSite] = useState("");
  const [metrics, setMetrics] = useState({
    users: { total: 0, active: 0, pending: 0, deactivated: 0, growth: 0 },
    studies: { total: 0, active: 0, completed: 0, draft: 0, compliance: 0 },
    documents: { total: 0, pending: 0, approved: 0, rejected: 0, processingTime: 0 },
    system: { uptime: 0, activeUsers: 0, pendingTasks: 0, alerts: 0 }
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [complianceMetrics, setComplianceMetrics] = useState({
    documentCompliance: 0,
    userTraining: 0,
    auditReadiness: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [showCreatePackage, setShowCreatePackage] = useState(false);
  const [selectedSitePackage, setSelectedSitePackage] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [metricsRes, activityRes, alertsRes, complianceRes] = await Promise.all([
        axios.get(`${config.API_URL}/admin/metrics`),
        axios.get(`${config.API_URL}/admin/recent-activity`),
        axios.get(`${config.API_URL}/admin/system-alerts`),
        axios.get(`${config.API_URL}/admin/compliance-metrics`)
      ]);

      setMetrics(metricsRes.data);
      setRecentActivity(activityRes.data);
      setSystemAlerts(alertsRes.data);
      setComplianceMetrics(complianceRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleComplianceClick = () => {
    setActiveTab("compliance");
  };

  const handleSettingsClick = () => {
    setActiveTab("settings");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Enhanced Header with Veeva-inspired elements */}
      <div className="flex flex-col gap-4">
        {/* Top Bar */}
        <div className="flex justify-between items-center pb-4 border-b">
          {/* Left Section - Brand and Title */}
          <div className="flex items-center gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Neurodoc Admin Console</h1>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Activity className="w-4 h-4" />
                <p className="text-sm">
                  Manage your organization's eTMF system and monitor key metrics
                </p>
              </div>
            </div>
          </div>

          {/* Study Selector */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-muted-foreground" />
              <Select
                value={selectedStudy}
                onValueChange={setSelectedStudy}
              >
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Select a study" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="study1">Study 1</SelectItem>
                  <SelectItem value="study2">Study 2</SelectItem>
                  <SelectItem value="study3">Study 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Right Section - System Info and Actions */}
          <div className="flex items-center gap-6">
            {/* System Status */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
              <div className="flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <span>System Operational</span>
              </div>
              <span className="text-muted-foreground/50">•</span>
              <span>Updated: 6/5/2025, 5:56 PM</span>
            </div>

            {/* Action Buttons Group */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <History className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
                  3
                </Badge>
              </Button>
            </div>

            {/* Admin Controls Group */}
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                className={`h-9 px-3 ${activeTab === 'compliance' ? 'bg-primary/10' : ''}`}
                onClick={handleComplianceClick}
              >
                <Shield className="w-4 h-4 mr-2" />
                Compliance
              </Button>
              <Button 
                variant="ghost" 
                className={`h-9 px-3 ${activeTab === 'settings' ? 'bg-primary/10' : ''}`}
                onClick={handleSettingsClick}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>

            {/* User Profile Group */}
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/avatars/01.png" alt="@admin" />
                      <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Admin User</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        admin@neurodoc.com
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-9 gap-4 bg-transparent h-auto p-0">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="studies"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <FileText className="w-4 h-4 mr-2" />
            Studies
          </TabsTrigger>
          <TabsTrigger
            value="regulatory-packages"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <FileCheck className="w-4 h-4 mr-2" />
            Regulatory
          </TabsTrigger>
          <TabsTrigger
            value="site-packages"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <FolderArchive className="w-4 h-4 mr-2" />
            Site Packages
          </TabsTrigger>
          <TabsTrigger
            value="clinical-trials"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <ClipboardList className="w-4 h-4 mr-2" />
            Clinical Trials
          </TabsTrigger>
          <TabsTrigger
            value="tmf-viewer"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <FileSearch className="w-4 h-4 mr-2" />
            TMF Viewer
          </TabsTrigger>
          <TabsTrigger
            value="facilities"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Building2 className="w-4 h-4 mr-2" />
            Facilities
          </TabsTrigger>
          <TabsTrigger
            value="sites"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Link className="w-4 h-4 mr-2" />
            Sites
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Users className="w-4 h-4 mr-2" />
            Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickStatCard
              title="Total Users"
              value={metrics.users.total}
              change={metrics.users.growth}
              icon={<Users className="w-4 h-4" />}
              details={[
                { label: 'Active', value: metrics.users.active },
                { label: 'Pending', value: metrics.users.pending },
                { label: 'Deactivated', value: metrics.users.deactivated }
              ]}
            />
            <QuickStatCard
              title="Active Studies"
              value={metrics.studies.total}
              change={metrics.studies.growth}
              icon={<FileText className="w-4 h-4" />}
              details={[
                { label: 'In Progress', value: metrics.studies.active },
                { label: 'Completed', value: metrics.studies.completed },
                { label: 'Draft', value: metrics.studies.draft }
              ]}
            />
            <QuickStatCard
              title="Document Processing"
              value={`${metrics.documents.processingTime}d`}
              change={metrics.documents.growth}
              icon={<Activity className="w-4 h-4" />}
              details={[
                { label: 'Pending', value: metrics.documents.pending },
                { label: 'Approved', value: metrics.documents.approved },
                { label: 'Rejected', value: metrics.documents.rejected }
              ]}
            />
            <QuickStatCard
              title="System Health"
              value={`${metrics.system.uptime}%`}
              change={metrics.system.growth}
              icon={<Globe2 className="w-4 h-4" />}
              details={[
                { label: 'Active Users', value: metrics.system.activeUsers },
                { label: 'Pending Tasks', value: metrics.system.pendingTasks },
                { label: 'Alerts', value: metrics.system.alerts }
              ]}
            />
          </div>

          {/* Recent Activity & Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Recent Activity</h3>
                  <Button variant="ghost" size="sm">View All</Button>
                </div>
                <ActivityList activities={recentActivity} />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">System Alerts</h3>
                  <Button variant="ghost" size="sm">View All</Button>
                </div>
                <AlertsList alerts={systemAlerts} />
              </CardContent>
            </Card>
          </div>

          {/* Compliance Overview */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Compliance Overview</h3>
                <Button variant="outline">Export Report</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ComplianceMetric
                  title="Document Compliance"
                  percentage={complianceMetrics.documentCompliance}
                  trend={complianceMetrics.documentComplianceTrend}
                />
                <ComplianceMetric
                  title="User Training Status"
                  percentage={complianceMetrics.userTraining}
                  trend={complianceMetrics.userTrainingTrend}
                />
                <ComplianceMetric
                  title="Audit Readiness"
                  percentage={complianceMetrics.auditReadiness}
                  trend={complianceMetrics.auditReadinessTrend}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="studies">
          <StudyManagement />
        </TabsContent>

        <TabsContent value="regulatory-packages">
          <Card>
            <CardContent className="p-6">
              {!showCreatePackage ? (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-xl font-semibold">Regulatory Packages</h2>
                      <p className="text-muted-foreground">Manage essential regulatory documents for clinical trials</p>
                    </div>
                    <Button 
                      className="flex items-center gap-2"
                      onClick={() => setShowCreatePackage(true)}
                    >
                      <Plus className="w-4 h-4" />
                      New Package
                    </Button>
                  </div>
                  <RegulatoryPackageTable />
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Create New Regulatory Package</h2>
                    <Button 
                      variant="outline"
                      onClick={() => setShowCreatePackage(false)}
                    >
                      Back to List
                    </Button>
                  </div>
                  <CreateRegulatoryPackage />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="site-packages">
          {selectedSitePackage ? (
            <Card>
              <CardContent className="p-6">
                <Button variant="outline" className="mb-4" onClick={() => setSelectedSitePackage(null)}>
                  Back to List
                </Button>
                <SitePackagePage packageData={selectedSitePackage} />
              </CardContent>
            </Card>
          ) : (
            <SitePackageListPage
              onSelectPackage={pkg => setSelectedSitePackage(pkg)}
              onCreateNew={() => setSelectedSitePackage({})}
            />
          )}
        </TabsContent>

        <TabsContent value="clinical-trials">
          <Card>
            <CardContent className="p-6">
              <ClinicalTrialsPage />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tmf-viewer">
          <Card>
            <CardContent className="p-6">
              <TMF_Viewer />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="facilities">
          <FacilityManagement />
        </TabsContent>

        <TabsContent value="sites">
              <SiteAssignmentManagement />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="compliance">
          <ComplianceDashboard />
        </TabsContent>

        <TabsContent value="settings">
          <SystemSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper Components
const QuickStatCard = ({ title, value, change, icon, details }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
        <div className={`p-2 rounded-full ${change >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          {icon}
        </div>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <span className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? '+' : ''}{change}%
        </span>
        <span className="text-sm text-muted-foreground">vs last month</span>
      </div>
      <div className="space-y-2">
        {details.map((detail, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{detail.label}</span>
            <span className="font-medium">{detail.value}</span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const ActivityList = ({ activities }) => (
  <div className="space-y-4">
    {activities.map((activity, index) => (
      <div key={index} className="flex items-start gap-4">
        <div className="p-2 rounded-full bg-primary/10">
          {getActivityIcon(activity.type)}
        </div>
        <div className="flex-1">
          <p className="font-medium">{activity.action}</p>
          <p className="text-sm text-muted-foreground">{activity.details}</p>
        </div>
        <span className="text-sm text-muted-foreground">{activity.time}</span>
      </div>
    ))}
  </div>
);

const AlertsList = ({ alerts }) => (
  <div className="space-y-4">
    {alerts.map((alert, index) => (
      <div key={index} className="flex items-start gap-4">
        <div className="p-2 rounded-full bg-primary/10">
          {getAlertIcon(alert.type)}
        </div>
        <div className="flex-1">
          <p className="font-medium">{alert.title}</p>
          <p className="text-sm text-muted-foreground">{alert.message}</p>
        </div>
        <span className="text-sm text-muted-foreground">{alert.time}</span>
      </div>
    ))}
  </div>
);

const ComplianceMetric = ({ title, percentage, trend }) => (
  <div className="p-4 border rounded-lg">
    <div className="flex justify-between items-center mb-2">
      <h4 className="font-medium">{title}</h4>
      {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
      {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
      {trend === 'stable' && <TrendingStable className="w-4 h-4 text-yellow-500" />}
    </div>
    <div className="flex items-end gap-2">
      <span className="text-2xl font-bold">{percentage}%</span>
      <span className="text-sm text-muted-foreground mb-1">compliant</span>
    </div>
  </div>
);

const TrendingStable = ({ className }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

// Helper functions for icons
const getActivityIcon = (type) => {
  const icons = {
    user: <Users className="w-4 h-4" />,
    document: <FileText className="w-4 h-4" />,
    study: <ClipboardList className="w-4 h-4" />,
    default: <Activity className="w-4 h-4" />
  };
  return icons[type] || icons.default;
};

const getAlertIcon = (type) => {
  const icons = {
    warning: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
    info: <Clock className="w-4 h-4 text-blue-500" />,
    error: <XCircle className="w-4 h-4 text-red-500" />,
    success: <CheckCircle2 className="w-4 h-4 text-green-500" />,
    default: <AlertTriangle className="w-4 h-4" />
  };
  return icons[type] || icons.default;
};

export default AdminDashboard; 