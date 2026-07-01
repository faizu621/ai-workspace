import axiosInstance from "@/lib/axios";
import { useAuthStore, UserProfile } from "@/store/authStore";

export const userService = {
  async getProfile(): Promise<UserProfile | null> {
    await axiosInstance.get("/users/profile");
    return useAuthStore.getState().user;
  },

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile | null> {
    await axiosInstance.patch("/users/profile", data);
    useAuthStore.getState().updateProfile(data);
    return useAuthStore.getState().user;
  },

  async generateApiKey(name: string): Promise<string> {
    await axiosInstance.post("/users/keys", { name });
    useAuthStore.getState().generateApiKey(name);
    const keys = useAuthStore.getState().user?.apiKeys || [];
    return keys[keys.length - 1]?.key || "";
  },

  async revokeApiKey(id: string): Promise<boolean> {
    await axiosInstance.delete(`/users/keys/${id}`);
    useAuthStore.getState().revokeApiKey(id);
    return true;
  }
};
