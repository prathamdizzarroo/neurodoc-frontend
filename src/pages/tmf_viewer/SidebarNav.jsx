import React, { useState } from 'react';
import { Folder, File, ChevronRight, ChevronDown, Plus, Settings, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { artifactSubartifacts } from '@/data/artifactSubartifacts';

const SidebarNav = ({ 
  data, 
  loading, 
  onSelect, 
  onCreate, 
  loadSections, 
  loadArtifacts, 
  loadSubArtifacts,
}) => {
  const [expanded, setExpanded] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);

  // Move hardcodedZones to component level
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

  const toggleExpand = async (id, type) => {
      setExpanded(prev => ({
        ...prev,
        [id]: !prev[id]
      }));
  };

  const handleItemSelect = async (type, item) => {
    setSelectedItem({ type, item });
    onSelect({ type, item });
  };

  const renderZones = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      );
    }
    
    return hardcodedZones.map(zone => (
      <div key={zone._id} className="mb-1">
        <div 
          className={cn(
            "flex items-center p-2 hover:bg-accent rounded-md cursor-pointer",
            "transition-colors duration-200",
            selectedItem?.type === 'zone' && selectedItem?.item._id === zone._id 
              ? "bg-accent" 
              : ""
          )}
          onClick={() => {
            toggleExpand(zone._id, 'zone');
            handleItemSelect('zone', zone);
          }}
        >
          <Button variant="ghost" size="icon" className="h-4 w-4 mr-1">
            {expanded[zone._id] ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
          </Button>
          <Folder className="h-4 w-4 mr-2 text-blue-500" />
          <span className="text-sm font-medium flex-grow">
            {zone.zoneNumber}. {zone.zoneName}
          </span>
          
          <div className="ml-auto" onClick={e => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Plus size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => {
                  const zoneData = {
                    type: 'document',
                    data: {
                      zoneNumber: zone.zoneNumber,
                      zoneName: zone.zoneName,
                    }
                  };
                  onCreate('document', zoneData);
                }}>
                  Add Document
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {expanded[zone._id] && (
          <div className="ml-6">
            {renderSections(zone._id, zone)}
          </div>
        )}
      </div>
    ));
  };
  
  const renderSections = (zoneId, parentZone) => {
    // Get sections from artifactSubartifacts based on zone number
    const sections = Object.entries(artifactSubartifacts)
      .filter(([key]) => key.startsWith(zoneId.padStart(2, '0')))
      .map(([key, value]) => ({
        _id: key,
        sectionNumber: key,
        sectionName: value.name,
        subartifacts: value.subartifacts
      }));
    
    if (!sections.length) {
      return (
        <div className="p-2 text-sm text-muted-foreground">
          No sections found.
        </div>
      );
    }
    
    return sections.map(section => (
      <div key={section._id} className="mb-1">
        <div 
          className={cn(
            "flex items-center p-2 hover:bg-accent rounded-md cursor-pointer",
            "transition-colors duration-200",
            selectedItem?.type === 'section' && selectedItem?.item._id === section._id 
              ? "bg-accent" 
              : ""
          )}
          onClick={() => {
            toggleExpand(section._id, 'section');
            handleItemSelect('section', {
              ...section,
              zone: parentZone
            });
          }}
        >
          <Button variant="ghost" size="icon" className="h-4 w-4 mr-1">
            {expanded[section._id] ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
          </Button>
          <Folder className="h-4 w-4 mr-2 text-green-500" />
          <span className="text-sm font-medium flex-grow">
            {section.sectionNumber} {section.sectionName}
          </span>
          
          <div className="ml-auto" onClick={e => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Plus size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => {
                  const realSectionNumber = section.sectionNumber.split('.').slice(0, 2).join('.');
                  onCreate('document', {
                  type: 'document',
                  data: {
                    zoneNumber: parentZone.zoneNumber,
                    zoneName: parentZone.zoneName,
                    sectionNumber: realSectionNumber,
                    artifactNumber: section.sectionNumber,
                    artifactName: section.sectionName,
                  }
                })}}>
                  Add Document
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {expanded[section._id] && (
          <div className="ml-6">
            {renderSubArtifacts(section, parentZone)}
          </div>
        )}
      </div>
    ));
  };
  
  const renderSubArtifacts = (section, parentZone) => {
    const subArtifacts = section.subartifacts || [];
    
    if (!subArtifacts.length) {
      return (
        <div className="p-2 text-sm text-muted-foreground">
          No sub-artifacts found.
        </div>
      );
    }
    
    return subArtifacts.map((subArtifact, index) => {
      // Create a unique key using the full section path and index
      const uniqueKey = `${section._id}-subart-${index}`;
      const realSectionNumber = section.sectionNumber.split('.').slice(0, 2).join('.');
      
      // Extract section number and name
      const sectionNumber = section._id;
      const sectionName = section.sectionName;
      
      // Extract artifact number and name (same as section in this case)
      const artifactNumber = section._id;
      const artifactName = section.sectionName;
      
      return (
        <div key={uniqueKey} className="mb-1">
          <div 
            className={cn(
              "flex items-center p-2 hover:bg-accent rounded-md cursor-pointer",
              "transition-colors duration-200",
              selectedItem?.type === 'subArtifact' && selectedItem?.item._id === uniqueKey
                ? "bg-accent" 
                : ""
            )}
          >
            <Button variant="ghost" size="icon" className="h-4 w-4 mr-1">
              <ChevronRight size={14} />
            </Button>
            <span className="text-sm flex-grow">
              {subArtifact}
            </span>
            
            <div className="ml-auto" onClick={e => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Plus size={14} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => {
                    const hierarchyData = {
                      type: 'document',
                      data: {
                        // Zone information
                        zoneNumber: parentZone.zoneNumber,
                        zoneName: parentZone.zoneName,
                        
                        // Section information
                        sectionNumber: realSectionNumber,
                        
                        // Artifact information
                        artifactNumber: section.sectionNumber,
                        artifactName: section.sectionName,
                        
                        // Subartifact information
                        subArtifactName: subArtifact,
                      }
                    };
                    
                    console.log('Creating document with hierarchy data:', hierarchyData);
                    onCreate('document', hierarchyData);
                  }}>
                    Add Document
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="w-80 h-full border-r bg-background">
      <div className="h-full flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">TMF Structure</h2>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2">
            {renderZones()}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default SidebarNav;