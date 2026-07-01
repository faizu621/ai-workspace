import axiosInstance from "@/lib/axios";
import { useWorkspaceStore, Task, TaskComment, TaskAttachment } from "@/store/workspaceStore";

export const taskService = {
  async getTasks(projectId?: string): Promise<Task[]> {
    await axiosInstance.get("/tasks", { params: { projectId } });
    const tasks = useWorkspaceStore.getState().tasks;
    if (projectId) {
      return tasks.filter((t) => t.projectId === projectId);
    }
    return tasks;
  },

  async getTask(id: string): Promise<Task | undefined> {
    await axiosInstance.get(`/tasks/${id}`);
    return useWorkspaceStore.getState().tasks.find((t) => t.id === id);
  },

  async createTask(t: Omit<Task, "id" | "comments" | "attachments">): Promise<Task> {
    await axiosInstance.post("/tasks", t);
    useWorkspaceStore.getState().addTask(t);
    const tasks = useWorkspaceStore.getState().tasks;
    return tasks[tasks.length - 1];
  },

  async updateTask(id: string, updated: Partial<Task>): Promise<Task | undefined> {
    await axiosInstance.patch(`/tasks/${id}`, updated);
    useWorkspaceStore.getState().updateTask(id, updated);
    return useWorkspaceStore.getState().tasks.find((t) => t.id === id);
  },

  async moveTask(taskId: string, newStatus: Task["status"]): Promise<boolean> {
    await axiosInstance.patch(`/tasks/${taskId}/status`, { status: newStatus });
    useWorkspaceStore.getState().moveTask(taskId, newStatus);
    return true;
  },

  async deleteTask(id: string): Promise<boolean> {
    await axiosInstance.delete(`/tasks/${id}`);
    useWorkspaceStore.getState().deleteTask(id);
    return true;
  },

  async addComment(taskId: string, comment: Omit<TaskComment, "id" | "timestamp">): Promise<TaskComment> {
    await axiosInstance.post(`/tasks/${taskId}/comments`, comment);
    useWorkspaceStore.getState().addTaskComment(taskId, comment);
    const task = useWorkspaceStore.getState().tasks.find((t) => t.id === taskId);
    const comments = task?.comments || [];
    return comments[comments.length - 1];
  },

  async addAttachment(taskId: string, attachment: Omit<TaskAttachment, "id">): Promise<TaskAttachment> {
    await axiosInstance.post(`/tasks/${taskId}/attachments`, attachment);
    useWorkspaceStore.getState().addTaskAttachment(taskId, attachment);
    const task = useWorkspaceStore.getState().tasks.find((t) => t.id === taskId);
    const attachments = task?.attachments || [];
    return attachments[attachments.length - 1];
  }
};
