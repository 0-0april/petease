<<<<<<< HEAD
import api from './api';

export const notificationService = {
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  markAsRead: async (notificationId) => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  }
};
=======
import { mockNotifications } from '../data/mockData';

let notifications = [...mockNotifications];

export const notificationService = {
  getNotifications: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return notifications.filter(n => n.userId === user.id);
  },

  markAsRead: async (notificationId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = notifications.findIndex(n => n.id === parseInt(notificationId));
    if (index !== -1) {
      notifications[index].isRead = true;
      return notifications[index];
    }
    throw new Error('Notification not found');
  }
};
>>>>>>> 8555e327320ce828f5dfb4efd072c21355eac3c7
