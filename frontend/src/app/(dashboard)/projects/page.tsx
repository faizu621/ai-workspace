"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Users2, Calendar, Plus, Search, Loader2, MoreVertical, LayoutGrid,
  Filter, Award, ArrowUpRight, FolderPlus, Trash2
} from "lucide-react";
import { useWorkspaceStore, Project } from "@/store/workspaceStore";
import { projectService } from "@/services/projectService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";

const projectSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  deadline: z.string().nonempty("Deadline is required"),
  priority: z.enum(["Low", "Medium", "High"]),
  status: z.enum(["Planning", "In Progress", "In Review", "Completed"]),
});

type ProjectFields = z.infer<typeof projectSchema>;

const availableMembers = [
  { name: "Alex Rivera", email: "alex@workspace.ai", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80" },
  { name: "Sarah Chen", email: "sarah.c@workspace.ai", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80" },
  { name: "Marcus Johnson", email: "marcus.j@workspace.ai", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80" },
  { name: "Emily Watson", email: "emily.w@workspace.ai", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=256&h=256&q=80" }
];

export default function ProjectsPage() {
  const { projects, deleteProject } = useWorkspaceStore();
  
  // States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedMembers, setSelectedMembers] = useState<string[]>(["Alex Rivera"]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProjectFields>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      deadline: "",
      priority: "Medium",
      status: "Planning",
    },
  });

  const onSubmit = async (data: ProjectFields) => {
    setIsSubmitting(true);
    try {
      const selectedMemberObjects = availableMembers.filter((m) =>
        selectedMembers.includes(m.name)
      );

      await projectService.createProject({
        ...data,
        members: selectedMemberObjects,
      });

      toast({
        title: "Project Launched",
        description: `Successfully configured and deployed '${data.name}'`,
        type: "success",
      });
      setIsCreateOpen(false);
      reset();
      setSelectedMembers(["Alex Rivera"]);
    } catch {
      toast({
        title: "Launch Failed",
        description: "An error occurred while deploying the project.",
        type: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMemberToggle = (name: string) => {
    if (selectedMembers.includes(name)) {
      if (name === "Alex Rivera") return; // Keep author
      setSelectedMembers(selectedMembers.filter((x) => x !== name));
    } else {
      setSelectedMembers([...selectedMembers, name]);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to terminate project '${name}'?`)) {
      await projectService.deleteProject(id);
      toast({ title: "Project Terminated", description: `'${name}' has been deleted.`, type: "destructive" });
    }
  };

  // Filtering Logic
  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.description.toLowerCase().includes(searchFilter.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Platform Projects</h1>
          <p className="text-sm text-muted-foreground">Manage workspaces, allocations, and sprint cycles</p>
        </div>
        
        {/* Create Dialog Trigger */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="font-semibold gap-1.5 shadow-md shadow-primary/20">
              <FolderPlus className="h-4.5 w-4.5" /> Initialize Project
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-lg border-border/80 glassmorphism">
            <DialogHeader>
              <DialogTitle>Launch Workspace Project</DialogTitle>
              <DialogDescription>Setup team alignment, targets, and execution status parameters.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Project Name</label>
                <Input
                  {...register("name")}
                  placeholder="e.g. Next-Gen Authentication Framework"
                  className={errors.name ? "border-rose-500" : ""}
                />
                {errors.name && <span className="text-xs text-rose-500">{errors.name.message}</span>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</label>
                <textarea
                  {...register("description")}
                  rows={3}
                  placeholder="Summarize project targets, deliverables, and team responsibilities..."
                  className={`w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    errors.description ? "border-rose-500" : ""
                  }`}
                />
                {errors.description && <span className="text-xs text-rose-500">{errors.description.message}</span>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Deadline</label>
                  <Input
                    {...register("deadline")}
                    type="date"
                    className={errors.deadline ? "border-rose-500" : ""}
                  />
                  {errors.deadline && <span className="text-xs text-rose-500">{errors.deadline.message}</span>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Priority</label>
                  <select
                    onChange={(e) => setValue("priority", e.target.value as any)}
                    className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assign Members</label>
                <div className="grid grid-cols-2 gap-2 max-h-[110px] overflow-y-auto p-1.5 border rounded-lg bg-background/50">
                  {availableMembers.map((m) => {
                    const isSelected = selectedMembers.includes(m.name);
                    return (
                      <button
                        key={m.name}
                        type="button"
                        onClick={() => handleMemberToggle(m.name)}
                        className={`flex items-center gap-2 p-1.5 rounded-lg border text-xs font-medium text-left transition-colors ${
                          isSelected ? "bg-primary/10 border-primary/30 text-primary" : "hover:bg-muted"
                        }`}
                      >
                        <img src={m.avatar} className="h-6 w-6 rounded-full object-cover" alt="" />
                        <span className="truncate">{m.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit" variant="gradient" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Launching...</> : "Launch Project"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 bg-card/45 backdrop-blur-md rounded-2xl border">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search projects..."
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 border border-input rounded-xl bg-background text-xs px-3 focus:outline-none focus:ring-2 focus:ring-ring w-32"
          >
            <option value="all">All Statuses</option>
            <option value="Planning">Planning</option>
            <option value="In Progress">In Progress</option>
            <option value="In Review">In Review</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* PROJECTS GRID LIST */}
      {filteredProjects.length === 0 ? (
        <Card className="p-12 text-center text-xs text-muted-foreground">
          <Users2 className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2 animate-pulse" />
          <p className="font-semibold text-foreground">No Projects Found</p>
          <p className="mt-1">Try tweaking filters or initialize a new project to start.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((p) => {
            let statusColor = "bg-blue-500/10 text-blue-500 border-blue-500/20";
            if (p.status === "Planning") statusColor = "bg-amber-500/10 text-amber-500 border-amber-500/20";
            if (p.status === "In Review") statusColor = "bg-pink-500/10 text-pink-500 border-pink-500/20";
            if (p.status === "Completed") statusColor = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";

            let priorityColor = "border-slate-500/20 text-muted-foreground bg-slate-500/5";
            if (p.priority === "High") priorityColor = "border-rose-500/20 text-rose-500 bg-rose-500/5";
            if (p.priority === "Medium") priorityColor = "border-amber-500/20 text-amber-500 bg-amber-500/5";

            return (
              <Card key={p.id} className="flex flex-col justify-between hover:shadow-lg transition-all duration-300 group border-border/80 relative overflow-hidden">
                {/* Visual Top Glow bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600/30 to-indigo-600/30 opacity-0 group-hover:opacity-100 transition-opacity" />

                <CardHeader className="p-5 pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider ${statusColor}`}>
                      {p.status}
                    </Badge>
                    <div className="flex gap-1">
                      <Badge variant="outline" className={`text-[9px] uppercase font-bold tracking-wider ${priorityColor}`}>
                        {p.priority}
                      </Badge>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="text-muted-foreground hover:text-rose-500 p-0.5 rounded transition-colors"
                        title="Terminate Project"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  
                  <CardTitle className="text-base font-bold mt-3 text-foreground group-hover:text-primary transition-colors truncate">
                    {p.name}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1 text-muted-foreground line-clamp-2 leading-relaxed">
                    {p.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="px-5 py-2 space-y-4">
                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-semibold">
                      <span className="text-muted-foreground">Execution Progress</span>
                      <span className="text-foreground">{p.progress}%</span>
                    </div>
                    <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${p.progress}%` }} />
                    </div>
                  </div>

                  {/* Members & Dates grid */}
                  <div className="flex justify-between items-center pt-2">
                    {/* Overlapping member circles */}
                    <div className="flex -space-x-2 overflow-hidden">
                      {p.members.map((m, idx) => (
                        <img
                          key={idx}
                          src={m.avatar}
                          alt={m.name}
                          title={m.name}
                          className="inline-block h-6.5 w-6.5 rounded-full ring-2 ring-background object-cover"
                        />
                      ))}
                    </div>

                    <div className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                      <Calendar className="h-3 w-3" /> Due {p.deadline}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="px-5 py-4 border-t bg-card/25 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {p.activities.length} Events Logged
                  </span>
                  <Link href={`/projects/${p.id}`} className="text-xs text-primary hover:underline font-semibold flex items-center gap-1">
                    View Details <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
