/**
 * Projects API - used by Projects, ProjectDetail, Dashboard pages only.
 */

import axiosInstance from '../axiosInstance';

export const projectsApi = {
  getAll: (userId) =>
    axiosInstance.get('/projects', {
      headers: { 'X-User-Id': userId },
    }),

  getById: (id, userId) =>
    axiosInstance.get(`/projects/${id}`, {
      headers: { 'X-User-Id': userId },
    }),

  create: (project, userId) =>
    axiosInstance.post('/projects', project, {
      headers: { 'X-User-Id': userId },
    }),

  update: (id, project, userId) =>
    axiosInstance.put(`/projects/${id}`, project, {
      headers: { 'X-User-Id': userId },
    }),

  delete: (id, userId) =>
    axiosInstance.delete(`/projects/${id}`, {
      headers: { 'X-User-Id': userId },
    }),
};
