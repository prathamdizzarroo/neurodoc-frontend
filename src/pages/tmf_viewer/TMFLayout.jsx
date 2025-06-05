import React, { useState, useEffect } from 'react';
import SidebarNav from './SidebarNav';
import tmfService from '../../services/tmf.serivce';
import { useToast } from "@/hooks/use-toast";
import ZoneDialog from '../../components/dialogs/ZoneDialog ';
import SectionDialog from '../../components/dialogs/SectionDialog ';
import ArtifactDialog from '../../components/dialogs/ArtifactDialog ';
import SubArtifactDialog from '../../components/dialogs/SubArtifactDialog';
import DocumentDialog from '../../components/dialogs/DocumentDialog';
import documentService from '../../services/document.service';

const TMFLayout = ({ children }) => {
    const { toast } = useToast();
    const [data, setData] = useState({
        zones: [],
        sections: {},
        artifacts: {},
        subArtifacts: {},
        documents: {}
    });
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [dialogOpen, setDialogOpen] = useState({
        zone: false,
        section: false,
        artifact: false,
        subArtifact: false,
        document: false
    });
    const [parentId, setParentId] = useState(null);

    // Load initial data
    useEffect(() => {
        const fetchZones = async () => {
            try {
                setLoading(true);
                const zones = await tmfService.zones.getAll();
                setData(prev => ({ ...prev, zones }));
                setLoading(false);
            } catch (error) {
                console.error("Error fetching zones:", error);
                setLoading(false);
            }
        };
        
        fetchZones();
    }, []);

    // Load sections when zone is expanded
    const loadSections = async (zoneId) => {
        if (data.sections[zoneId]) return; // Already loaded
        
        try {
            const sections = await tmfService.sections.getAllByZone(zoneId);
            setData(prev => ({
                ...prev,
                sections: { ...prev.sections, [zoneId]: sections }
            }));
        } catch (error) {
            console.error("Error fetching sections:", error);
        }
    };

    // Load artifacts when section is expanded
    const loadArtifacts = async (sectionId) => {
        if (data.artifacts[sectionId]) return; // Already loaded
        
        try {
            const artifacts = await tmfService.artifacts.getAllBySection(sectionId);
            setData(prev => ({
                ...prev,
                artifacts: { ...prev.artifacts, [sectionId]: artifacts }
            }));
        } catch (error) {
            console.error("Error fetching artifacts:", error);
        }
    };

    // Load sub-artifacts when artifact is expanded
    const loadSubArtifacts = async (artifactId) => {
        if (data.subArtifacts[artifactId]) return; // Already loaded
        
        try {
            const subArtifacts = await tmfService.subArtifacts.getAllByArtifact(artifactId);
            setData(prev => ({
                ...prev,
                subArtifacts: { ...prev.subArtifacts, [artifactId]: subArtifacts }
            }));
        } catch (error) {
            console.error("Error fetching sub-artifacts:", error);
        }
    };

    // Handle item selection
    const handleSelect = (item) => {
        setSelectedItem(item);
    };

    // Open dialog to create new items
    const handleCreate = (type, data = null) => {
        if (type === 'document') {
            console.log('Setting selected item for document:', data);
            setSelectedItem(data);
        } else {
            setParentId(data);
        }
        setDialogOpen(prev => ({ ...prev, [type]: true }));
    };

    // Handle dialog submission for Zone
    const handleZoneSubmit = async (zoneData) => {
        try {
            const newZone = await tmfService.zones.create(zoneData);
            setData(prev => ({
                ...prev,
                zones: [...prev.zones, newZone]
            }));
            setDialogOpen(prev => ({ ...prev, zone: false }));
            toast({ title: "Success", description: "Zone created successfully", variant: "default" });
        } catch (error) {
            console.error("Error creating zone:", error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to create zone",
                variant: "destructive"
            });
        }
    };

    // Handle dialog submission for Section
    const handleSectionSubmit = async (sectionData) => {
        try {
            const newSection = await tmfService.sections.create(parentId, sectionData);
            setData(prev => ({
                ...prev,
                sections: { 
                    ...prev.sections, 
                    [parentId]: prev.sections[parentId] ? 
                        [...prev.sections[parentId], newSection] : 
                        [newSection] 
                }
            }));
            setDialogOpen(prev => ({ ...prev, section: false }));
            toast({ title: "Success", description: "Section created successfully", variant: "default" });
        } catch (error) {
            console.error("Error creating section:", error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to create section",
                variant: "destructive"
            });
        }
    };

    // Handle dialog submission for Artifact
    const handleArtifactSubmit = async (artifactData) => {
        try {
            const newArtifact = await tmfService.artifacts.create(parentId, artifactData);
            setData(prev => ({
                ...prev,
                artifacts: { 
                    ...prev.artifacts, 
                    [parentId]: prev.artifacts[parentId] ? 
                        [...prev.artifacts[parentId], newArtifact] : 
                        [newArtifact] 
                }
            }));
            setDialogOpen(prev => ({ ...prev, artifact: false }));
            toast({ title: "Success", description: "Artifact created successfully", variant: "default" });
        } catch (error) {
            console.error("Error creating artifact:", error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to create artifact",
                variant: "destructive"
            });
        }
    };

    // Handle dialog submission for SubArtifact
    const handleSubArtifactSubmit = async (subArtifactData) => {
        try {
            const newSubArtifact = await tmfService.subArtifacts.create(parentId, subArtifactData);
            setData(prev => ({
                ...prev,
                subArtifacts: { 
                    ...prev.subArtifacts, 
                    [parentId]: prev.subArtifacts[parentId] ? 
                        [...prev.subArtifacts[parentId], newSubArtifact] : 
                        [newSubArtifact] 
                }
            }));
            setDialogOpen(prev => ({ ...prev, subArtifact: false }));
            toast({ title: "Success", description: "Sub-Artifact created successfully", variant: "default" });
        } catch (error) {
            console.error("Error creating sub-artifact:", error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to create sub-artifact",
                variant: "destructive"
            });
        }
    };

    // Handle dialog submission for Document
    const handleDocumentSubmit = async (documentData) => {
        try {
            const formData = new FormData();

            // Handle file upload
            if (documentData.file) {
                formData.append('file', documentData.file);
                formData.append('fileName', documentData.file.name);
                formData.append('fileSize', documentData.file.size);
                formData.append('fileFormat', documentData.file.type);
            }

            // Add zone information
            formData.append('zoneNumber', documentData.zoneNumber || '');
            formData.append('zoneName', documentData.zoneName || '');
            formData.append('zoneDescription', documentData.zoneDescription || '');

            // Add section information
            formData.append('sectionNumber', documentData.sectionNumber || '');
            formData.append('sectionName', documentData.sectionName || '');
            formData.append('sectionDescription', documentData.sectionDescription || '');

            // Add artifact information
            formData.append('artifactNumber', documentData.artifactNumber || '');
            formData.append('artifactName', documentData.artifactName || '');
            formData.append('artifactDescription', documentData.artifactDescription || '');

            // Add subArtifact information
            formData.append('subArtifactNumber', documentData.subArtifactNumber || '');
            formData.append('subArtifactName', documentData.subArtifactName || '');
            formData.append('subArtifactDescription', documentData.subArtifactDescription || '');

            // Add other required fields
            formData.append('documentTitle', documentData.documentTitle || '');
            formData.append('version', documentData.version || '1.0');
            formData.append('status', documentData.status || 'DRAFT');
            formData.append('documentDate', documentData.documentDate || new Date().toISOString());
            formData.append('documentType', documentData.documentType || 'OTHER');
            formData.append('tmfReference', documentData.tmfReference || '');
            formData.append('study', documentData.study || '');
            formData.append('country', documentData.country || '');
            formData.append('site', documentData.site || '');
            formData.append('author', documentData.author || '');
            formData.append('uploadedBy', documentData.uploadedBy || '');

            // Call document creation service
            const result = await documentService.create(formData);
            
            setDialogOpen(prev => ({ ...prev, document: false }));
            toast({ 
                title: "Success", 
                description: "Document created successfully", 
                variant: "default" 
            });
            
            // Refresh document list
            const updatedDocuments = await documentService.getAllDocuments();
            setData(prev => ({
                ...prev,
                documents: updatedDocuments
            }));
        } catch (error) {
            console.error("Error creating document:", error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to create document",
                variant: "destructive"
            });
        }
    };

    // Handle dialog close
    const handleDialogClose = (type) => {
        setDialogOpen(prev => ({ ...prev, [type]: false }));
    };

    return (
        <div className="h-screen w-full overflow-hidden bg-background">
            <div className="flex h-full">
                <div className="h-full overflow-hidden">
                    <SidebarNav 
                        data={data}
                        loading={loading}
                        onSelect={handleSelect}
                        onCreate={handleCreate}
                        loadSections={loadSections}
                        loadArtifacts={loadArtifacts}
                        loadSubArtifacts={loadSubArtifacts}
                    />
                </div>
                
                <div className="flex-1 h-full overflow-hidden">
                    {children}
                </div>
            </div>

            {/* Dialogs */}
            <ZoneDialog 
                open={dialogOpen.zone} 
                onClose={() => handleDialogClose('zone')}
                onSubmit={handleZoneSubmit}
            />
            
            <SectionDialog 
                open={dialogOpen.section}
                parentId={parentId}
                onClose={() => handleDialogClose('section')}
                onSubmit={handleSectionSubmit}
            />
            
            <ArtifactDialog 
                open={dialogOpen.artifact}
                parentId={parentId}
                onClose={() => handleDialogClose('artifact')}
                onSubmit={handleArtifactSubmit}
            />
            
            <SubArtifactDialog 
                open={dialogOpen.subArtifact}
                parentId={parentId}
                onClose={() => handleDialogClose('subArtifact')}
                onSubmit={handleSubArtifactSubmit}
            />

            <DocumentDialog 
                open={dialogOpen.document}
                parentId={parentId}
                initialSelectedItem={selectedItem}
                onClose={() => handleDialogClose('document')}
                onSubmit={handleDocumentSubmit}
            />
        </div>
    );
};

export default TMFLayout; 