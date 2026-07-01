import axiosInstance from "@/lib/axios";
import { useAuthStore,UserProfile } from "@/store/authStore";

export const authService = {
  async login(email: string, password?: string) {
    const response = await axiosInstance.post("/auth/login", { email, password });
    const { token, id, name, email: responseEmail, role } = response.data;
    const userProfile: UserProfile = {
      id: String(id),
      name: name,
      email: responseEmail,
      role: role ? (role.toLowerCase() as "admin" | "member" | "viewer") : "member",
      skills: [],
      socialLinks: {},
      apiKeys: [],
      sessions: []
    };
    const store = useAuthStore.getState();
    store.login(token, userProfile);
    return userProfile;
  },

  async register(name: string, email: string, password?: string) {
    const response = await axiosInstance.post("/auth/register", { name, email, password });
    const { token, id, name: responseName, email: responseEmail, role } = response.data;
    const userProfile: UserProfile = {
      id: String(id),
      name: responseName,
      email: responseEmail,
      role: role ? (role.toLowerCase() as "admin" | "member" | "viewer") : "member",
      skills: [],
      socialLinks: {},
      apiKeys: [],
      sessions: []
    };
    const store = useAuthStore.getState();
    store.register(token, userProfile);
    return userProfile;
  },
  async logout() {
    // Optional: notify the backend if you track session tokens there
    // await axiosInstance.post("/auth/logout");
    useAuthStore.getState().logout();
  },

  async verifyEmail(email: string, code: string) {
    await axiosInstance.post("/auth/verify-email", { email, code });
    return { success: true, message: "Email verification successful." };
  },

  async forgotPassword(email: string) {
    await axiosInstance.post("/auth/forgot-password", { email });
    return { success: true, message: "Reset link has been dispatched to your email." };
  },

  async resetPassword(token: string, password: string) {
    await axiosInstance.post("/auth/reset-password", { token, password });
    return { success: true, message: "Password updated successfully." };
  },

  async changePassword(currentPassword: string, newPassword: string) {
    await axiosInstance.post("/auth/change-password", { currentPassword, newPassword });
    return { success: true, message: "Password changed successfully." };
  }
};
