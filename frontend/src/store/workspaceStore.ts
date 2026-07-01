import { create } from "zustand";

export interface Member {
  name: string;
  email: string;
  avatar: string;
}

export interface ActivityLog {
  id: string;
  type: "create" | "comment" | "status" | "assign" | "file";
  user: string;
  content: string;
  timestamp: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  members: Member[];
  deadline: string;
  status: "Planning" | "In Progress" | "In Review" | "Completed";
  priority: "Low" | "Medium" | "High";
  progress: number;
  activities: ActivityLog[];
}

export interface TaskComment {
  id: string;
  user: string;
  avatar: string;
  content: string;
  timestamp: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  description: string;
  status: "todo" | "inprogress" | "review" | "done";
  priority: "low" | "medium" | "high";
  assignee: Member;
  deadline: string;
  labels: string[];
  comments: TaskComment[];
  attachments: TaskAttachment[];
}

interface WorkspaceState {
  projects: Project[];
  tasks: Task[];
  searchQuery: string;
  selectedProjectId: string | null;
  setSearchQuery: (query: string) => void;
  selectProject: (id: string | null) => void;
  
  // Project Actions
  addProject: (project: Omit<Project, "id" | "progress" | "activities">) => void;
  updateProject: (id: string, updated: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addProjectActivity: (projectId: string, log: Omit<ActivityLog, "id" | "timestamp">) => void;
  
  // Task Actions
  addTask: (task: Omit<Task, "id" | "comments" | "attachments">) => void;
  updateTask: (id: string, updated: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, newStatus: Task["status"]) => void;
  addTaskComment: (taskId: string, comment: Omit<TaskComment, "id" | "timestamp">) => void;
  addTaskAttachment: (taskId: string, attachment: Omit<TaskAttachment, "id">) => void;
}

const mockMembers: Member[] = [
  { name: "Alex Rivera", email: "alex@workspace.ai", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80" },
  { name: "Sarah Chen", email: "sarah.c@workspace.ai", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80" },
  { name: "Marcus Johnson", email: "marcus.j@workspace.ai", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80" },
  { name: "Emily Watson", email: "emily.w@workspace.ai", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=256&h=256&q=80" }
];

const initialProjects: Project[] = [
  {
    id: "proj_1",
    name: "AI Workspace Core Dashboard",
    description: "Design and implement the premium Next.js dashboard featuring customizable widget configurations, user role allocations, and unified command menus.",
    members: [mockMembers[0], mockMembers[1], mockMembers[2]],
    deadline: "2026-07-20",
    status: "In Progress",
    priority: "High",
    progress: 68,
    activities: [
      { id: "act_1", type: "create", user: "Alex Rivera", content: "Created Project 'AI Workspace Core Dashboard'", timestamp: "2026-06-25T10:00:00Z" },
      { id: "act_2", type: "status", user: "Sarah Chen", content: "Moved project status to 'In Progress'", timestamp: "2026-06-25T14:30:00Z" },
      { id: "act_3", type: "file", user: "Marcus Johnson", content: "Uploaded wireframe specifications", timestamp: "2026-06-26T09:15:00Z" }
    ]
  },
  {
    id: "proj_2",
    name: "LLM Streaming Integration",
    description: "Hook up multiple generative language models (Gemini, Claude, GPT-4) with high performance text-streaming interfaces, stop-generation triggers, and token usages analytics dashboards.",
    members: [mockMembers[0], mockMembers[1], mockMembers[3]],
    deadline: "2026-07-15",
    status: "In Progress",
    priority: "High",
    progress: 45,
    activities: [
      { id: "act_4", type: "create", user: "Alex Rivera", content: "Created Project 'LLM Streaming Integration'", timestamp: "2026-06-20T11:00:00Z" },
      { id: "act_5", type: "assign", user: "Alex Rivera", content: "Assigned Emily Watson as chief LLM engineer", timestamp: "2026-06-20T11:15:00Z" }
    ]
  },
  {
    id: "proj_3",
    name: "Enterprise Security Audit",
    description: "Perform comprehensive threat modeling, multi-tenant workspace data-isolation checks, and implement OAuth / custom SSO mechanisms.",
    members: [mockMembers[2], mockMembers[3]],
    deadline: "2026-08-05",
    status: "Planning",
    priority: "Medium",
    progress: 10,
    activities: [
      { id: "act_6", type: "create", user: "Marcus Johnson", content: "Initiated planning phases for project audit scope", timestamp: "2026-06-27T16:00:00Z" }
    ]
  },
  {
    id: "proj_4",
    name: "Platform Documentation Hub",
    description: "Launch the developer support wiki, detailing API capabilities, sandbox keys configuration, and integration tutorials.",
    members: [mockMembers[1], mockMembers[2]],
    deadline: "2026-07-02",
    status: "In Review",
    priority: "Low",
    progress: 95,
    activities: [
      { id: "act_7", type: "status", user: "Sarah Chen", content: "Moved project status to 'In Review'", timestamp: "2026-06-27T08:00:00Z" }
    ]
  }
];

const initialTasks: Task[] = [
  {
    id: "task_1",
    projectId: "proj_1",
    name: "Refactor Dashboard Grid Layout",
    description: "Make the widgets grid dynamic and responsive across mobile breakpoints. Enable user preference layouts storage using Zustands state.",
    status: "inprogress",
    priority: "high",
    assignee: mockMembers[0],
    deadline: "2026-07-05",
    labels: ["Frontend", "UI Refactor"],
    comments: [
      { id: "tc_1", user: "Sarah Chen", avatar: mockMembers[1].avatar, content: "Double check Tailwind breakpoints (lg vs xl) for standard 1080p desktop layouts.", timestamp: "2026-06-27T12:00:00Z" },
      { id: "tc_2", user: "Alex Rivera", avatar: mockMembers[0].avatar, content: "Good catch, I will align them with the layout containers specs.", timestamp: "2026-06-27T12:30:00Z" }
    ],
    attachments: [
      { id: "ta_1", name: "grid_blueprint.png", size: "450 KB", type: "image/png", url: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=400&q=80" }
    ]
  },
  {
    id: "task_2",
    projectId: "proj_1",
    name: "Integrate Command Menu Dialog (Cmd+K)",
    description: "Add keyboard navigation support, search lists filtering, and direct workspace redirection tags in the command panel.",
    status: "todo",
    priority: "medium",
    assignee: mockMembers[1],
    deadline: "2026-07-10",
    labels: ["UX", "Accessibility"],
    comments: [],
    attachments: []
  },
  {
    id: "task_3",
    projectId: "proj_2",
    name: "Configure Stream Parsing Buffer",
    description: "Create custom parsing regex chunks for SSE (Server-Sent Events) tokens, correctly decoding markdown syntax highlighting inline code tags.",
    status: "inprogress",
    priority: "high",
    assignee: mockMembers[3],
    deadline: "2026-07-01",
    labels: ["LLM", "Core Engine"],
    comments: [],
    attachments: []
  },
  {
    id: "task_4",
    projectId: "proj_2",
    name: "Simulate Typing Indicator",
    description: "Build an active CSS animation showing three pulsing bubbles indicating the AI assistant is formulating a response.",
    status: "done",
    priority: "low",
    assignee: mockMembers[0],
    deadline: "2026-06-26",
    labels: ["Frontend", "UX"],
    comments: [
      { id: "tc_3", user: "Emily Watson", avatar: mockMembers[3].avatar, content: "Looks super smooth, matched the ChatGPT design perfectly!", timestamp: "2026-06-26T17:45:00Z" }
    ],
    attachments: []
  },
  {
    id: "task_5",
    projectId: "proj_3",
    name: "Write Security JWT Interceptors",
    description: "Configure Axios instances to automatically handle expired tokens, retry operations, and redirect to login if session is corrupt.",
    status: "todo",
    priority: "high",
    assignee: mockMembers[2],
    deadline: "2026-08-01",
    labels: ["Security", "API"],
    comments: [],
    attachments: []
  }
];

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  projects: initialProjects,
  tasks: initialTasks,
  searchQuery: "",
  selectedProjectId: null,
  setSearchQuery: (query) => set({ searchQuery: query }),
  selectProject: (id) => set({ selectedProjectId: id }),
  
  addProject: (p) => set((state) => {
    const newProj: Project = {
      ...p,
      id: `proj_${Math.random().toString(36).substr(2, 9)}`,
      progress: 0,
      activities: [
        {
          id: `act_${Math.random().toString(36).substr(2, 9)}`,
          type: "create",
          user: p.members[0]?.name || "System",
          content: `Created Project '${p.name}'`,
          timestamp: new Date().toISOString()
        }
      ]
    };
    return { projects: [...state.projects, newProj] };
  }),
  
  updateProject: (id, updated) => set((state) => ({
    projects: state.projects.map((p) => p.id === id ? { ...p, ...updated } : p)
  })),
  
  deleteProject: (id) => set((state) => ({
    projects: state.projects.filter((p) => p.id !== id),
    tasks: state.tasks.filter((t) => t.projectId !== id),
    selectedProjectId: state.selectedProjectId === id ? null : state.selectedProjectId
  })),

  addProjectActivity: (projectId, log) => set((state) => ({
    projects: state.projects.map((p) => {
      if (p.id !== projectId) return p;
      const newLog: ActivityLog = {
        ...log,
        id: `act_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString()
      };
      return {
        ...p,
        activities: [newLog, ...p.activities]
      };
    })
  })),

  addTask: (t) => set((state) => {
    const newTask: Task = {
      ...t,
      id: `task_${Math.random().toString(36).substr(2, 9)}`,
      comments: [],
      attachments: []
    };
    
    // Auto-update project activity
    state.addProjectActivity(t.projectId, {
      type: "create",
      user: t.assignee.name,
      content: `Added task '${t.name}' assigned to ${t.assignee.name}`
    });

    return { tasks: [...state.tasks, newTask] };
  }),

  updateTask: (id, updated) => set((state) => ({
    tasks: state.tasks.map((t) => t.id === id ? { ...t, ...updated } : t)
  })),

  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter((t) => t.id !== id)
  })),

  moveTask: (taskId, newStatus) => set((state) => {
    const task = state.tasks.find((t) => t.id === taskId);
    if (!task) return {};

    const oldStatus = task.status;
    if (oldStatus === newStatus) return {};

    // Auto-update project activity
    state.addProjectActivity(task.projectId, {
      type: "status",
      user: task.assignee.name,
      content: `Moved task '${task.name}' from ${oldStatus.toUpperCase()} to ${newStatus.toUpperCase()}`
    });

    // Auto recalculate project progress if project exists
    const projTasks = state.tasks.map((t) => t.id === taskId ? { ...t, status: newStatus } : t)
      .filter((t) => t.projectId === task.projectId);
    const doneTasksCount = projTasks.filter((t) => t.status === "done").length;
    const projectProgress = Math.round((doneTasksCount / projTasks.length) * 100) || 0;

    return {
      tasks: state.tasks.map((t) => t.id === taskId ? { ...t, status: newStatus } : t),
      projects: state.projects.map((p) => p.id === task.projectId ? { ...p, progress: projectProgress } : p)
    };
  }),

  addTaskComment: (taskId, c) => set((state) => {
    const newComment: TaskComment = {
      ...c,
      id: `tc_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };
    
    const task = state.tasks.find((t) => t.id === taskId);
    if (task) {
      state.addProjectActivity(task.projectId, {
        type: "comment",
        user: c.user,
        content: `Commented on task '${task.name}': "${c.content.substring(0, 30)}..."`
      });
    }

    return {
      tasks: state.tasks.map((t) => t.id === taskId ? { ...t, comments: [...t.comments, newComment] } : t)
    };
  }),

  addTaskAttachment: (taskId, att) => set((state) => {
    const newAtt: TaskAttachment = {
      ...att,
      id: `ta_${Math.random().toString(36).substr(2, 9)}`
    };

    const task = state.tasks.find((t) => t.id === taskId);
    if (task) {
      state.addProjectActivity(task.projectId, {
        type: "file",
        user: task.assignee.name,
        content: `Attached file '${att.name}' to task '${task.name}'`
      });
    }

    return {
      tasks: state.tasks.map((t) => t.id === taskId ? { ...t, attachments: [...t.attachments, newAtt] } : t)
    };
  })
}));
