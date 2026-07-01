import axiosInstance from "@/lib/axios";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useChatStore } from "@/store/chatStore";
import { fileService } from "./fileService";

export interface SearchResult {
  type: "project" | "task" | "chat" | "file";
  id: string;
  title: string;
  subtitle: string;
  url: string;
}

export const searchService = {
  async search(query: string): Promise<SearchResult[]> {
    if (!query) return [];
    await axiosInstance.get("/search", { params: { q: query } });
    
    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    // 1. Search projects
    const projects = useWorkspaceStore.getState().projects;
    projects.forEach((p) => {
      if (p.name.toLowerCase().includes(lowerQuery) || p.description.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: "project",
          id: p.id,
          title: p.name,
          subtitle: p.description.substring(0, 60) + (p.description.length > 60 ? "..." : ""),
          url: `/projects/${p.id}`
        });
      }
    });

    // 2. Search tasks
    const tasks = useWorkspaceStore.getState().tasks;
    tasks.forEach((t) => {
      if (t.name.toLowerCase().includes(lowerQuery) || t.description.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: "task",
          id: t.id,
          title: t.name,
          subtitle: `Task in Project ${t.projectId} (${t.priority.toUpperCase()})`,
          url: `/tasks`
        });
      }
    });

    // 3. Search chats
    const chats = useChatStore.getState().conversations;
    chats.forEach((c) => {
      if (c.title.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: "chat",
          id: c.id,
          title: c.title,
          subtitle: `AI Chat using ${c.model}`,
          url: `/chat`
        });
      }
    });

    // 4. Search files (static fetch since it is in services)
    const files = await fileService.getFiles("all");
    files.forEach((f) => {
      if (f.name.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: "file",
          id: f.id,
          title: f.name,
          subtitle: `${f.type} - ${f.size}`,
          url: `/documents`
        });
      }
    });

    return results;
  }
};
