import axiosInstance from "@/lib/axios";
import { useChatStore, Conversation } from "@/store/chatStore";

export const chatService = {
  async getConversations(): Promise<Conversation[]> {
    await axiosInstance.get("/chat/conversations");
    return useChatStore.getState().conversations;
  },

  async startConversation(model?: string): Promise<string> {
    await axiosInstance.post("/chat/conversations", { model });
    return useChatStore.getState().startNewConversation(model);
  },

  async deleteConversation(id: string): Promise<boolean> {
    await axiosInstance.delete(`/chat/conversations/${id}`);
    useChatStore.getState().deleteConversation(id);
    return true;
  },

  async updateConversationSettings(id: string, model: string, temperature: number): Promise<boolean> {
    await axiosInstance.patch(`/chat/conversations/${id}`, { model, temperature });
    useChatStore.getState().updateConversationSettings(id, { model, temperature });
    return true;
  }
};
