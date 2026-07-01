import axiosInstance from "@/lib/axios";
import { useWorkspaceStore, Project } from "@/store/workspaceStore";

export const projectService = {
  async getProjects(): Promise<Project[]> {
    await axiosInstance.get("/projects");
    return useWorkspaceStore.getState().projects;
  },

  async getProject(id: string): Promise<Project | undefined> {
    await axiosInstance.get(`/projects/${id}`);
    return useWorkspaceStore.getState().projects.find((p) => p.id === id);
  },

  async createProject(p: Omit<Project, "id" | "progress" | "activities">): Promise<Project> {
    await axiosInstance.post("/projects", p);
    useWorkspaceStore.getState().addProject(p);
    const projects = useWorkspaceStore.getState().projects;
    return projects[projects.length - 1];
  },

  async updateProject(id: string, updated: Partial<Project>): Promise<Project | undefined> {
    await axiosInstance.patch(`/projects/${id}`, updated);
    useWorkspaceStore.getState().updateProject(id, updated);
    return useWorkspaceStore.getState().projects.find((p) => p.id === id);
  },

  async deleteProject(id: string): Promise<boolean> {
    await axiosInstance.delete(`/projects/${id}`);
    useWorkspaceStore.getState().deleteProject(id);
    return true;
  }
};
