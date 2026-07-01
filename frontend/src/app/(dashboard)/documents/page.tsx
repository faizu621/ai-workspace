"use client";

import React, { useState, useEffect } from "react";
import {
  FileText, Search, UploadCloud, Folder, Paperclip, MoreVertical,
  Calendar, User, Download, Trash2, ArrowUpRight, History, ShieldCheck, Filter
} from "lucide-react";
import { fileService, WorkspaceFile } from "@/services/fileService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";

const categories: Array<{ id: string; name: string }> = [
  { id: "all", name: "All Folders" },
  { id: "documents", name: "Documents" },
  { id: "images", name: "Images" },
  { id: "backups", name: "Backups" },
  { id: "code", name: "Code Assets" }
];

export default function DocumentsPage() {
  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // Selection states
  const [selectedFile, setSelectedFile] = useState<WorkspaceFile | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Mock Upload states
  const [uploadName, setUploadName] = useState("");
  const [uploadCategory, setUploadCategory] = useState<WorkspaceFile["category"]>("documents");
  const [isUploading, setIsUploading] = useState(false);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const data = await fileService.getFiles(activeCategory);
      setFiles(data);
    } catch {
      toast({ title: "Failed to fetch documents", type: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when category filter shifts
  useEffect(() => {
    fetchFiles();
  }, [activeCategory]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadName.trim()) return;

    setIsUploading(true);
    try {
      // Simulate file upload params
      const mockSizes = ["2.1 MB", "420 KB", "12.8 MB", "18 KB"];
      const randomSize = mockSizes[Math.floor(Math.random() * mockSizes.length)];
      const mockTypes: Record<string, string> = {
        documents: "application/pdf",
        images: "image/png",
        backups: "application/gzip",
        code: "text/javascript"
      };

      await fileService.uploadFile(uploadName, randomSize, mockTypes[uploadCategory], uploadCategory);
      toast({
        title: "Document Uploaded",
        description: `Successfully uploaded '${uploadName}' under ${uploadCategory.toUpperCase()}`,
        type: "success",
      });
      setUploadName("");
      fetchFiles();
    } catch {
      toast({ title: "Upload Failed", type: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete document '${name}'?`)) {
      const ok = await fileService.deleteFile(id);
      if (ok) {
        toast({ title: "Document deleted", type: "destructive" });
        fetchFiles();
      }
    }
  };

  // Filtered files
  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* HEADER TITLE */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Documents Hub</h1>
        <p className="text-sm text-muted-foreground">Manage workspace configurations, code asset drafts, and version histories</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* LEFT COLUMN: FILTERS & UPLOAD PANEL */}
        <div className="space-y-6 lg:col-span-1">
          {/* Categories select list */}
          <Card className="border-border/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
                <Folder className="h-4 w-4 text-primary" /> Workspace Folders
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold hover:bg-muted text-left transition-colors ${
                    activeCategory === cat.id ? "bg-primary/10 text-primary border-l-2 border-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>{cat.name}</span>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Upload Document Card */}
          <Card className="border-border/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
                <UploadCloud className="h-4 w-4 text-violet-500" /> Upload File
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Filename</label>
                  <Input
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                    placeholder="e.g. environment_deploy.yml"
                    className="text-xs"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Category Folder</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as any)}
                    className="w-full h-10 rounded-lg border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring font-semibold text-muted-foreground"
                  >
                    <option value="documents">Documents</option>
                    <option value="images">Images</option>
                    <option value="backups">Backups</option>
                    <option value="code">Code Assets</option>
                  </select>
                </div>

                <Button type="submit" variant="gradient" className="w-full h-9 font-semibold" disabled={isUploading}>
                  {isUploading ? "Uploading..." : "Upload File"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: FILES LIST & PREVIEW */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Search tool */}
          <div className="flex gap-2 items-center justify-between p-3.5 bg-card/45 backdrop-blur-md border rounded-2xl">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files inside this folder..."
                className="pl-9 text-xs"
              />
            </div>
            
            <Badge variant="outline" className="text-[10px] bg-muted/40 text-muted-foreground py-1 px-3">
              {filteredFiles.length} files found
            </Badge>
          </div>

          {/* Files Grid cards */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((x) => (
                <Card key={x} className="h-44 bg-muted/10 animate-pulse border-border/40" />
              ))}
            </div>
          ) : filteredFiles.length === 0 ? (
            <Card className="p-12 text-center text-xs text-muted-foreground">
              <Folder className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2 animate-pulse" />
              <p className="font-semibold text-foreground">No Files Found</p>
              <p className="mt-1">This directory folder is empty. Upload items on the left panel.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredFiles.map((file) => (
                <Card
                  key={file.id}
                  onClick={() => {
                    setSelectedFile(file);
                    setIsPreviewOpen(true);
                  }}
                  className="hover:shadow-lg transition-all duration-300 group border-border/80 cursor-pointer flex flex-col justify-between"
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <Badge variant="outline" className="text-[9px] uppercase font-bold px-2 py-0.5 bg-muted/30">
                        {file.category}
                      </Badge>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(file.id, file.name);
                        }}
                        className="text-muted-foreground hover:text-rose-500 p-0.5 rounded transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <CardTitle className="text-xs font-bold mt-3 text-foreground truncate group-hover:text-primary transition-colors">
                      {file.name}
                    </CardTitle>
                    <CardDescription className="text-[10px] text-muted-foreground mt-0.5">
                      {file.size} • {file.type.split("/")[1]}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="px-4 py-2 text-[10px] text-muted-foreground space-y-1">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" /> Uploaded by: {file.uploadedBy}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" /> Date: {new Date(file.uploadedAt).toLocaleDateString()}
                    </div>
                  </CardContent>

                  <CardFooter className="p-3 bg-card/25 border-t flex justify-between items-center text-[10px] font-semibold text-primary hover:underline">
                    <span className="flex items-center gap-1">
                      <History className="h-3.5 w-3.5" /> v{file.versions.length} Logs
                    </span>
                    <span className="flex items-center gap-1">
                      Inspect Details <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

        </div>

      </div>

      {/* DOCUMENT PREVIEW & VERSION HISTORY MODAL */}
      {selectedFile && (
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-md border-border/80 shadow-2xl glassmorphism p-6 space-y-5">
            <DialogHeader className="border-b pb-3">
              <div className="flex justify-between items-start gap-3 text-left">
                <div>
                  <DialogTitle className="text-base font-bold">{selectedFile.name}</DialogTitle>
                  <DialogDescription className="text-xs mt-0.5">
                    {selectedFile.type} • {selectedFile.size}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* Document Attributes */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 p-3 border rounded-xl bg-card">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block">Uploaded By</span>
                  <span className="font-semibold text-foreground">{selectedFile.uploadedBy}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block">Folder</span>
                  <Badge variant="outline" className="text-[9px] uppercase px-2 font-bold mt-1 bg-muted/40">
                    {selectedFile.category}
                  </Badge>
                </div>
              </div>

              {/* Version History List */}
              <div className="space-y-2">
                <h4 className="font-bold text-foreground flex items-center gap-1">
                  <History className="h-4 w-4 text-primary" /> Version Log Registry
                </h4>
                
                <div className="border rounded-lg bg-background/50 divide-y overflow-hidden max-h-[160px] overflow-y-auto">
                  {selectedFile.versions.map((ver, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2.5 text-[11px] gap-2">
                      <div className="space-y-0.5">
                        <span className="font-bold text-foreground block">Version {ver.version}</span>
                        <span className="text-[10px] text-muted-foreground block">
                          Uploaded by {ver.uploadedBy} on {new Date(ver.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-[9px] bg-slate-500/10 shrink-0 font-medium">
                        {ver.size}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-2">
                <Button
                  onClick={() => {
                    toast({ title: "Download Initialized", description: `Downloading file '${selectedFile.name}'...`, type: "success" });
                    setIsPreviewOpen(false);
                  }}
                  className="flex-1 font-semibold gap-1.5 h-10"
                >
                  <Download className="h-4 w-4" /> Download Latest
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsPreviewOpen(false)}
                  className="h-10 font-semibold"
                >
                  Cancel
                </Button>
              </div>
            </div>

          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
