'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'react-hot-toast';
import { NotificationPriority } from '@/types/notification';

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  unreadCount: number;
  joinNotifications: () => void;
  leaveNotifications: () => void;
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
  unreadCount: 0,
  joinNotifications: () => {},
  leaveNotifications: () => {},
});

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { token } = useAuthStore();

  useEffect(() => {
    if (!token) return;

    // Connect to WebSocket server
    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000', {
      auth: {
        token,
      },
      transports: ['websocket'],
    });

    socketInstance.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    // Listen for generic notification events
    socketInstance.on('notification:new', (data) => {
      console.log('New notification received:', data);
      
      // Update unread count
      if (data.unreadCount !== undefined) {
        setUnreadCount(data.unreadCount);
      }
      
      // Show toast notification based on priority
      const toastOptions = {
        duration: data.notification.priority === NotificationPriority.URGENT ? 10000 : 5000,
        position: 'top-right' as const,
      };
      
      if (data.notification.priority === NotificationPriority.URGENT) {
        toast.error(data.notification.title, toastOptions);
      } else if (data.notification.priority === NotificationPriority.HIGH) {
        toast(data.notification.title, { ...toastOptions, icon: '🔔' });
      } else {
        toast.success(data.notification.title, toastOptions);
      }

      // Play notification sound for high priority notifications
      if (data.notification.priority === NotificationPriority.HIGH || 
          data.notification.priority === NotificationPriority.URGENT) {
        try {
          const audio = new Audio('/sounds/notification.mp3');
          audio.play();
        } catch (err) {
          console.error('Error playing notification sound:', err);
        }
      }
    });
    
    // Keep legacy event for backward compatibility
    socketInstance.on('new-contact-message', (data) => {
      console.log('Legacy contact message event:', data);
      if (data.unreadCount !== undefined) {
        setUnreadCount(data.unreadCount);
      }
    });

    socketInstance.on('notification:updated', (data) => {
      console.log('Notification updated:', data);
      
      // Update unread count
      if (data.unreadCount !== undefined) {
        setUnreadCount(data.unreadCount);
      }
    });
    
    socketInstance.on('notification:bulk-update', (data) => {
      console.log('Bulk notification update:', data);
      
      // Update unread count
      if (data.unreadCount !== undefined) {
        setUnreadCount(data.unreadCount);
      }
    });
    
    socketInstance.on('notification:deleted', (data) => {
      console.log('Notification deleted:', data);
    });

    // Keep legacy events for backward compatibility
    socketInstance.on('contact-message-updated', (data) => {
      console.log('Legacy contact message updated:', data);
      if (data.unreadCount !== undefined) {
        setUnreadCount(data.unreadCount);
      }
    });

    socketInstance.on('notification-count-update', (data) => {
      console.log('Legacy notification count update:', data);
      if (data.unreadCount !== undefined) {
        setUnreadCount(data.unreadCount);
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [token]);

  // Fetch initial unread count
  useEffect(() => {
    if (!token) return;

    const fetchUnreadCount = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/admin/notifications/unread-count`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.count);
        }
      } catch (err) {
        console.error('Error fetching unread count:', err);
      }
    };

    fetchUnreadCount();
  }, [token]);

  const joinNotifications = useCallback(() => {
    if (socket) {
      socket.emit('join-notifications');
    }
  }, [socket]);

  const leaveNotifications = useCallback(() => {
    if (socket) {
      socket.emit('leave-notifications');
    }
  }, [socket]);

  return (
    <WebSocketContext.Provider
      value={{
        socket,
        isConnected,
        unreadCount,
        joinNotifications,
        leaveNotifications,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}