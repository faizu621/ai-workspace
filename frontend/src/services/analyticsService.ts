import axiosInstance from "@/lib/axios";

export interface AnalyticsData {
  storage: Array<{ category: string; value: number; color: string }>;
  aiUsage: Array<{ date: string; requests: number; tokens: number }>;
  users: Array<{ date: string; active: number; guests: number }>;
  projects: Array<{ name: string; tasksCompleted: number; tasksActive: number }>;
  revenue: Array<{ month: string; recurring: number; apiBilling: number }>;
  systemLoad: Array<{ time: string; cpu: number; ram: number }>;
}

const mockAnalytics: AnalyticsData = {
  storage: [
    { category: "User Documents", value: 120, color: "#8b5cf6" }, // purple
    { category: "AI Image Assets", value: 85, color: "#ec4899" },  // pink
    { category: "System Backups", value: 45, color: "#3b82f6" },   // blue
    { category: "Unallocated Space", value: 250, color: "#10b981" } // green
  ],
  aiUsage: [
    { date: "Jun 21", requests: 120, tokens: 48000 },
    { date: "Jun 22", requests: 155, tokens: 62000 },
    { date: "Jun 23", requests: 190, tokens: 78000 },
    { date: "Jun 24", requests: 160, tokens: 65000 },
    { date: "Jun 25", requests: 210, tokens: 89000 },
    { date: "Jun 26", requests: 245, tokens: 99000 },
    { date: "Jun 27", requests: 290, tokens: 120000 }
  ],
  users: [
    { date: "Jun 21", active: 25, guests: 4 },
    { date: "Jun 22", active: 29, guests: 5 },
    { date: "Jun 23", active: 34, guests: 8 },
    { date: "Jun 24", active: 31, guests: 6 },
    { date: "Jun 25", active: 40, guests: 10 },
    { date: "Jun 26", active: 46, guests: 12 },
    { date: "Jun 27", active: 52, guests: 15 }
  ],
  projects: [
    { name: "Core Dashboard", tasksCompleted: 45, tasksActive: 12 },
    { name: "LLM Streaming", tasksCompleted: 22, tasksActive: 18 },
    { name: "Security Audit", tasksCompleted: 5, tasksActive: 8 },
    { name: "Docs Hub", tasksCompleted: 35, tasksActive: 2 }
  ],
  revenue: [
    { month: "Jan", recurring: 12000, apiBilling: 4500 },
    { month: "Feb", recurring: 12500, apiBilling: 4800 },
    { month: "Mar", recurring: 14000, apiBilling: 6200 },
    { month: "Apr", recurring: 15500, apiBilling: 7100 },
    { month: "May", recurring: 18000, apiBilling: 8900 },
    { month: "Jun", recurring: 21000, apiBilling: 11500 }
  ],
  systemLoad: [
    { time: "00:00", cpu: 12, ram: 42 },
    { time: "04:00", cpu: 8, ram: 40 },
    { time: "08:00", cpu: 35, ram: 55 },
    { time: "12:00", cpu: 78, ram: 82 },
    { time: "16:00", cpu: 62, ram: 79 },
    { time: "20:00", cpu: 45, ram: 68 }
  ]
};

export const analyticsService = {
  async getAnalyticsData(): Promise<AnalyticsData> {
    await axiosInstance.get("/analytics/dashboard");
    return mockAnalytics;
  }
};
