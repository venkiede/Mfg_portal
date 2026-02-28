/**
 * Project Tracking API - used by ProjectTracking page only.
 */

import axiosInstance from '../axiosInstance';

export const projectTrackingApi = {
  getAll: () => axiosInstance.get('/project-tracking'),
};
