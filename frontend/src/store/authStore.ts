import { create } from "zustand";

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
}

export interface UserSession {
  id: string;
  device: string;
  ip: string;
  location: string;
  active: boolean;
  lastActive: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "admin" | "member" | "viewer";
  skills: string[];
  socialLinks: {
    github?: string;
    twitter?: string;
    linkedin?: string;
  };
  apiKeys: ApiKey[];
  sessions: UserSession[];
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  token: string | null;
  activeWorkspace: { id: string; name: string; type: "personal" | "enterprise" };
  workspaces: Array<{ id: string; name: string; type: "personal" | "enterprise" }>;
  login: (token: string, user: UserProfile) => void;
  register: (token: string, user: UserProfile) => void;
  logout: () => void;
  updateProfile: (updated: Partial<UserProfile>) => void;
  generateApiKey: (name: string) => void;
  revokeApiKey: (id: string) => void;
  switchWorkspace: (id: string) => void;
}

const mockSessions: UserSession[] = [
  {
    id: "1",
    device: "Windows 11 PC - Chrome browser",
    ip: "192.168.1.45",
    location: "San Francisco, USA",
    active: true,
    lastActive: "Just now",
  },
  {
    id: "2",
    device: "Apple iPhone 15 Pro Max",
    ip: "172.56.21.90",
    location: "San Francisco, USA",
    active: false,
    lastActive: "2 hours ago",
  },
];

const mockUser: UserProfile = {
  id: "usr_9021",
  name: "Alex Rivera",
  email: "alex.rivera@workspace.ai",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80",
  role: "admin",
  skills: ["React", "TypeScript", "Next.js", "AI Integration", "TailwindCSS"],
  socialLinks: {
    github: "github.com/alexrivera-ai",
    twitter: "twitter.com/alex_ai_dev",
    linkedin: "linkedin.com/in/alex-rivera-workspace",
  },
  apiKeys: [
    { id: "key_1", name: "Development SDK", key: "sk_live_51P...fG8a", createdAt: "2026-04-10" },
    { id: "key_2", name: "Staging Pipeline", key: "sk_live_51Q...K9o1", createdAt: "2026-05-22" },
  ],
  sessions: mockSessions,
};

export const useAuthStore = create<AuthState>((set) => {
  // Load initial from localStorage on client side
  let initialAuth = false;
  let initialToken = null;
  let initialUser = null;

  if (typeof window !== "undefined") {
    initialToken = localStorage.getItem("auth_token");
    initialAuth = !!initialToken;
    if (initialAuth) {
      initialUser = mockUser;
    }
  }

  return {
    user: initialUser,
    isAuthenticated: initialAuth,
    token: initialToken,
    activeWorkspace: { id: "ws_ent", name: "Acme Enterprise", type: "enterprise" },
    workspaces: [
      { id: "ws_ent", name: "Acme Enterprise", type: "enterprise" },
      { id: "ws_pers", name: "Alex Personal", type: "personal" },
    ],
    login: (token, user) => {
      localStorage.setItem("auth_token", token);
      set({
        isAuthenticated: true,
        token: token,
        user: user,
      });
    },
    register: (token, user) => {
      localStorage.setItem("auth_token", token);
      set({
        isAuthenticated: true,
        token: token,
        user: user,
      });
    },
    logout: () => {
      localStorage.removeItem("auth_token");
      set({ isAuthenticated: false, token: null, user: null });
    },
    updateProfile: (updated) =>
      set((state) => ({
        user: state.user ? { ...state.user, ...updated } : null,
      })),
    generateApiKey: (name) =>
      set((state) => {
        if (!state.user) return {};
        const newKey: ApiKey = {
          id: `key_${Math.random().toString(36).substr(2, 9)}`,
          name,
          key: `sk_live_${Math.random().toString(36).substr(2, 6)}...${Math.random().toString(36).substr(2, 4)}`,
          createdAt: new Date().toISOString().split("T")[0],
        };
        return {
          user: {
            ...state.user,
            apiKeys: [...state.user.apiKeys, newKey],
          },
        };
      }),
    revokeApiKey: (id) =>
      set((state) => {
        if (!state.user) return {};
        return {
          user: {
            ...state.user,
            apiKeys: state.user.apiKeys.filter((key) => key.id !== id),
          },
        };
      }),
    switchWorkspace: (id) =>
      set((state) => {
        const found = state.workspaces.find((ws) => ws.id === id);
        return found ? { activeWorkspace: found } : {};
      }),
  };
});
