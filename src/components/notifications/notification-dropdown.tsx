'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import {
  IconButton,
  Badge,
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  Notifications,
  Message,
  PersonAdd,
  Payment,
  Warning,
  VideoCall,
  School,
  CardMembership,
  CheckCircle,
  MoreVert,
  DoneAll,
} from '@mui/icons-material';
import { notificationService } from '@/services/notification.service';
import { INotification, NotificationType, NotificationStatus } from '@/types/notification';
import { useWebSocket } from '@/contexts/websocket-context';
import { toast } from 'react-hot-toast';

const iconMap = {
  message: Message,
  'person-add': PersonAdd,
  payment: Payment,
  warning: Warning,
  'video-call': VideoCall,
  school: School,
  'card-membership': CardMembership,
};

export function NotificationDropdown() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { unreadCount } = useWebSocket();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    if (!notifications.length) {
      fetchNotifications();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const fetchNotifications = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications({
        page: pageNum,
        limit: 10,
      });
      
      if (pageNum === 1) {
        setNotifications(response.notifications);
      } else {
        setNotifications(prev => [...prev, ...response.notifications]);
      }
      
      setHasMore(pageNum < response.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

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
        handleClose();
        router.push(notification.actionUrl);
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
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

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    if (scrollHeight - scrollTop === clientHeight && hasMore && !loading) {
      fetchNotifications(page + 1);
    }
  };

  const getNotificationIcon = (notification: INotification) => {
    const IconComponent = notification.icon ? iconMap[notification.icon as keyof typeof iconMap] : Notifications;
    return IconComponent || Notifications;
  };

  const getLocale = () => {
    return i18n.language === 'es' ? es : enUS;
  };

  return (
    <>
      <Tooltip title={`${t('navigation.notifications', 'Notifications')} ${unreadCount > 0 ? `(${unreadCount})` : ''}`}>
        <IconButton 
          onClick={handleClick}
          sx={{ color: 'action.active' }}
        >
          <Badge badgeContent={unreadCount} color="error">
            <Notifications />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 600,
            overflow: 'hidden',
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              {t('notifications.title', 'Notifications')}
            </Typography>
            {unreadCount > 0 && (
              <Button
                size="small"
                startIcon={<DoneAll />}
                onClick={handleMarkAllAsRead}
              >
                {t('notifications.markAllRead', 'Mark all read')}
              </Button>
            )}
          </Box>
        </Box>

        <Box
          ref={listRef}
          sx={{
            height: 400,
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
          onScroll={handleScroll}
        >
          {loading && notifications.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {t('notifications.empty', 'No notifications')}
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.map((notification) => {
                const Icon = getNotificationIcon(notification);
                const isUnread = notification.status === NotificationStatus.UNREAD;

                return (
                  <ListItem
                    key={notification._id}
                    disablePadding
                    sx={{
                      bgcolor: isUnread ? 'action.hover' : 'transparent',
                      borderBottom: 1,
                      borderColor: 'divider',
                    }}
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
                            <Typography variant="body2" fontWeight={isUnread ? 600 : 400}>
                              {notification.title}
                            </Typography>
                            {isUnread && (
                              <Chip
                                label={t('notifications.new', 'New')}
                                size="small"
                                color="primary"
                                sx={{ height: 20 }}
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
              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress size={20} />
                </Box>
              )}
            </List>
          )}
        </Box>

        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button
            fullWidth
            onClick={() => {
              handleClose();
              router.push('/notifications');
            }}
          >
            {t('notifications.viewAll', 'View all notifications')}
          </Button>
        </Box>
      </Popover>
    </>
  );
}