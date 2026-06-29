import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getSocket } from '../services/socket';
import API from '../services/api';
import { useAuth } from './AuthContext';

const NotifContext = createContext();

export const NotifProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [waterStatus, setWaterStatus] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    fetchUnreadCount();
    fetchWaterStatus();

    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on('new_notification', (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((c) => c + 1);
      const icons = { water_start: '💧', water_stop: '🚫', emergency: '🚨', announcement: '📢' };
      toast.info(`${icons[notif.type] || '🔔'} ${notif.title}`, { position: 'top-right', autoClose: 4000 });
    });

    socket.on('water_status_update', ({ status }) => setWaterStatus(status));

    socket.on('emergency_alert', (alert) => {
      toast.error(`🚨 ${alert.title}`, { autoClose: false, position: 'top-center' });
    });

    socket.on('online_users', (users) => setOnlineUsers(users));

    return () => {
      socket.off('new_notification');
      socket.off('water_status_update');
      socket.off('emergency_alert');
      socket.off('online_users');
    };
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get('/notifications');
      setNotifications(data.notifications);
    } catch {}
  };

  const fetchUnreadCount = async () => {
    try {
      const { data } = await API.get('/notifications/unread-count');
      setUnreadCount(data.count);
    } catch {}
  };

  const fetchWaterStatus = async () => {
    try {
      const { data } = await API.get('/water/status');
      setWaterStatus(data.status);
    } catch {}
  };

  const markRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await API.put('/notifications/mark-all-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {}
  };

  return (
    <NotifContext.Provider value={{
      notifications, unreadCount, waterStatus, onlineUsers,
      setWaterStatus, markRead, markAllRead, fetchNotifications,
    }}>
      {children}
    </NotifContext.Provider>
  );
};

export const useNotif = () => useContext(NotifContext);
