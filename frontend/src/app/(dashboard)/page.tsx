"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users2, Kanban, Bot, HardDrive, Cpu, ArrowUpRight, Clock, Plus, CheckCircle,
  TrendingUp, Calendar as CalendarIcon, FileText
} from "lucide-react";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useChatStore } from "@/store/chatStore";
import { analyticsService, AnalyticsData } from "@/services/analyticsService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";

export default function DashboardPage() {
  const router = useRouter();

  // Zustand Store states
  const { projects, tasks } = useWorkspaceStore();
  const { conversations } = useChatStore();

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await analyticsService.getAnalyticsData();
        setAnalytics(data);
      } catch (e) {
        console.error("Failed to load analytics", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const totalProjects = projects.length;
  const activeTasks = tasks.filter((t) => t.status !== "done").length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;

  // Flattened Activity Log from all projects sorted by date
  const allActivities = projects
    .flatMap((p) => p.activities.map((a) => ({ ...a, projectName: p.name, projectId: p.id })))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good morning";
    if (hr < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-6">
      {/* GREETING CARD */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-2xl border bg-card/45 backdrop-blur-md relative overflow-hidden gap-4">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-[300px] h-[150px] rounded-full bg-primary/10 blur-[80px] pointer-events-none" />
        
        <div className="space-y-1 relative z-10">
          <h1 className="text-2xl font-bold tracking-tight glow-text-primary">
            {getGreeting()}, Developer!
          </h1>
          <p className="text-sm text-muted-foreground">
            Here's what is happening across your workspaces today.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 relative z-10">
          <Link href="/projects">
            <Button size="sm" variant="outline" className="text-xs h-9 font-semibold">
              Browse Projects
            </Button>
          </Link>
          <Link href="/chat">
            <Button size="sm" variant="gradient" className="text-xs h-9 font-semibold gap-1.5">
              <Bot className="h-4 w-4" /> Start AI Session
            </Button>
          </Link>
        </div>
      </div>

      {/* METRICS WIDGETS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Projects */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex flex-col justify-between h-28">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Projects</span>
              <Users2 className="h-4.5 w-4.5 text-violet-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{totalProjects}</h3>
              <p className="text-[10px] text-muted-foreground mt-1">Active items inside workspace</p>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Due */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex flex-col justify-between h-28">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tasks Due</span>
              <Kanban className="h-4.5 w-4.5 text-blue-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{activeTasks}</h3>
              <p className="text-[10px] text-muted-foreground mt-1">Awaiting actions/reviews</p>
            </div>
          </CardContent>
        </Card>

        {/* Completed Tasks */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex flex-col justify-between h-28">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Completed</span>
              <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{completedTasks}</h3>
              <p className="text-[10px] text-muted-foreground mt-1">Archive tasks checked off</p>
            </div>
          </CardContent>
        </Card>

        {/* Storage Limit */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex flex-col justify-between h-28">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Storage</span>
              <HardDrive className="h-4.5 w-4.5 text-pink-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">250 MB</h3>
              <div className="w-full bg-muted h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-pink-500 h-full rounded-full" style={{ width: "50%" }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Requests */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex flex-col justify-between h-28">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Queries</span>
              <Cpu className="h-4.5 w-4.5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">290</h3>
              <p className="text-[10px] text-amber-500 flex items-center gap-0.5 mt-1 font-semibold">
                <TrendingUp className="h-3 w-3" /> +15.2% this week
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Active Team */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex flex-col justify-between h-28">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Team</span>
              <Users2 className="h-4.5 w-4.5 text-indigo-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">52</h3>
              <p className="text-[10px] text-muted-foreground mt-1">Active users globally</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CHARTS GRAPH SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main AI Requests and Tokens Graph */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">AI Assistant Volume</CardTitle>
              <CardDescription className="text-xs">Requests and token distributions over time</CardDescription>
            </div>
            <Badge variant="outline" className="text-[10px] py-0.5 px-2 bg-muted/30">
              Last 7 Days
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] w-full text-xs">
              {loading || !analytics ? (
                <div className="h-full w-full bg-muted/20 animate-pulse rounded-lg flex items-center justify-center">
                  Loading chart statistics...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.aiUsage} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/40" />
                    <XAxis dataKey="date" className="fill-muted-foreground" />
                    <YAxis className="fill-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Area type="monotone" dataKey="requests" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorRequests)" name="Requests" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* User Session Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Workspace Traffic</CardTitle>
            <CardDescription className="text-xs">Daily active sessions by team members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] w-full text-xs">
              {loading || !analytics ? (
                <div className="h-full w-full bg-muted/20 animate-pulse rounded-lg flex items-center justify-center">
                  Loading metrics...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.users} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/40" />
                    <XAxis dataKey="date" className="fill-muted-foreground" />
                    <YAxis className="fill-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="active" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Active Members" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* LOWER SPLIT: ACTIVITIES & CALENDAR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Timeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold">Activity Log</CardTitle>
            <CardDescription className="text-xs">Real-time collaboration updates inside workspaces</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allActivities.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No workspace activity logs found.
                </div>
              ) : (
                allActivities.map((act) => {
                  let logTypeBadge = "bg-blue-500/10 text-blue-500";
                  if (act.type === "create") logTypeBadge = "bg-violet-500/10 text-violet-500";
                  if (act.type === "comment") logTypeBadge = "bg-amber-500/10 text-amber-500";
                  if (act.type === "file") logTypeBadge = "bg-pink-500/10 text-pink-500";
                  if (act.type === "status") logTypeBadge = "bg-emerald-500/10 text-emerald-500";

                  return (
                    <div key={act.id} className="flex gap-4 items-start text-xs border-b pb-3.5 last:border-0 last:pb-0">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 uppercase tracking-wide ${logTypeBadge}`}>
                        {act.type}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground">
                          {act.user}{" "}
                          <span className="font-normal text-muted-foreground">{act.content}</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          {new Date(act.timestamp).toLocaleDateString([], { month: "short", day: "numeric" })} at{" "}
                          {new Date(act.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          {" • "}
                          <Link href={`/projects/${act.projectId}`} className="text-primary hover:underline font-semibold">
                            {act.projectName}
                          </Link>
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Task Planner / Mini-Calendar Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Upcoming Deadlines</CardTitle>
              <CardDescription className="text-xs">Next project milestones and tasks</CardDescription>
            </div>
            <Link href="/tasks">
              <Button size="icon" variant="outline" className="h-8 w-8 rounded-lg">
                <Plus className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tasks.slice(0, 4).map((task) => {
                let priorityBadge = "border-amber-500/20 bg-amber-500/10 text-amber-500";
                if (task.priority === "high") priorityBadge = "border-rose-500/20 bg-rose-500/10 text-rose-500";
                if (task.priority === "low") priorityBadge = "border-slate-500/20 bg-slate-500/10 text-muted-foreground";

                return (
                  <div
                    key={task.id}
                    onClick={() => router.push("/tasks")}
                    className="flex justify-between items-center p-2.5 rounded-lg border hover:bg-muted/30 transition-colors cursor-pointer text-xs gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{task.name}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" /> {task.deadline}
                      </p>
                    </div>
                    <Badge variant="outline" className={`text-[9px] uppercase tracking-wide font-bold shrink-0 ${priorityBadge}`}>
                      {task.priority}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
