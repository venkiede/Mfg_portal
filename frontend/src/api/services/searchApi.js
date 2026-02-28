/**
 * Search API - used by GlobalSearch component only.
 */

import axiosInstance from '../axiosInstance';

export const searchApi = {
  search: (query, userId) =>
    axiosInstance.get('/search', {
      params: { q: query },
      headers: { 'X-User-Id': userId },
    }),
};
