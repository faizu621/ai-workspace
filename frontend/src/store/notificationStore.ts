import { create } from "zustand";

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: "info" | "success" | "warning" | "error" | "ai";
  read: boolean;
  timestamp: string;
}

interface NotificationState {
  notifications: Notification[];
  isOpen: boolean;
  toggleOpen: (open?: boolean) => void;
  addNotification: (notification: Omit<Notification, "id" | "read" | "timestamp">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  getUnreadCount: () => number;
}

const mockNotifications: Notification[] = [
  {
    id: "not_1",
    title: "AI Response Stream Complete",
    description: "The analysis of the wireframe specifications has finished. Model used: Gemini 1.5 Pro.",
    type: "ai",
    read: false,
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString() // 5m ago
  },
  {
    id: "not_2",
    title: "Task Assigned to You",
    description: "Sarah Chen assigned you the task 'Refactor Dashboard Grid Layout' in Project 'AI Workspace Core Dashboard'.",
    type: "info",
    read: false,
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30m ago
  },
  {
    id: "not_3",
    title: "Project Milestone Reached",
    description: "Project 'Platform Documentation Hub' progress is now 95%. Ready for review.",
    type: "success",
    read: true,
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4h ago
  },
  {
    id: "not_4",
    title: "API Key Usage Warning",
    description: "API Key 'Development SDK' has reached 90% of its daily rate limits.",
    type: "warning",
    read: false,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1d ago
  }
];

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: mockNotifications,
  isOpen: false,
  toggleOpen: (open) => set((state) => ({ isOpen: open !== undefined ? open : !state.isOpen })),
  
  addNotification: (n) => set((state) => {
    const newNot: Notification = {
      ...n,
      id: `not_${Math.random().toString(36).substr(2, 9)}`,
      read: false,
      timestamp: new Date().toISOString()
    };
    return { notifications: [newNot, ...state.notifications] };
  }),

  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) => n.id === id ? { ...n, read: true } : n)
  })),

  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, read: true }))
  })),

  deleteNotification: (id) => set((state) => ({
    notifications: state.notifications.filter((n) => n.id !== id)
  })),

  clearAll: () => set({ notifications: [] }),

  getUnreadCount: () => {
    return get().notifications.filter((n) => !n.read).length;
  }
}));
