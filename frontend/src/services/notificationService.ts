import axiosInstance from "@/lib/axios";
import { useNotificationStore, Notification } from "@/store/notificationStore";

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    await axiosInstance.get("/notifications");
    return useNotificationStore.getState().notifications;
  },

  async markAsRead(id: string): Promise<boolean> {
    await axiosInstance.patch(`/notifications/${id}/read`);
    useNotificationStore.getState().markAsRead(id);
    return true;
  },

  async markAllAsRead(): Promise<boolean> {
    await axiosInstance.patch("/notifications/read-all");
    useNotificationStore.getState().markAllAsRead();
    return true;
  },

  async deleteNotification(id: string): Promise<boolean> {
    await axiosInstance.delete(`/notifications/${id}`);
    useNotificationStore.getState().deleteNotification(id);
    return true;
  }
};
