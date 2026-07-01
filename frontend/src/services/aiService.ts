import axiosInstance from "@/lib/axios";
import { useChatStore, ChatFile } from "@/store/chatStore";

export const aiService = {
  async sendMessage(content: string, files?: ChatFile[]): Promise<void> {
    // Send request simulation to Mock API
    await axiosInstance.post("/ai/chat", { message: content, files });
    // Triggers response streaming inside ChatStore
    await useChatStore.getState().sendMessage(content, files);
  },

  stopGeneration() {
    useChatStore.getState().stopGeneration();
  },

  async regenerateMessage(messageId: string): Promise<void> {
    await axiosInstance.post(`/ai/chat/regenerate`, { messageId });
    await useChatStore.getState().regenerateMessage(messageId);
  }
};
