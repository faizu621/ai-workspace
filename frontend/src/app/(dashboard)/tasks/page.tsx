"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Kanban, Plus, Search, Loader2, Calendar, User, Tag, Paperclip,
  MessageSquare, Trash2, ArrowRight, ArrowLeft, MoreHorizontal, Filter, X
} from "lucide-react";
import { useWorkspaceStore, Task, Member } from "@/store/workspaceStore";
import { taskService } from "@/services/taskService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";

// Zod schema for task creation
const createTaskSchema = z.object({
  name: z.string().min(3, "Task title must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  projectId: z.string().nonempty("Project selection is required"),
  priority: z.enum(["low", "medium", "high"]),
  deadline: z.string().nonempty("Deadline date is required"),
  labelsString: z.string().optional(), // comma separated
});

type TaskFields = z.infer<typeof createTaskSchema>;

const availableMembers: Member[] = [
  { name: "Alex Rivera", email: "alex@workspace.ai", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80" },
  { name: "Sarah Chen", email: "sarah.c@workspace.ai", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80" },
  { name: "Marcus Johnson", email: "marcus.j@workspace.ai", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80" },
  { name: "Emily Watson", email: "emily.w@workspace.ai", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=256&h=256&q=80" }
];

export default function TasksPage() {
  const { tasks, projects, addTask, moveTask, deleteTask, addTaskComment, addTaskAttachment } = useWorkspaceStore();

  // Kanban Column Types
  const columns: Array<{ id: Task["status"]; title: string; color: string }> = [
    { id: "todo", title: "To Do", color: "bg-slate-500/10 text-slate-500 border-slate-500/25" },
    { id: "inprogress", title: "In Progress", color: "bg-blue-500/10 text-blue-500 border-blue-500/25" },
    { id: "review", title: "In Review", color: "bg-pink-500/10 text-pink-500 border-pink-500/25" },
    { id: "done", title: "Completed", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/25" },
  ];

  // Component States
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filters
  const [searchFilter, setSearchFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Detail Modal Comment/Attachment inputs
  const [newCommentText, setNewCommentText] = useState("");
  const [mockAttachmentName, setMockAttachmentName] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TaskFields>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      name: "",
      description: "",
      projectId: "",
      priority: "medium",
      deadline: "",
      labelsString: "",
    },
  });

  // Create Task Submission
  const onSubmit = async (data: TaskFields) => {
    setIsSubmitting(true);
    try {
      const labels = data.labelsString
        ? data.labelsString.split(",").map((s) => s.trim()).filter((s) => s.length > 0)
        : ["General"];

      // Select random assignee for mock purposes
      const randomAssignee = availableMembers[Math.floor(Math.random() * availableMembers.length)];

      await taskService.createTask({
        name: data.name,
        description: data.description,
        projectId: data.projectId,
        priority: data.priority,
        deadline: data.deadline,
        labels,
        status: "todo",
        assignee: randomAssignee,
      });

      toast({ title: "Task Created", description: `Task '${data.name}' added to board.`, type: "success" });
      setIsCreateOpen(false);
      reset();
    } catch {
      toast({ title: "Failed to Create Task", type: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // HTML5 Drag Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, targetColumn: Task["status"]) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      await taskService.moveTask(taskId, targetColumn);
      // Sync active task preview state if currently open
      if (activeTask && activeTask.id === taskId) {
        setActiveTask({ ...activeTask, status: targetColumn });
      }
    }
  };

  const handlePostComment = async () => {
    if (!newCommentText.trim() || !activeTask) return;
    try {
      const added = await taskService.addComment(activeTask.id, {
        user: "Alex Rivera",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80",
        content: newCommentText,
      });
      setActiveTask({
        ...activeTask,
        comments: [...activeTask.comments, added]
      });
      setNewCommentText("");
      toast({ title: "Comment Posted", type: "success" });
    } catch {
      toast({ title: "Failed to Post Comment", type: "destructive" });
    }
  };

  const handlePostAttachment = async () => {
    if (!mockAttachmentName.trim() || !activeTask) return;
    try {
      const added = await taskService.addAttachment(activeTask.id, {
        name: mockAttachmentName,
        size: "1.2 MB",
        type: "application/octet-stream",
        url: "#"
      });
      setActiveTask({
        ...activeTask,
        attachments: [...activeTask.attachments, added]
      });
      setMockAttachmentName("");
      toast({ title: "File Attached", type: "success" });
    } catch {
      toast({ title: "Failed to upload file", type: "destructive" });
    }
  };

  const handleRemoveTask = async (id: string, name: string) => {
    if (confirm(`Terminate task card '${name}'?`)) {
      await taskService.deleteTask(id);
      setIsDetailOpen(false);
      toast({ title: "Task Terminated", type: "destructive" });
    }
  };

  // Filter Logic
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.description.toLowerCase().includes(searchFilter.toLowerCase());
    
    const matchesProject = projectFilter === "all" || t.projectId === projectFilter;
    const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;

    return matchesSearch && matchesProject && matchesPriority;
  });

  return (
    <div className="space-y-6">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Task Boards</h1>
          <p className="text-sm text-muted-foreground">Kanban card planning & agile execution flows</p>
        </div>

        {/* Create Task wizard */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="font-semibold gap-1.5 shadow-md shadow-primary/20">
              <Plus className="h-4.5 w-4.5" /> Launch Task
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-lg border-border/80 glassmorphism">
            <DialogHeader>
              <DialogTitle>Launch Workspace Task</DialogTitle>
              <DialogDescription>Input sprint details to allocate task card.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Task Title</label>
                <Input
                  {...register("name")}
                  placeholder="e.g. Write JWT authentication middleware"
                  className={errors.name ? "border-rose-500" : ""}
                />
                {errors.name && <span className="text-xs text-rose-500">{errors.name.message}</span>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Task Description</label>
                <textarea
                  {...register("description")}
                  rows={2}
                  placeholder="Detail constraints, inputs, and expected outcomes..."
                  className={`w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    errors.description ? "border-rose-500" : ""
                  }`}
                />
                {errors.description && <span className="text-xs text-rose-500">{errors.description.message}</span>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Project Mapping</label>
                  <select
                    onChange={(e) => setValue("projectId", e.target.value)}
                    className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-muted-foreground font-semibold"
                  >
                    <option value="">Select Target...</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  {errors.projectId && <span className="text-xs text-rose-500">{errors.projectId.message}</span>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Priority</label>
                  <select
                    onChange={(e) => setValue("priority", e.target.value as any)}
                    className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-muted-foreground font-semibold"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Deadline Date</label>
                  <Input
                    {...register("deadline")}
                    type="date"
                    className={errors.deadline ? "border-rose-500" : ""}
                  />
                  {errors.deadline && <span className="text-xs text-rose-500">{errors.deadline.message}</span>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Labels (Tags)</label>
                  <Input
                    {...register("labelsString")}
                    placeholder="UX, Frontend, API (comma separated)"
                  />
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit" variant="gradient" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deploying...</> : "Launch Task"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* FILTER CONTROLS */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between p-4 bg-card/45 backdrop-blur-md rounded-2xl border">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search active cards..."
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0 justify-end">
          <Filter className="h-4 w-4 text-muted-foreground" />
          
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="h-9 border border-input rounded-xl bg-background text-xs px-2.5 focus:outline-none focus:ring-2 focus:ring-ring w-36 font-semibold text-muted-foreground"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-9 border border-input rounded-xl bg-background text-xs px-2.5 focus:outline-none focus:ring-2 focus:ring-ring w-32 font-semibold text-muted-foreground"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      {/* KANBAN GRID COLUMNS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start h-[calc(100vh-270px)] overflow-y-auto pr-1">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);
          const isDraggingOver = dragOverColumn === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`rounded-2xl border bg-card/30 p-4 space-y-4 min-h-[400px] flex flex-col justify-start transition-all ${
                isDraggingOver ? "border-primary bg-primary/5 shadow-inner scale-[1.01]" : "border-border/60"
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider py-0.5 px-2.5 ${col.color}`}>
                    {col.title}
                  </Badge>
                  <span className="text-[10px] font-bold text-muted-foreground">({colTasks.length})</span>
                </div>
              </div>

              {/* Column tasks cards list */}
              <div className="flex-1 space-y-3 overflow-y-auto pr-1 max-h-[500px]">
                {colTasks.length === 0 ? (
                  <div className="text-center py-10 text-[10px] text-muted-foreground border-2 border-dashed rounded-xl border-border/40 select-none">
                    Drop items here
                  </div>
                ) : (
                  colTasks.map((task) => {
                    let priorityColor = "border-slate-500/20 text-muted-foreground bg-slate-500/5";
                    if (task.priority === "high") priorityColor = "border-rose-500/20 text-rose-500 bg-rose-500/5";
                    if (task.priority === "medium") priorityColor = "border-amber-500/20 text-amber-500 bg-amber-500/5";

                    return (
                      <Card
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onClick={() => {
                          setActiveTask(task);
                          setIsDetailOpen(true);
                        }}
                        className="cursor-grab active:cursor-grabbing border-border hover:border-primary/50 hover:shadow-md transition-all group relative overflow-hidden select-none bg-card"
                      >
                        <CardHeader className="p-3.5 pb-2">
                          <div className="flex justify-between items-start gap-2">
                            {/* Priority tag */}
                            <Badge variant="outline" className={`text-[8px] uppercase tracking-wide font-bold ${priorityColor}`}>
                              {task.priority}
                            </Badge>
                            {/* Project metadata */}
                            <span className="text-[9px] text-muted-foreground font-semibold truncate max-w-[80px]">
                              {projects.find((p) => p.id === task.projectId)?.name || "External"}
                            </span>
                          </div>
                          
                          <CardTitle className="text-xs font-bold mt-2 text-foreground truncate group-hover:text-primary transition-colors">
                            {task.name}
                          </CardTitle>
                        </CardHeader>
                        
                        <CardContent className="p-3.5 pt-0 pb-3 space-y-3 text-[10px]">
                          <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {task.labels.map((lbl, idx) => (
                              <Badge key={idx} variant="outline" className="text-[8px] px-1 py-0 border-border bg-muted/40">
                                {lbl}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>

                        <CardFooter className="p-3.5 pt-2 border-t bg-card/10 flex justify-between items-center text-[9px] text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {task.deadline}
                          </div>
                          <div className="flex items-center gap-2">
                            {task.comments.length > 0 && (
                              <span className="flex items-center gap-0.5" title="Comments">
                                <MessageSquare className="h-3 w-3" /> {task.comments.length}
                              </span>
                            )}
                            {task.attachments.length > 0 && (
                              <span className="flex items-center gap-0.5" title="Attachments">
                                <Paperclip className="h-3 w-3" /> {task.attachments.length}
                              </span>
                            )}
                            <img src={task.assignee.avatar} className="h-4.5 w-4.5 rounded-full object-cover border" title={task.assignee.name} alt="" />
                          </div>
                        </CardFooter>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* TASK DETAILS OVERLAY DRAWER DIALOG */}
      {activeTask && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl border-border/80 shadow-2xl glassmorphism h-[90vh] flex flex-col p-0 overflow-hidden">
            
            <DialogHeader className="p-6 pb-4 border-b flex flex-row items-center justify-between">
              <div className="space-y-1 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle className="text-base font-bold">{activeTask.name}</DialogTitle>
                  <Badge variant="outline" className="text-[9px] bg-primary/10 border-primary/20 text-primary uppercase font-bold">
                    {activeTask.id}
                  </Badge>
                </div>
                <DialogDescription className="text-xs">
                  Project: {projects.find((p) => p.id === activeTask.projectId)?.name || "External"}
                </DialogDescription>
              </div>
              <button
                onClick={() => handleRemoveTask(activeTask.id, activeTask.name)}
                className="text-muted-foreground hover:text-rose-500 p-2 hover:bg-muted/80 rounded-lg transition-all shrink-0 mr-6"
                title="Delete Task"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </DialogHeader>

            {/* Scrollable details wrapper */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              
              {/* Properties row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border rounded-xl bg-card">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block">Status</span>
                  <select
                    value={activeTask.status}
                    onChange={(e) => {
                      moveTask(activeTask.id, e.target.value as any);
                      setActiveTask({ ...activeTask, status: e.target.value as any });
                      toast({ title: "Status Changed", type: "success" });
                    }}
                    className="mt-1 border border-input rounded-lg bg-background text-[11px] p-1 font-semibold focus:outline-none w-28 text-muted-foreground"
                  >
                    <option value="todo">To Do</option>
                    <option value="inprogress">In Progress</option>
                    <option value="review">In Review</option>
                    <option value="done">Completed</option>
                  </select>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block">Priority</span>
                  <Badge variant="outline" className="mt-1 text-[9px] uppercase font-bold px-2 py-0.5">
                    {activeTask.priority}
                  </Badge>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block">Deadline</span>
                  <span className="mt-1 font-semibold text-foreground flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> {activeTask.deadline}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block">Assignee</span>
                  <div className="flex items-center gap-1.5 mt-1 font-semibold">
                    <img src={activeTask.assignee.avatar} className="h-5 w-5 rounded-full object-cover" alt="" />
                    <span>{activeTask.assignee.name}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="font-bold text-foreground">Task Overview</h4>
                <p className="text-muted-foreground leading-relaxed p-3.5 border rounded-lg bg-muted/20">
                  {activeTask.description}
                </p>
              </div>

              {/* Labels */}
              <div className="space-y-2">
                <h4 className="font-bold text-foreground">Labels</h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeTask.labels.map((lbl, idx) => (
                    <Badge key={idx} variant="outline" className="text-[9px] px-2 bg-muted/40 font-medium">
                      {lbl}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Attachments Section */}
              <div className="space-y-3">
                <h4 className="font-bold text-foreground">Attachments ({activeTask.attachments.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {activeTask.attachments.map((att) => (
                    <div key={att.id} className="flex items-center justify-between p-2 border rounded-lg bg-card text-[11px] gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Paperclip className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate font-semibold">{att.name}</span>
                        <span className="text-[9px] text-muted-foreground">({att.size})</span>
                      </div>
                      <a href={att.url} className="text-primary hover:underline font-semibold shrink-0">Download</a>
                    </div>
                  ))}
                </div>
                {/* Mock Upload Attachment form */}
                <div className="flex gap-2">
                  <Input
                    value={mockAttachmentName}
                    onChange={(e) => setMockAttachmentName(e.target.value)}
                    placeholder="Attach mock file (e.g. api_specs.json)"
                    className="h-8.5 text-xs flex-1"
                  />
                  <Button size="sm" onClick={handlePostAttachment} className="h-8.5 font-semibold">Upload</Button>
                </div>
              </div>

              {/* Comments Section */}
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-bold text-foreground flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" /> Discussion Thread ({activeTask.comments.length})
                </h4>

                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {activeTask.comments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4 italic">No messages posted. Start the conversation!</p>
                  ) : (
                    activeTask.comments.map((comm) => (
                      <div key={comm.id} className="flex gap-3 items-start pb-3 border-b last:border-0 last:pb-0">
                        <img src={comm.avatar} className="h-7 w-7 rounded-full object-cover shrink-0" alt="" />
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-foreground">{comm.user}</span>
                            <span className="text-muted-foreground">
                              {new Date(comm.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-muted-foreground leading-normal">{comm.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Comment input form */}
                <div className="flex gap-2">
                  <Input
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Post a comment to the team..."
                    className="h-8.5 text-xs flex-1"
                    onKeyDown={(e) => { if (e.key === "Enter") handlePostComment(); }}
                  />
                  <Button size="sm" onClick={handlePostComment} className="h-8.5 font-semibold">Post</Button>
                </div>
              </div>

            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
