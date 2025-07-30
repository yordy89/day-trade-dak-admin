'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  IconButton,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Tooltip,
  Badge,
  Divider,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Message,
  PersonAdd,
  Payment,
  Warning,
  VideoCall,
  School,
  CardMembership,
  Delete,
  DoneAll,
  CheckCircle,
  FilterList,
  Refresh,
} from '@mui/icons-material';
import { notificationService } from '@/services/notification.service';
import { 
  INotification, 
  NotificationType, 
  NotificationStatus,
  NotificationPriority 
} from '@/types/notification';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/layout/admin-layout';

const iconMap = {
  message: Message,
  'person-add': PersonAdd,
  payment: Payment,
  warning: Warning,
  'video-call': VideoCall,
  school: School,
  'card-membership': CardMembership,
};

function NotificationsPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<NotificationStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<NotificationType | ''>('');

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;
      
      const response = await notificationService.getNotifications(params);
      setNotifications(response.notifications);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, typeFilter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleNotificationClick = async (notification: INotification) => {
    try {
      // Mark as read if unread
      if (notification.status === NotificationStatus.UNREAD) {
        await notificationService.markAsRead(notification._id);
        setNotifications(prev =>
          prev.map(n =>
            n._id === notification._id
              ? { ...n, status: NotificationStatus.READ, readAt: new Date().toISOString() }
              : n
          )
        );
      }

      // Navigate to action URL if available
      if (notification.actionUrl) {
        router.push(notification.actionUrl);
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev =>
        prev.map(n => ({
          ...n,
          status: NotificationStatus.READ,
          readAt: new Date().toISOString(),
        }))
      );
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark notifications as read');
    }
  };

  const getNotificationIcon = (notification: INotification) => {
    const IconComponent = notification.icon ? iconMap[notification.icon as keyof typeof iconMap] : NotificationsIcon;
    return IconComponent || NotificationsIcon;
  };

  const getLocale = () => {
    return i18n.language === 'es' ? es : enUS;
  };

  const getTypeLabel = (type: NotificationType): string => {
    const labels: Record<NotificationType, string> = {
      [NotificationType.CONTACT_MESSAGE]: t('notifications.types.contact', 'Contact Message'),
      [NotificationType.USER_REGISTRATION]: t('notifications.types.registration', 'User Registration'),
      [NotificationType.PAYMENT_RECEIVED]: t('notifications.types.payment', 'Payment Received'),
      [NotificationType.SYSTEM_ALERT]: t('notifications.types.system', 'System Alert'),
      [NotificationType.MEETING_REMINDER]: t('notifications.types.meeting', 'Meeting Reminder'),
      [NotificationType.COURSE_ENROLLMENT]: t('notifications.types.course', 'Course Enrollment'),
      [NotificationType.SUBSCRIPTION_UPDATE]: t('notifications.types.subscription', 'Subscription Update'),
    };
    return labels[type] || type;
  };

  const hasUnreadNotifications = notifications.some(n => n.status === NotificationStatus.UNREAD);

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NotificationsIcon />
                {t('notifications.title', 'Notifications')}
              </Typography>
              <Stack direction="row" spacing={1}>
                {hasUnreadNotifications && (
                  <Button
                    variant="outlined"
                    startIcon={<DoneAll />}
                    onClick={handleMarkAllAsRead}
                  >
                    {t('notifications.markAllRead', 'Mark all read')}
                  </Button>
                )}
                <IconButton onClick={fetchNotifications} title="Refresh">
                  <Refresh />
                </IconButton>
              </Stack>
            </Box>

            <Stack direction="row" spacing={2}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>{t('notifications.filterByStatus', 'Status')}</InputLabel>
                <Select
                  value={statusFilter}
                  label={t('notifications.filterByStatus', 'Status')}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as NotificationStatus | '');
                    setPage(1);
                  }}
                >
                  <MenuItem value="">{t('common.all', 'All')}</MenuItem>
                  <MenuItem value={NotificationStatus.UNREAD}>{t('notifications.unread', 'Unread')}</MenuItem>
                  <MenuItem value={NotificationStatus.READ}>{t('notifications.read', 'Read')}</MenuItem>
                  <MenuItem value={NotificationStatus.ARCHIVED}>{t('notifications.archived', 'Archived')}</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>{t('notifications.filterByType', 'Type')}</InputLabel>
                <Select
                  value={typeFilter}
                  label={t('notifications.filterByType', 'Type')}
                  onChange={(e) => {
                    setTypeFilter(e.target.value as NotificationType | '');
                    setPage(1);
                  }}
                >
                  <MenuItem value="">{t('common.all', 'All')}</MenuItem>
                  {Object.values(NotificationType).map(type => (
                    <MenuItem key={type} value={type}>
                      {getTypeLabel(type)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : notifications.length === 0 ? (
            <Alert severity="info">
              {t('notifications.empty', 'No notifications')}
            </Alert>
          ) : (
            <>
              <List>
                {notifications.map((notification) => {
                  const Icon = getNotificationIcon(notification);
                  const isUnread = notification.status === NotificationStatus.UNREAD;

                  return (
                    <ListItem
                      key={notification._id}
                      disablePadding
                      sx={{
                        mb: 1,
                        bgcolor: isUnread ? 'action.hover' : 'background.paper',
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                      }}
                      secondaryAction={
                        <Tooltip title={t('actions.delete', 'Delete')}>
                          <IconButton
                            edge="end"
                            onClick={(e) => handleDelete(e, notification._id)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      }
                    >
                      <ListItemButton
                        onClick={() => handleNotificationClick(notification)}
                        sx={{ py: 2 }}
                      >
                        <ListItemIcon>
                          <Badge
                            color={notificationService.getNotificationColor(notification.priority)}
                            variant="dot"
                            invisible={!isUnread}
                          >
                            <Icon />
                          </Badge>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1" fontWeight={isUnread ? 600 : 400}>
                                {notification.title}
                              </Typography>
                              <Chip
                                label={getTypeLabel(notification.type)}
                                size="small"
                                variant="outlined"
                              />
                              {isUnread && (
                                <Chip
                                  label={t('notifications.new', 'New')}
                                  size="small"
                                  color="primary"
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                {notification.message}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDistanceToNow(new Date(notification.createdAt), {
                                  addSuffix: true,
                                  locale: getLocale(),
                                })}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>

              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default function NotificationsPageWrapper() {
  return (
    <AdminLayout>
      <NotificationsPage />
    </AdminLayout>
  );
}