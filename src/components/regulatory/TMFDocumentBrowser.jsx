import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { tmfService } from '@/services/tmfService';
import SidebarNav from '@/pages/tmf_viewer/SidebarNav';

const TMFDocumentBrowser = ({ onDocumentSelect, onClose }) => {
  const [data, setData] = useState({
    zones: [],
    sections: {},
    artifacts: {},
    subArtifacts: {}
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Temporary hardcoded data for testing
      const hardcodedZones = [
        { _id: '1', zoneNumber: '1', zoneName: 'Trial Management' },
        { _id: '2', zoneNumber: '2', zoneName: 'Central Trial Documents' },
        { _id: '3', zoneNumber: '3', zoneName: 'Regulatory' },
        { _id: '4', zoneNumber: '4', zoneName: 'IRB or IEC and other Approvals' },
        { _id: '5', zoneNumber: '5', zoneName: 'Site Management' },
        { _id: '6', zoneNumber: '6', zoneName: 'IP and Trial Supplies' },
        { _id: '7', zoneNumber: '7', zoneName: 'Safety Reporting' },
        { _id: '8', zoneNumber: '8', zoneName: 'Central and Local Testing' },
        { _id: '9', zoneNumber: '9', zoneName: 'Third parties' },
        { _id: '10', zoneNumber: '10', zoneName: 'Data Management' },
        { _id: '11', zoneNumber: '11', zoneName: 'Statistics' }
      ];

      setData(prev => ({ ...prev, zones: hardcodedZones }));
      
      // Comment out the API call for now
      // const response = await tmfService.getZones();
      // console.log('Zones response:', response);
      // if (!response || !response.data) {
      //   throw new Error('Invalid response from server');
      // }
      // const zones = Array.isArray(response.data) ? response.data.map(zone => ({
      //   _id: zone._id || zone.id,
      //   zoneNumber: zone.zoneNumber || zone.number || '',
      //   zoneName: zone.zoneName || zone.name || ''
      // })) : [];
      // setData(prev => ({ ...prev, zones }));
    } catch (error) {
      console.error('Error loading zones:', error);
      setError(error.message || 'Failed to load TMF structure');
      toast({
        title: "Error",
        description: error.message || "Failed to load TMF structure. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSections = async (zoneId) => {
    try {
      const response = await tmfService.getSections(zoneId);
      console.log('Sections response:', response); // Debug log

      // Validate response data
      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }

      // Transform the sections data to match the expected structure
      const sections = Array.isArray(response.data) ? response.data.map(section => ({
        _id: section._id || section.id,
        sectionNumber: section.sectionNumber || section.number || '',
        sectionName: section.sectionName || section.name || '',
        zoneId: zoneId
      })) : [];

      console.log('Transformed sections:', sections); // Debug log
      setData(prev => ({
      ...prev,
        sections: { ...prev.sections, [zoneId]: sections }
      }));
    } catch (error) {
      console.error('Error loading sections:', error);
      toast({
        title: "Error",
        description: "Failed to load sections. Please try again.",
        variant: "destructive",
      });
    }
  };

  const loadArtifacts = async (sectionId) => {
    try {
      const response = await tmfService.getArtifacts(sectionId);
      console.log('Artifacts response:', response); // Debug log

      // Validate response data
      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }

      // Transform the artifacts data to match the expected structure
      const artifacts = Array.isArray(response.data) ? response.data.map(artifact => ({
        _id: artifact._id || artifact.id,
        artifactNumber: artifact.artifactNumber || artifact.number || '',
        artifactName: artifact.artifactName || artifact.name || '',
        sectionId: sectionId
      })) : [];

      console.log('Transformed artifacts:', artifacts); // Debug log
      setData(prev => ({
        ...prev,
        artifacts: { ...prev.artifacts, [sectionId]: artifacts }
      }));
    } catch (error) {
      console.error('Error loading artifacts:', error);
      toast({
        title: "Error",
        description: "Failed to load artifacts. Please try again.",
        variant: "destructive",
      });
    }
  };

  const loadSubArtifacts = async (artifactId) => {
    try {
      const response = await tmfService.getSubArtifacts(artifactId);
      console.log('SubArtifacts response:', response); // Debug log

      // Validate response data
      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }

      // Transform the sub-artifacts data to match the expected structure
      const subArtifacts = Array.isArray(response.data) ? response.data.map(subArtifact => ({
        _id: subArtifact._id || subArtifact.id,
        subArtifactNumber: subArtifact.subArtifactNumber || subArtifact.number || '',
        subArtifactName: subArtifact.subArtifactName || subArtifact.name || '',
        artifactId: artifactId
      })) : [];

      console.log('Transformed subArtifacts:', subArtifacts); // Debug log
      setData(prev => ({
        ...prev,
        subArtifacts: { ...prev.subArtifacts, [artifactId]: subArtifacts }
      }));
    } catch (error) {
      console.error('Error loading sub-artifacts:', error);
      toast({
        title: "Error",
        description: "Failed to load sub-artifacts. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleItemSelect = (item) => {
    console.log('Selected item:', item);
    if (item.type === 'subArtifact') {
      setSelectedItem(item.item);
    } else {
      setSelectedItem(null);
    }
  };

  const handleCreate = (type, parentId) => {
    // For now, we'll just show a toast message since this is a read-only browser
    toast({
      title: "Not Available",
      description: "Creating new items is not available in the document browser.",
      variant: "default",
    });
  };

  const handleImport = () => {
    if (selectedItem && onDocumentSelect) {
      onDocumentSelect(selectedItem);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-none p-6 border-b">
        <h2 className="text-2xl font-semibold">Import from TMF</h2>
      </div>
      
      <div className="flex-1 flex min-h-0">
        {/* Left sidebar */}
        <div className="w-80 flex-shrink-0 border-r">
          <div className="h-full flex flex-col">
            <div className="flex-none p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
            </div>
            
            <div className="flex-1 min-h-0">
              {error ? (
                <div className="flex flex-col items-center justify-center h-full text-destructive p-6">
              <AlertCircle className="w-6 h-6 mb-2" />
              <p>{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                    onClick={loadZones}
              >
                Retry
              </Button>
            </div>
          ) : (
                <div className="h-full">
                  <SidebarNav
                    data={data}
                    loading={loading}
                    onSelect={handleItemSelect}
                    onCreate={handleCreate}
                    loadSections={loadSections}
                    loadArtifacts={loadArtifacts}
                    loadSubArtifacts={loadSubArtifacts}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right content area */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 p-6">
            {selectedItem ? (
              <div className="h-full flex flex-col">
                <h3 className="text-lg font-semibold mb-4">Selected Document</h3>
                <div className="flex-1">
                  {/* Document details will go here */}
                  <p>Document details for: {selectedItem.subArtifactName}</p>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Select a document to view details
            </div>
          )}
          </div>
        </div>
      </div>

      <div className="flex-none p-6 border-t bg-background">
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport}
            disabled={!selectedItem}
          >
            Import Selected Document
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TMFDocumentBrowser; 