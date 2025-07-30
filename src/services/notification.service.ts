import apiClient from '@/lib/api-client';
import { 
  INotification, 
  NotificationResponse, 
  NotificationType, 
  NotificationStatus 
} from '@/types/notification';

class NotificationService {
  async getNotifications(params?: {
    type?: NotificationType;
    status?: NotificationStatus;
    page?: number;
    limit?: number;
  }): Promise<NotificationResponse> {
    const response = await apiClient.get('/admin/notifications', { params });
    return response.data;
  }

  async getNotification(id: string): Promise<INotification> {
    const response = await apiClient.get(`/admin/notifications/${id}`);
    return response.data;
  }

  async markAsRead(id: string): Promise<INotification> {
    const response = await apiClient.patch(`/admin/notifications/${id}/read`);
    return response.data;
  }

  async markAllAsRead(): Promise<void> {
    await apiClient.patch('/admin/notifications/mark-all-read');
  }

  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete(`/admin/notifications/${id}`);
  }

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get('/admin/notifications/unread-count');
    return response.data.count;
  }

  // Helper method to get notification icon based on type
  getNotificationIcon(type: NotificationType): string {
    const iconMap: Record<NotificationType, string> = {
      [NotificationType.CONTACT_MESSAGE]: 'message',
      [NotificationType.USER_REGISTRATION]: 'person-add',
      [NotificationType.PAYMENT_RECEIVED]: 'payment',
      [NotificationType.SYSTEM_ALERT]: 'warning',
      [NotificationType.MEETING_REMINDER]: 'video-call',
      [NotificationType.COURSE_ENROLLMENT]: 'school',
      [NotificationType.SUBSCRIPTION_UPDATE]: 'card-membership',
    };
    return iconMap[type] || 'notifications';
  }

  // Helper method to get notification color based on priority
  getNotificationColor(priority: string): 'default' | 'primary' | 'warning' | 'error' {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'primary';
      default:
        return 'default';
    }
  }
}

export const notificationService = new NotificationService();