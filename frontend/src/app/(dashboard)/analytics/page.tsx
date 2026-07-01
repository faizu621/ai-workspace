"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3, Calendar, Info, TrendingUp, Cpu, HardDrive,
  Users2, Landmark, RefreshCw, Loader2
} from "lucide-react";
import { analyticsService, AnalyticsData } from "@/services/analyticsService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const stats = await analyticsService.getAnalyticsData();
      setData(stats);
    } catch {
      toast({ title: "Failed to load metrics", type: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="py-20 text-center text-xs text-muted-foreground space-y-3">
        <Loader2 className="h-8 w-8 mx-auto text-primary animate-spin" />
        <p className="font-semibold text-foreground">Compiling Analytics Data...</p>
        <p>Crunching system logs, token counts, and session metrics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Analytics</h1>
          <p className="text-sm text-muted-foreground">Monitor storage allocation, generative token costs, and user velocity</p>
        </div>
        <Button onClick={fetchAnalytics} size="sm" variant="outline" className="gap-1.5 h-9 font-semibold shrink-0">
          <RefreshCw className="h-3.5 w-3.5" /> Re-sync Logs
        </Button>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex gap-4 items-center">
          <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-500">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Token Pool Used</span>
            <span className="text-xl font-bold">593k tokens</span>
          </div>
        </Card>

        <Card className="p-4 flex gap-4 items-center">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
            <Users2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Traffic Peaks</span>
            <span className="text-xl font-bold">52 Daily Actives</span>
          </div>
        </Card>

        <Card className="p-4 flex gap-4 items-center">
          <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-500">
            <HardDrive className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Storage Capacity</span>
            <span className="text-xl font-bold">250 MB / 500 MB</span>
          </div>
        </Card>

        <Card className="p-4 flex gap-4 items-center">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
            <Landmark className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Total SaaS ARR</span>
            <span className="text-xl font-bold">$32,500</span>
          </div>
        </Card>
      </div>

      {/* CHARTS GRID ROWS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. AI Usage area chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-1">
              <Cpu className="h-4 w-4 text-violet-500" /> AI LLM Requests Volume
            </CardTitle>
            <CardDescription className="text-xs">Tracks prompt volumes and output token sizes daily</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.aiUsage} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/40" />
                  <XAxis dataKey="date" className="fill-muted-foreground" />
                  <YAxis className="fill-muted-foreground" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} />
                  <Area type="monotone" dataKey="tokens" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorTokens)" name="Tokens Used" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 2. Storage pie chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-1">
              <HardDrive className="h-4 w-4 text-pink-500" /> Storage Breakdown
            </CardTitle>
            <CardDescription className="text-xs">Capacity allocations in Megabytes (MB)</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="h-[180px] w-full text-xs relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.storage}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="category"
                  >
                    {data.storage.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                <span className="text-lg font-bold">50%</span>
                <span className="text-[9px] text-muted-foreground">Allocated</span>
              </div>
            </div>
            {/* Pie legend */}
            <div className="w-full grid grid-cols-2 gap-2 text-[10px] pt-4 border-t">
              {data.storage.map((entry, idx) => (
                <div key={idx} className="flex items-center gap-1.5 font-semibold text-muted-foreground">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                  <span className="truncate">{entry.category}: {entry.value} MB</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 3. Task completions by project */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-1">
              <BarChart3 className="h-4 w-4 text-blue-500" /> Project Velocity
            </CardTitle>
            <CardDescription className="text-xs">Compares active vs completed sprint items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.projects} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/40" />
                  <XAxis dataKey="name" className="fill-muted-foreground text-[10px]" />
                  <YAxis className="fill-muted-foreground" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "10px" }} />
                  <Bar dataKey="tasksCompleted" fill="#10b981" radius={[3, 3, 0, 0]} name="Completed Tasks" />
                  <Bar dataKey="tasksActive" fill="#3b82f6" radius={[3, 3, 0, 0]} name="Active Tasks" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 4. Financial revenue growth */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-1">
              <Landmark className="h-4 w-4 text-emerald-500" /> Workspace Revenue Metrics
            </CardTitle>
            <CardDescription className="text-xs">Recurring SaaS fees and API utilization billings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.revenue} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/40" />
                  <XAxis dataKey="month" className="fill-muted-foreground" />
                  <YAxis className="fill-muted-foreground" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "10px" }} />
                  <Line type="monotone" dataKey="recurring" stroke="#10b981" strokeWidth={2.5} name="SaaS Subscriptions" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="apiBilling" stroke="#8b5cf6" strokeWidth={2.5} name="API Key Usage Billings" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
