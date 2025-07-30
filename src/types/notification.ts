export enum NotificationType {
  CONTACT_MESSAGE = 'contact_message',
  USER_REGISTRATION = 'user_registration',
  PAYMENT_RECEIVED = 'payment_received',
  SYSTEM_ALERT = 'system_alert',
  MEETING_REMINDER = 'meeting_reminder',
  COURSE_ENROLLMENT = 'course_enrollment',
  SUBSCRIPTION_UPDATE = 'subscription_update',
}

export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
  ARCHIVED = 'archived',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface INotification {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  status: NotificationStatus;
  priority: NotificationPriority;
  actionUrl?: string;
  icon?: string;
  recipient?: string;
  readAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  notifications: INotification[];
  total: number;
  page: number;
  totalPages: number;
}