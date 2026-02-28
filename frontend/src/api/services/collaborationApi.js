/**
 * Collaboration API - used by Collaboration page only.
 */

import axiosInstance from '../axiosInstance';

export const collaborationApi = {
  getAll: () => axiosInstance.get('/collaboration'),
};
