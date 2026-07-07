import axios from "axios";
import axiosInstance from "@/lib/axios";
import { useAuthStore, UserProfile } from "@/store/authStore";

const USER_SERVICE_URL = "http://localhost:8082/api/v1";

const userApi = axios.create({
  baseURL: USER_SERVICE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to attach JWT token
userApi.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const userService = {
  async getProfile(): Promise<UserProfile | null> {
    const response = await userApi.get("/users/me");
    const data = response.data;
    const mapped: Partial<UserProfile> = {
      id: data.id?.toString(),
      name: data.name,
      email: data.email,
      role: (data.role?.toLowerCase() || "member") as any,
      avatar: data.avatarUrl || "",
      bio: data.bio || "",
      socialLinks: {
        github: data.githubUrl || "",
        twitter: data.twitterUrl || "",
        linkedin: data.linkedinUrl || "",
      }
    };
    useAuthStore.getState().updateProfile(mapped);
    return useAuthStore.getState().user;
  },

  async updateProfile(data: Partial<UserProfile & { bio?: string }>): Promise<UserProfile | null> {
    const payload = {
      name: data.name,
      bio: data.bio,
      avatarUrl: data.avatar,
      githubUrl: data.socialLinks?.github,
      twitterUrl: data.socialLinks?.twitter,
      linkedinUrl: data.socialLinks?.linkedin,
    };
    const response = await userApi.put("/users/profile", payload);
    const updated = response.data;
    const mapped: Partial<UserProfile> = {
      name: updated.name,
      avatar: updated.avatarUrl || "",
      bio: updated.bio || "",
      socialLinks: {
        github: updated.githubUrl || "",
        twitter: updated.twitterUrl || "",
        linkedin: updated.linkedinUrl || "",
      }
    };
    useAuthStore.getState().updateProfile(mapped);
    return useAuthStore.getState().user;
  },

  async searchUsers(query: string): Promise<any[]> {
    const response = await userApi.get(`/users/search?query=${encodeURIComponent(query)}`);
    return response.data;
  },

  async getUserById(id: string): Promise<any> {
    const response = await userApi.get(`/users/${id}`);
    return response.data;
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

