/**
 * Centralized Data Service Layer
 * Supports both "backend" (FastAPI via axios) and "local" (localStorage + JSON) modes.
 * Uses api/ layer for backend mode - single axios instance, proper baseURL.
 */

import {
  projectsApi,
  projectTrackingApi,
  productionApi,
  supplyChainApi,
  afterSalesApi,
  collaborationApi,
  qualityApi,
} from '../api';
import axiosInstance from '../api/axiosInstance';

// Import static JSON data as fallbacks/initial state for Local Mode
import projectsDefault from '../data/projects.json';
import projectTrackingDefault from '../data/project_tracking.json';
import productionDefault from '../data/production_visibility.json';
import qualityDefault from '../data/quality_management.json';
import supplyChainDefault from '../data/supply_chain.json';
import afterSalesDefault from '../data/after_sales.json';
import collaborationDefault from '../data/collaboration.json';
import usersDefault from '../data/admin_users.json';
import logsDefault from '../data/admin_logs.json';
import approvalsDefault from '../data/admin_approvals.json';

const MODE = process.env.REACT_APP_DATA_MODE || 'backend';

// Utility for localStorage
const storage = {
  get: (key, fallback) => {
    const val = localStorage.getItem(`mfg_${key}`);
    return val ? JSON.parse(val) : fallback;
  },
  set: (key, val) => {
    localStorage.setItem(`mfg_${key}`, JSON.stringify(val));
  },
};

// Initialize LocalStorage with JSON defaults if empty
const initLocalData = () => {
  if (MODE !== 'local') return;
  if (!localStorage.getItem('mfg_init')) {
    storage.set('projects', projectsDefault);
    storage.set('project_tracking', projectTrackingDefault);
    storage.set('production', productionDefault);
    storage.set('quality', qualityDefault);
    storage.set('supply_chain', supplyChainDefault);
    storage.set('after_sales', afterSalesDefault);
    storage.set('collaboration', collaborationDefault);
    storage.set('users', usersDefault);
    storage.set('logs', logsDefault);
    storage.set('approvals', approvalsDefault);
    localStorage.setItem('mfg_init', 'true');
    console.log('Local Mode Initialized with JSON defaults');
  }
};

initLocalData();

// Helper: extract data from axios response, throw on error
const apiData = (promise) => promise.then((res) => res.data);

const dataService = {
  // ─── Projects ───────────────────────────────────────────────────────────
  getProjects: async (userId) => {
    if (MODE === 'backend') {
      return apiData(projectsApi.getAll(userId));
    }
    return storage.get('projects', []);
  },

  addProject: async (project, userId) => {
    if (MODE === 'backend') {
      return apiData(projectsApi.create(project, userId));
    }
    const projects = storage.get('projects', []);
    const newProject = { ...project, id: Date.now(), created_at: new Date().toISOString() };
    projects.push(newProject);
    storage.set('projects', projects);
    return newProject;
  },

  updateProject: async (id, project, userId) => {
    if (MODE === 'backend') {
      return apiData(projectsApi.update(id, project, userId));
    }
    const projects = storage.get('projects', []);
    const idx = projects.findIndex((p) => String(p.id) === String(id));
    if (idx === -1) throw new Error('Project not found');
    projects[idx] = { ...projects[idx], ...project, updated_at: new Date().toISOString() };
    storage.set('projects', projects);
    return projects[idx];
  },

  deleteProject: async (id, userId) => {
    if (MODE === 'backend') {
      return apiData(projectsApi.delete(id, userId));
    }
    const projects = storage.get('projects', []);
    storage.set('projects', projects.filter((p) => String(p.id) !== String(id)));
    return { message: 'Deleted successfully' };
  },

  getProjectById: async (id, userId) => {
    if (MODE === 'backend') {
      return apiData(projectsApi.getById(id, userId));
    }
    const projects = storage.get('projects', []);
    return projects.find((p) => String(p.id) === String(id)) || null;
  },

  // ─── Module Data (each page calls only its own) ────────────────────────────

  getProjectTracking: async () => {
    if (MODE === 'backend') {
      return apiData(projectTrackingApi.getAll());
    }
    return storage.get('project_tracking', []);
  },

  getProductionVisibility: async () => {
    if (MODE === 'backend') {
      return apiData(productionApi.getAll());
    }
    return storage.get('production', []);
  },

  getCompliance: async () => {
    if (MODE === 'backend') {
      return apiData(qualityApi.getAll());
    }
    return storage.get('quality', []);
  },

  getQualityManagement: async () => {
    return dataService.getCompliance();
  },

  getSupplyChain: async () => {
    if (MODE === 'backend') {
      return apiData(supplyChainApi.getAll());
    }
    return storage.get('supply_chain', []);
  },

  getAfterSales: async () => {
    if (MODE === 'backend') {
      return apiData(afterSalesApi.getAll());
    }
    return storage.get('after_sales', []);
  },

  getCollaboration: async () => {
    if (MODE === 'backend') {
      return apiData(collaborationApi.getAll());
    }
    return storage.get('collaboration', []);
  },

  // ─── Admin ──────────────────────────────────────────────────────────────────

  getUsers: async (role) => {
    if (MODE === 'backend') {
      const res = await axiosInstance.get('/admin/users', {
        headers: { 'X-User-Role': role },
      });
      return res.data;
    }
    return storage.get('users', []);
  },

  updateUser: async (id, payload, role) => {
    if (MODE === 'backend') {
      const res = await axiosInstance.patch(`/admin/users/${id}`, payload, {
        headers: { 'X-User-Role': role },
      });
      return res.data;
    }
    const users = storage.get('users', []);
    const idx = users.findIndex((u) => String(u.id) === String(id));
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...payload };
      storage.set('users', users);
    }
    return payload;
  },

  getSystemLogs: async (role) => {
    if (MODE === 'backend') {
      const res = await axiosInstance.get('/admin/logs', {
        headers: { 'X-User-Role': role },
      });
      return res.data;
    }
    return storage.get('logs', []);
  },

  getApprovals: async (role) => {
    if (MODE === 'backend') {
      const res = await axiosInstance.get('/admin/approvals', {
        headers: { 'X-User-Role': role },
      });
      return res.data;
    }
    return storage.get('approvals', []);
  },

  updateApproval: async (id, payload, role) => {
    if (MODE === 'backend') {
      const res = await axiosInstance.patch(`/admin/approvals/${id}`, payload, {
        headers: { 'X-User-Role': role },
      });
      return res.data;
    }
    const approvals = storage.get('approvals', []);
    const idx = approvals.findIndex((a) => String(a.id) === String(id));
    if (idx !== -1) {
      approvals[idx] = {
        ...approvals[idx],
        ...payload,
        reviewed_at: new Date().toISOString(),
      };
      storage.set('approvals', approvals);
    }
    return payload;
  },

  downloadProjectBundle: async (projectId, userId) => {
    if (MODE === 'backend') {
      let res;
      try {
        res = await axiosInstance.get(`/download/project/${projectId}`, {
          headers: { 'X-User-Id': userId },
          responseType: 'blob',
        });
      } catch (err) {
        if (err.response?.data instanceof Blob) {
          try {
            const text = await err.response.data.text();
            const parsed = JSON.parse(text);
            throw new Error(parsed.detail || err.message);
          } catch (parseErr) {
            throw new Error(err.message || 'Download failed');
          }
        }
        throw err;
      }
      const blob = res.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `project_${projectId}_bundle.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else {
      alert('Download only available in Backend mode');
    }
  },

  downloadComplianceBundle: async (userId) => {
    if (MODE === 'backend') {
      let res;
      try {
        res = await axiosInstance.get('/download/compliance', {
          headers: { 'X-User-Id': userId },
          responseType: 'blob',
        });
      } catch (err) {
        if (err.response?.data instanceof Blob) {
          try {
            const text = await err.response.data.text();
            const parsed = JSON.parse(text);
            throw new Error(parsed.detail || err.message);
          } catch (_) {
            throw new Error(err.message || 'Download failed');
          }
        }
        throw err;
      }
      const blob = res.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'compliance_bundle.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else {
      alert('Download only available in Backend mode');
    }
  },

  addProjectTracking: async (project) => {
    const records = storage.get('project_tracking', []);
    const newRecord = { ...project };
    records.unshift(newRecord);
    storage.set('project_tracking', records);
    return newRecord;
  },
};

export default dataService;
