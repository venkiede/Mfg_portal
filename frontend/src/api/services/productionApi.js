/**
 * Production API - used by ProductionVisibility page only.
 */

import axiosInstance from '../axiosInstance';

export const productionApi = {
  getAll: () => axiosInstance.get('/production'),
};
