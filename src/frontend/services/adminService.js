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

  getAllAnnouncements: async (page = 1, limit = 10, status = 'all') => {
    await new Promise(resolve => setTimeout(resolve, 300));
    let filtered = [...announcements];

    if (status !== 'all') {
      filtered = filtered.filter(a => a.status === status);
    }

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      announcements: filtered.slice(startIndex, endIndex),
      total: filtered.length,
      page,
      totalPages: Math.ceil(filtered.length / limit)
    };
  },

  approveAnnouncement: async (announcementId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = announcements.findIndex(a => a.id === parseInt(announcementId));
    if (index !== -1) {
      announcements[index].status = 'approved';
      announcements[index].reviewedBy = 'Admin User';
      announcements[index].reviewedAt = new Date().toISOString();
      return announcements[index];
    }
    throw new Error('Announcement not found');
  },

  rejectAnnouncement: async (announcementId, reason) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = announcements.findIndex(a => a.id === parseInt(announcementId));
    if (index !== -1) {
      announcements[index].status = 'rejected';
      announcements[index].reviewedBy = 'Admin User';
      announcements[index].reviewedAt = new Date().toISOString();
      announcements[index].rejectionReason = reason;
      return announcements[index];
    }
    throw new Error('Announcement not found');
  },

  editAnnouncement: async (announcementId, data) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = announcements.findIndex(a => a.id === parseInt(announcementId));
    if (index !== -1) {
      announcements[index] = {
        ...announcements[index],
        ...data,
        status: 'approved',
        reviewedBy: 'Admin User',
        reviewedAt: new Date().toISOString()
      };
      return announcements[index];
    }
    throw new Error('Announcement not found');
  },

  // System Announcements
  getSystemAnnouncements: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return systemAnnouncements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  createSystemAnnouncement: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newAnnouncement = {
      id: systemAnnouncements.length + 1,
      ...data,
      createdAt: new Date().toISOString(),
      createdBy: 'Admin User',
      status: 'active'
    };
    systemAnnouncements.push(newAnnouncement);
    return newAnnouncement;
  },

  updateSystemAnnouncement: async (id, data) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = systemAnnouncements.findIndex(a => a.id === parseInt(id));
    if (index !== -1) {
      systemAnnouncements[index] = {
        ...systemAnnouncements[index],
        ...data
      };
      return systemAnnouncements[index];
    }
    throw new Error('Announcement not found');
  },

  deleteSystemAnnouncement: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    systemAnnouncements = systemAnnouncements.filter(a => a.id !== parseInt(id));
    return { success: true };
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
