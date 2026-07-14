import api from './api';
import { mockUsers, mockUserReports, mockAnnouncements, mockSystemAnnouncements } from '../data/mockData';

let users = [...mockUsers];
let reports = [...mockUserReports];
let announcements = [...mockAnnouncements];
let systemAnnouncements = [...mockSystemAnnouncements];

export const adminService = {
  // User Management
  getAllUsers: async (page = 1, limit = 10, filters = {}) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    let filteredUsers = [...users];

    if (filters.role && filters.role !== 'all') {
      filteredUsers = filteredUsers.filter(u => u.role === filters.role);
    }

    if (filters.status && filters.status !== 'all') {
      filteredUsers = filteredUsers.filter(u => u.status === filters.status);
    }

    if (filters.sortBy === 'lastLogin') {
      filteredUsers.sort((a, b) => new Date(b.lastLogin) - new Date(a.lastLogin));
    } else if (filters.sortBy === 'createdAt') {
      filteredUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      users: filteredUsers.slice(startIndex, endIndex),
      total: filteredUsers.length,
      page,
      totalPages: Math.ceil(filteredUsers.length / limit)
    };
  },

  getUserById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return users.find(u => u.id === parseInt(id));
  },

  updateUserStatus: async (userId, status) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = users.findIndex(u => u.id === parseInt(userId));
    if (index !== -1) {
      users[index].status = status;
      return users[index];
    }
    throw new Error('User not found');
  },

  deleteUser: async (userId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    users = users.filter(u => u.id !== parseInt(userId));
    return { success: true };
  },

  // User Reports
  getAllReports: async (page = 1, limit = 10, status = 'all') => {
    await new Promise(resolve => setTimeout(resolve, 300));
    let filteredReports = [...reports];

    if (status !== 'all') {
      filteredReports = filteredReports.filter(r => r.status === status);
    }

    filteredReports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      reports: filteredReports.slice(startIndex, endIndex),
      total: filteredReports.length,
      page,
      totalPages: Math.ceil(filteredReports.length / limit)
    };
  },

  resolveReport: async (reportId, resolution) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = reports.findIndex(r => r.id === parseInt(reportId));
    if (index !== -1) {
      reports[index].status = 'resolved';
      reports[index].resolvedAt = new Date().toISOString();
      reports[index].resolvedBy = 'Admin User';
      reports[index].resolution = resolution;
      return reports[index];
    }
    throw new Error('Report not found');
  },

  dismissReport: async (reportId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = reports.findIndex(r => r.id === parseInt(reportId));
    if (index !== -1) {
      reports[index].status = 'dismissed';
      reports[index].resolvedAt = new Date().toISOString();
      reports[index].resolvedBy = 'Admin User';
      return reports[index];
    }
    throw new Error('Report not found');
  },

  // Announcement Management
  getPendingAnnouncements: async (page = 1, limit = 10) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const pending = announcements.filter(a => a.status === 'pending');
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      announcements: pending.slice(startIndex, endIndex),
      total: pending.length,
      page,
      totalPages: Math.ceil(pending.length / limit)
    };
  },

  // Vet Submissions — real DB
  getAllAnnouncements: async () => {
    const response = await api.get('/admin/announcements/vet-submissions');
    // Return in the shape the component expects: { announcements: [], totalPages: 1 }
    return { announcements: response.data || [], totalPages: 1 };
  },

  approveAnnouncement: async (id) => {
    const response = await api.patch(`/admin/announcements/${id}/approve`);
    return response.data;
  },

  rejectAnnouncement: async (id) => {
    const response = await api.delete(`/admin/announcements/${id}/reject`);
    return response.data;
  },

  editAnnouncement: async (id, data) => {
    const response = await api.patch(`/admin/announcements/${id}/edit-approve`, {
      title: data.title,
      content: data.content,
      type: data.type || 'General',
    });
    return response.data;
  },

  // System Announcements — real DB
  getSystemAnnouncements: async () => {
    const response = await api.get('/admin/announcements');
    return response.data;
  },

  createSystemAnnouncement: async (data) => {
    const response = await api.post('/admin/announcements', {
      title: data.title,
      content: data.content,
      type: data.type || 'General',
    });
    return response.data;
  },

  updateSystemAnnouncement: async (id, data) => {
    const response = await api.put(`/admin/announcements/${id}`, {
      title: data.title,
      content: data.content,
      type: data.type || 'General',
    });
    return response.data;
  },

  deleteSystemAnnouncement: async (id) => {
    const response = await api.delete(`/admin/announcements/${id}`);
    return response.data;
  },

  // Chart Data — real DB
  getActiveUsersChart: async () => {
    const response = await api.get('/admin/users/chart');
    return response.data;
  },

  // Real users from DB
  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  // Suspend a user by UserID — sets ACCOUNT.AccStatus to 'Suspended'
  suspendUser: async (userId) => {
    const response = await api.patch(`/admin/users/${userId}/suspend`);
    return response.data;
  },

  // Real reports from DB
  getReports: async () => {
    const response = await api.get('/admin/reports');
    return response.data;
  },

  updateReportStatus: async (id, status, reportedUserId) => {
    const response = await api.patch(`/admin/reports/${id}/status`, { status, reportedUserId });
    return response.data;
  },

  // Dashboard Stats
  getDashboardStats: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      totalUsers: users.filter(u => u.role === 'user').length,
      activeUsers: users.filter(u => u.status === 'active' && u.role === 'user').length,
      pendingReports: reports.filter(r => r.status === 'pending').length,
      pendingAnnouncements: announcements.filter(a => a.status === 'pending').length
    };
  }
};
