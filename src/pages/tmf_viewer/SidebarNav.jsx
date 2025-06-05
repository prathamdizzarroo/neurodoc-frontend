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

  const toggleExpand = async (id, type) => {
    // Set loading state
    setLoadingStates(prev => ({ ...prev, [id]: true }));
    
    try {
      // Load child items if not already loaded
      if (type === 'zone' && !expanded[id]) {
        await loadSections(id);
      } else if (type === 'section' && !expanded[id]) {
        await loadArtifacts(id);
      } else if (type === 'artifact' && !expanded[id]) {
        await loadSubArtifacts(id);
      }
      
      setExpanded(prev => ({
        ...prev,
        [id]: !prev[id]
      }));
    } finally {
      // Clear loading state
      setLoadingStates(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleItemSelect = async (type, item) => {
    // Update selected item state
    setSelectedItem({ type, item });

    // Call parent onSelect method
    onSelect({ type, item });

    // Only load documents for the selected item
    // await loadDocuments(item._id);
  };

  const renderZones = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      );
    }
    
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
            handleItemSelect('zone', zone._id);
          }}
        >
          <Button variant="ghost" size="icon" className="h-4 w-4 mr-1">
            {loadingStates[zone._id] ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : expanded[zone._id] ? (
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
                    type: 'zone',
                    zoneNumber: zone.zoneNumber,
                    zoneName: zone.zoneName
                  };
                  console.log('Zone data being passed:', zoneData);
                  onCreate('document', zoneData);
                }}>
                  Add Document
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {expanded[zone._id] && data.sections[zone._id] && (
          <div className="ml-6">
            {renderSections(zone._id, zone)}
          </div>
        )}
      </div>
    ));
  };
  
  const renderSections = (zoneId, parentZone) => {
    const sections = data.sections[zoneId] || [];
    
    if (!sections.length) {
      return (
        <div className="p-2 text-sm text-muted-foreground">
          No sections found.
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-2"
            onClick={(e) => {
              e.stopPropagation();
              onCreate('section', zoneId);
            }}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
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
            {loadingStates[section._id] ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : expanded[section._id] ? (
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
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onCreate('artifact', section._id)}>
                  Add Artifact
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {expanded[section._id] && data.artifacts[section._id] && (
          <div className="ml-6">
            {renderArtifacts(section._id, section)}
          </div>
        )}
      </div>
    ));
  };
  
  const renderArtifacts = (sectionId, parentSection) => {
    const artifacts = data.artifacts[sectionId] || [];
    
    if (!artifacts.length) {
      return (
        <div className="p-2 text-sm text-muted-foreground">
          No artifacts found.
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-2"
            onClick={(e) => {
              e.stopPropagation();
              onCreate('artifact', sectionId);
            }}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
      );
    }
    
    return artifacts.map(artifact => (
      <div key={artifact._id} className="mb-1">
        <div 
          className={cn(
            "flex items-center p-2 hover:bg-accent rounded-md cursor-pointer",
            "transition-colors duration-200",
            selectedItem?.type === 'artifact' && selectedItem?.item._id === artifact._id 
              ? "bg-accent" 
              : ""
          )}
          onClick={() => {
            toggleExpand(artifact._id, 'artifact');
            handleItemSelect('artifact', {
              ...artifact,
              section: parentSection
            });
          }}
        >
          <Button variant="ghost" size="icon" className="h-4 w-4 mr-1">
            {loadingStates[artifact._id] ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : expanded[artifact._id] ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
          </Button>
          <Folder className="h-4 w-4 mr-2 text-yellow-500" />
          <span className="text-sm font-medium flex-grow">
            {artifact.artifactNumber} {artifact.artifactName}
          </span>
          
          <div className="ml-auto" onClick={e => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onCreate('subArtifact', artifact._id)}>
                  Add Sub-Artifact
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {expanded[artifact._id] && data.subArtifacts[artifact._id] && (
          <div className="ml-6">
            {renderSubArtifacts(artifact._id, artifact)}
          </div>
        )}
      </div>
    ));
  };
  
  const renderSubArtifacts = (artifactId, parentArtifact) => {
    const subArtifacts = data.subArtifacts[artifactId] || [];
    
    if (!subArtifacts.length) {
      return (
        <div className="p-2 text-sm text-muted-foreground">
          No sub-artifacts found.
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-2"
            onClick={(e) => {
              e.stopPropagation();
              onCreate('subArtifact', artifactId);
            }}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
      );
    }
    
    return subArtifacts.map(subArtifact => (
      <div key={subArtifact._id} className="mb-1">
        <div 
          className={cn(
            "flex items-center p-2 hover:bg-accent rounded-md cursor-pointer",
            "transition-colors duration-200",
            selectedItem?.type === 'subArtifact' && selectedItem?.item._id === subArtifact._id 
              ? "bg-accent" 
              : ""
          )}
          onClick={() => {
            handleItemSelect('subArtifact', {
              ...subArtifact,
              artifact: parentArtifact
            });
          }}
        >
          <File className="h-4 w-4 ml-5 mr-2 text-purple-500" />
          <span className="text-sm flex-grow">
            {subArtifact.subArtifactNumber} {subArtifact.subArtifactName}
          </span>
          
          <div className="ml-auto" onClick={e => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  {/* <Plus size={14} /> */}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onCreate('document', {
                  id: subArtifact._id,
                  type: 'subArtifact',
                  data: {
                    subArtifactNumber: subArtifact.subArtifactNumber,
                    subArtifactName: subArtifact.subArtifactName
                  }
                })}>
                  Add Document
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    ));
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