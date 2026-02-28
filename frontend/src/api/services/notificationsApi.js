/**
 * Notifications API - used by NotificationContext/NotificationBell only.
 */

import axiosInstance from '../axiosInstance';

export const notificationsApi = {
  getAll: (userId) =>
    axiosInstance.get('/notifications', {
      headers: { 'X-User-Id': userId },
    }),

  markAsRead: (id, userId) =>
    axiosInstance.post(`/notifications/${id}/read`, null, {
      headers: { 'X-User-Id': userId },
    }),
};
