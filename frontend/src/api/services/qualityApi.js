/**
 * Quality/Compliance API - used by QualityManagement and Compliance pages only.
 */

import axiosInstance from '../axiosInstance';

export const qualityApi = {
  getAll: () => axiosInstance.get('/quality'),
};
