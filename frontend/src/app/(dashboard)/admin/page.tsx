"use client";

import React, { useState } from "react";
import {
  ShieldAlert, Users2, KeyRound, BarChart3, Clock, Loader2, Check,
  UserCheck, Lock, CheckSquare, Settings, Database, Server
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member" | "viewer";
  status: "active" | "suspended";
  workspacesCount: number;
}

const initialUsers: AdminUser[] = [
  { id: "usr_1", name: "Alex Rivera", email: "alex.rivera@workspace.ai", role: "admin", status: "active", workspacesCount: 2 },
  { id: "usr_2", name: "Sarah Chen", email: "sarah.c@workspace.ai", role: "member", status: "active", workspacesCount: 1 },
  { id: "usr_3", name: "Marcus Johnson", email: "marcus.j@workspace.ai", role: "member", status: "active", workspacesCount: 1 },
  { id: "usr_4", name: "Emily Watson", email: "emily.w@workspace.ai", role: "member", status: "active", workspacesCount: 1 },
  { id: "usr_5", name: "David Kim", email: "david.k@workspace.ai", role: "viewer", status: "suspended", workspacesCount: 0 }
];

const auditLogs = [
  { id: "al_1", timestamp: "2026-06-28T04:10:00Z", actor: "Alex Rivera", action: "Generated new API key 'Analytics SDK'", ip: "192.168.1.45" },
  { id: "al_2", timestamp: "2026-06-27T18:22:00Z", actor: "Alex Rivera", action: "Terminated project 'Old Dashboard wireframes'", ip: "192.168.1.45" },
  { id: "al_3", timestamp: "2026-06-26T10:15:00Z", actor: "Sarah Chen", action: "Created task card 'Refactor Grid' in core proj", ip: "172.56.21.90" },
  { id: "al_4", timestamp: "2026-06-25T11:20:00Z", actor: "Alex Rivera", action: "Uploaded file 'System_Architecture_v2.pdf'", ip: "192.168.1.45" },
  { id: "al_5", timestamp: "2026-06-24T16:15:00Z", actor: "Marcus Johnson", action: "Modified nginx configurations for staging", ip: "192.168.1.99" }
];

const modelAllocationData = [
  { model: "Gemini 1.5 Pro", tokens: 280000, color: "#8b5cf6" },
  { model: "Gemini 1.5 Flash", tokens: 190000, color: "#3b82f6" },
  { model: "Claude 3.5 Sonnet", tokens: 340000, color: "#ec4899" },
  { model: "GPT-4o", tokens: 120000, color: "#10b981" }
];

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [activeTab, setActiveTab] = useState("users");

  // RBAC permissions state checkboxes
  const [rbacMatrix, setRbacMatrix] = useState({
    admin: { read: true, write: true, delete: true, aiQuery: true, billing: true },
    member: { read: true, write: true, delete: false, aiQuery: true, billing: false },
    viewer: { read: true, write: false, delete: false, aiQuery: false, billing: false }
  });

  const handleTogglePermission = (role: keyof typeof rbacMatrix, field: keyof typeof rbacMatrix["admin"]) => {
    setRbacMatrix({
      ...rbacMatrix,
      [role]: {
        ...rbacMatrix[role],
        [field]: !rbacMatrix[role][field]
      }
    });
    toast({ title: "RBAC Matrix Altered", description: `Updated permissions grid for '${role}'`, type: "info" });
  };

  const handleRoleChange = (userId: string, newRole: AdminUser["role"]) => {
    setUsers(users.map((u) => u.id === userId ? { ...u, role: newRole } : u));
    toast({ title: "User Role Modified", type: "success" });
  };

  const handleStatusToggle = (userId: string, current: AdminUser["status"]) => {
    const next: AdminUser["status"] = current === "active" ? "suspended" : "active";
    setUsers(users.map((u) => u.id === userId ? { ...u, status: next } : u));
    toast({ title: `User ${next === "active" ? "Activated" : "Suspended"}`, type: "warning" });
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Console</h1>
        <p className="text-sm text-muted-foreground">Manage user directory, RBAC permission matrices, audit logs, and global model loads</p>
      </div>

      {/* CORE CONTROL TABS */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/40 p-1 flex justify-start max-w-lg border">
          <TabsTrigger value="users" className="text-xs font-semibold">User Management</TabsTrigger>
          <TabsTrigger value="rbac" className="text-xs font-semibold">Roles & Matrix</TabsTrigger>
          <TabsTrigger value="diagnostics" className="text-xs font-semibold">AI Diagnostics</TabsTrigger>
          <TabsTrigger value="audit" className="text-xs font-semibold">Audit Logs</TabsTrigger>
        </TabsList>

        {/* 1. USER DIRECTORY MANAGEMENT */}
        <TabsContent value="users" className="animate-slide-up">
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Users2 className="h-4.5 w-4.5 text-primary" /> Active Platform Directory
              </CardTitle>
              <CardDescription className="text-xs">Setup roles, suspend logins, and monitor workspace assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="p-3 font-semibold text-muted-foreground">User Profile</th>
                      <th className="p-3 font-semibold text-muted-foreground">Email</th>
                      <th className="p-3 font-semibold text-muted-foreground">Status</th>
                      <th className="p-3 font-semibold text-muted-foreground">Workspaces</th>
                      <th className="p-3 font-semibold text-muted-foreground">Access Role</th>
                      <th className="p-3 font-semibold text-muted-foreground text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-foreground/90">
                    {users.map((u) => {
                      let statusBadge = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
                      if (u.status === "suspended") statusBadge = "bg-rose-500/10 text-rose-500 border-rose-500/20";

                      return (
                        <tr key={u.id} className="hover:bg-muted/10 transition-colors">
                          <td className="p-3 font-bold">{u.name}</td>
                          <td className="p-3">{u.email}</td>
                          <td className="p-3">
                            <Badge variant="outline" className={`text-[9px] uppercase font-bold ${statusBadge}`}>
                              {u.status}
                            </Badge>
                          </td>
                          <td className="p-3 font-semibold">{u.workspacesCount}</td>
                          <td className="p-3">
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                              className="h-8 border border-input rounded-lg bg-background text-[11px] px-2 focus:outline-none"
                            >
                              <option value="admin">Admin</option>
                              <option value="member">Member</option>
                              <option value="viewer">Viewer</option>
                            </select>
                          </td>
                          <td className="p-3 text-right">
                            <Button
                              onClick={() => handleStatusToggle(u.id, u.status)}
                              variant="outline"
                              size="sm"
                              className="h-7 text-[10px] font-semibold"
                            >
                              {u.status === "active" ? "Suspend" : "Activate"}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. RBAC PERMISSIONS MATRIX */}
        <TabsContent value="rbac" className="animate-slide-up">
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Lock className="h-4.5 w-4.5 text-blue-500" /> RBAC Permissions Matrix
              </CardTitle>
              <CardDescription className="text-xs">Map read, write, execution rights, and billing capabilities across client roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="p-3 font-semibold text-muted-foreground">Access Role</th>
                      <th className="p-3 font-semibold text-muted-foreground text-center">Read data</th>
                      <th className="p-3 font-semibold text-muted-foreground text-center">Write data</th>
                      <th className="p-3 font-semibold text-muted-foreground text-center">Delete data</th>
                      <th className="p-3 font-semibold text-muted-foreground text-center">AI Prompt Caps</th>
                      <th className="p-3 font-semibold text-muted-foreground text-center">Billing Settings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(Object.keys(rbacMatrix) as Array<keyof typeof rbacMatrix>).map((role) => (
                      <tr key={role} className="hover:bg-muted/10 transition-colors">
                        <td className="p-3 font-bold uppercase tracking-wider text-primary text-[10px]">
                          {role}
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={rbacMatrix[role].read}
                            onChange={() => handleTogglePermission(role, "read")}
                            className="h-4.5 w-4.5 cursor-pointer accent-primary rounded"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={rbacMatrix[role].write}
                            onChange={() => handleTogglePermission(role, "write")}
                            className="h-4.5 w-4.5 cursor-pointer accent-primary rounded"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={rbacMatrix[role].delete}
                            onChange={() => handleTogglePermission(role, "delete")}
                            className="h-4.5 w-4.5 cursor-pointer accent-primary rounded"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={rbacMatrix[role].aiQuery}
                            onChange={() => handleTogglePermission(role, "aiQuery")}
                            className="h-4.5 w-4.5 cursor-pointer accent-primary rounded"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={rbacMatrix[role].billing}
                            onChange={() => handleTogglePermission(role, "billing")}
                            className="h-4.5 w-4.5 cursor-pointer accent-primary rounded"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. AI DIAGNOSTICS & SYSTEM USAGE */}
        <TabsContent value="diagnostics" className="animate-slide-up">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Model chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <BarChart3 className="h-4.5 w-4.5 text-violet-500" /> Token Volume Allocation
                </CardTitle>
                <CardDescription className="text-xs">Aggregate token volume weight per LLM models type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[240px] w-full text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={modelAllocationData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/40" />
                      <XAxis dataKey="model" className="fill-muted-foreground" />
                      <YAxis className="fill-muted-foreground" />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} />
                      <Bar dataKey="tokens" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Tokens Consumed" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Server health check logs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Database className="h-4.5 w-4.5 text-emerald-500" /> Infrastructure Logs
                </CardTitle>
                <CardDescription className="text-xs">Database metrics and microservice layers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Server className="h-3.5 w-3.5" /> Core Database instance
                  </span>
                  <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-500 font-bold uppercase">
                    Healthy
                  </Badge>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-muted-foreground">Sync replication status</span>
                  <span className="font-bold">0 ms lag</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Connected API key clients</span>
                  <span className="font-bold">42 active calls</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 4. AUDIT LOGS TIMELINE */}
        <TabsContent value="audit" className="animate-slide-up">
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Clock className="h-4.5 w-4.5 text-pink-500" /> Platform Security Audit Trail
              </CardTitle>
              <CardDescription className="text-xs">Live log of keys updates, tier changes, and data deletions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="p-3 font-semibold text-muted-foreground">Timestamp</th>
                      <th className="p-3 font-semibold text-muted-foreground">Admin / Actor</th>
                      <th className="p-3 font-semibold text-muted-foreground">Logged Action</th>
                      <th className="p-3 font-semibold text-muted-foreground text-right">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-muted-foreground">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-muted/10 transition-colors">
                        <td className="p-3 font-mono text-[10px]">
                          {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="p-3 font-bold text-foreground">{log.actor}</td>
                        <td className="p-3 text-foreground/90">{log.action}</td>
                        <td className="p-3 text-right font-mono text-[10px]">{log.ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
