"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users2, Calendar, Plus, ChevronLeft, Award, Clock, Kanban, BarChart3,
  FileText, ShieldCheck, ArrowRight, Settings, CheckCircle2, AlertCircle, Play
} from "lucide-react";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { projectService } from "@/services/projectService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailsPage({ params }: PageProps) {
  const router = useRouter();
  
  // Unwrap Next 15 params promise
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  // Zustand Store
  const { projects, tasks, updateProject, addProjectActivity } = useWorkspaceStore();
  
  const project = projects.find((p) => p.id === projectId);
  const projectTasks = tasks.filter((t) => t.projectId === projectId);

  const [activeTab, setActiveTab] = useState("overview");

  if (!project) {
    return (
      <div className="py-12 text-center text-xs text-muted-foreground space-y-4">
        <AlertCircle className="h-10 w-10 mx-auto text-rose-500 animate-bounce" />
        <p className="font-semibold text-foreground">Project Not Found</p>
        <p>The workspace identifier "{projectId}" does not exist in this environment.</p>
        <Link href="/projects">
          <Button size="sm" variant="outline">Back to Projects</Button>
        </Link>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: any) => {
    try {
      await projectService.updateProject(project.id, { status: newStatus });
      addProjectActivity(project.id, {
        type: "status",
        user: "Alex Rivera",
        content: `Updated project status to '${newStatus}'`
      });
      toast({ title: "Status Updated", description: `Project is now in '${newStatus}' mode.`, type: "success" });
    } catch {
      toast({ title: "Failed to Update", type: "destructive" });
    }
  };

  const handlePriorityChange = async (newPriority: any) => {
    try {
      await projectService.updateProject(project.id, { priority: newPriority });
      addProjectActivity(project.id, {
        type: "status",
        user: "Alex Rivera",
        content: `Modified priority level to '${newPriority}'`
      });
      toast({ title: "Priority Updated", description: `Priority matches '${newPriority}' now.`, type: "success" });
    } catch {
      toast({ title: "Failed to Update", type: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER CONTROLS */}
      <div className="flex flex-col gap-4 border-b pb-5">
        <Link href="/projects" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-semibold self-start transition-colors">
          <ChevronLeft className="h-3.5 w-3.5" /> Back to Project List
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
              <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider bg-primary/5 text-primary border-primary/20">
                {project.id}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">{project.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Status Change Selector */}
            <select
              value={project.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="h-9 border border-input rounded-xl bg-background text-xs px-2.5 focus:outline-none focus:ring-2 focus:ring-ring font-semibold text-muted-foreground"
            >
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="In Review">In Review</option>
              <option value="Completed">Completed</option>
            </select>

            {/* Priority Selector */}
            <select
              value={project.priority}
              onChange={(e) => handlePriorityChange(e.target.value)}
              className="h-9 border border-input rounded-xl bg-background text-xs px-2.5 focus:outline-none focus:ring-2 focus:ring-ring font-semibold text-muted-foreground"
            >
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
            </select>

            <Link href="/tasks">
              <Button size="sm" variant="gradient" className="font-semibold gap-1 h-9">
                Launch Task Kanban <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* BODY SEGMENTED CONTENT */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/40 p-1 flex justify-start max-w-md border">
          <TabsTrigger value="overview" className="text-xs font-semibold">Overview</TabsTrigger>
          <TabsTrigger value="members" className="text-xs font-semibold">Members ({project.members.length})</TabsTrigger>
          <TabsTrigger value="tasks" className="text-xs font-semibold">Sprint Tasks ({projectTasks.length})</TabsTrigger>
          <TabsTrigger value="logs" className="text-xs font-semibold">Activity Timeline</TabsTrigger>
        </TabsList>

        {/* 1. OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Project progress widget */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Execution Velocity</CardTitle>
                <CardDescription className="text-xs">Based on completed tasks in this sprint circle</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-6">
                  <div className="relative h-20 w-20 shrink-0 flex items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                    <span className="text-lg font-bold text-primary">{project.progress}%</span>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 border rounded-lg bg-background">
                        <span className="text-[10px] text-muted-foreground block">Total Tasks</span>
                        <span className="font-bold text-sm">{projectTasks.length}</span>
                      </div>
                      <div className="p-2 border rounded-lg bg-background">
                        <span className="text-[10px] text-emerald-500 block">Completed</span>
                        <span className="font-bold text-sm text-emerald-500">
                          {projectTasks.filter((t) => t.status === "done").length}
                        </span>
                      </div>
                      <div className="p-2 border rounded-lg bg-background">
                        <span className="text-[10px] text-blue-500 block">Active</span>
                        <span className="font-bold text-sm text-blue-500">
                          {projectTasks.filter((t) => t.status !== "done").length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t text-xs space-y-2">
                  <div className="flex justify-between font-medium">
                    <span className="text-muted-foreground">Deadline Date</span>
                    <span className="text-foreground flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> {project.deadline}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick specifications widget */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold">Workspace Health</CardTitle>
                <CardDescription className="text-xs">Audit values and alignments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-muted-foreground">SSO Guard</span>
                  <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold">
                    <ShieldCheck className="h-3 w-3 mr-0.5" /> Isolated
                  </Badge>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-muted-foreground">Git Repository</span>
                  <Badge variant="outline" className="text-[9px] bg-slate-500/10 font-bold">
                    Connected
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">AI Token Caps</span>
                  <span className="font-bold">50k / session</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 2. MEMBERS TAB */}
        <TabsContent value="members" className="animate-slide-up">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold">Assigned Team Members</CardTitle>
              <CardDescription className="text-xs">Collaborators assigned to project issues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.members.map((m, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 border rounded-xl bg-card">
                    <img src={m.avatar} className="h-10 w-10 rounded-full object-cover" alt="" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-foreground">{m.name}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{m.email}</p>
                    </div>
                    <Badge variant="outline" className="text-[9px] uppercase font-bold bg-muted/40">
                      {idx === 0 ? "Owner" : "Member"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. SPRINT TASKS TAB */}
        <TabsContent value="tasks" className="animate-slide-up">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold">Tasks Board List</CardTitle>
              <CardDescription className="text-xs">List of issue cards mapped to this project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="p-3 font-semibold text-muted-foreground">Task Name</th>
                      <th className="p-3 font-semibold text-muted-foreground">Assignee</th>
                      <th className="p-3 font-semibold text-muted-foreground">Status</th>
                      <th className="p-3 font-semibold text-muted-foreground">Priority</th>
                      <th className="p-3 font-semibold text-muted-foreground text-right">Deadline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {projectTasks.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                          No tasks have been mapped to this project yet.
                        </td>
                      </tr>
                    ) : (
                      projectTasks.map((t) => {
                        let statusBadgeColor = "bg-slate-500/10 text-muted-foreground";
                        if (t.status === "inprogress") statusBadgeColor = "bg-blue-500/10 text-blue-500";
                        if (t.status === "review") statusBadgeColor = "bg-pink-500/10 text-pink-500";
                        if (t.status === "done") statusBadgeColor = "bg-emerald-500/10 text-emerald-500";

                        let priorityBadgeColor = "border-slate-500/20 text-muted-foreground bg-slate-500/5";
                        if (t.priority === "high") priorityBadgeColor = "border-rose-500/20 text-rose-500 bg-rose-500/5";
                        if (t.priority === "medium") priorityBadgeColor = "border-amber-500/20 text-amber-500 bg-amber-500/5";

                        return (
                          <tr key={t.id} className="hover:bg-muted/10 transition-colors">
                            <td className="p-3 font-semibold text-foreground">{t.name}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <img src={t.assignee.avatar} className="h-5 w-5 rounded-full object-cover" alt="" />
                                <span>{t.assignee.name}</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <Badge variant="outline" className={`text-[9px] font-bold uppercase tracking-wider ${statusBadgeColor}`}>
                                {t.status}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <Badge variant="outline" className={`text-[9px] font-bold uppercase tracking-wider ${priorityBadgeColor}`}>
                                {t.priority}
                              </Badge>
                            </td>
                            <td className="p-3 text-right text-muted-foreground">{t.deadline}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. ACTIVITY TIMELINE LOGS */}
        <TabsContent value="logs" className="animate-slide-up">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold">Activity Logs History</CardTitle>
              <CardDescription className="text-xs">Chronological record of project edits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative border-l pl-5 space-y-5 py-2 text-xs">
                {project.activities.map((act) => {
                  let indicatorBg = "bg-blue-500";
                  if (act.type === "create") indicatorBg = "bg-violet-500";
                  if (act.type === "comment") indicatorBg = "bg-amber-500";
                  if (act.type === "file") indicatorBg = "bg-pink-500";
                  if (act.type === "status") indicatorBg = "bg-emerald-500";

                  return (
                    <div key={act.id} className="relative">
                      {/* Circle Dot indicator */}
                      <span className={`absolute left-[-26px] top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full ring-4 ring-background ${indicatorBg}`} />
                      
                      <div>
                        <p className="font-semibold">
                          {act.user}{" "}
                          <span className="font-normal text-muted-foreground">{act.content}</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          {new Date(act.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })} at{" "}
                          {new Date(act.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
