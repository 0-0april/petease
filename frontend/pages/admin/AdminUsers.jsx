import React from 'react';
import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import { adminService } from '../../services/adminService';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [toast, setToast] = useState(null);
  
  // Requirement: Filter users by last login (days, years)
  const [lastLoginFilter, setLastLoginFilter] = useState('all');

  // Multi-select and Suspend state
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState('Violation of Terms');
  const [singleSuspendUser, setSingleSuspendUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, lastLoginFilter]);

  const fetchUsers = async () => {
    try {
      const data = await adminService.getAllUsers(currentPage, 100, {});
      let filtered = data.users;
      
      if (lastLoginFilter !== 'all') {
        const factor = lastLoginFilter.includes('year') ? 365 : 1;
        const num = parseInt(lastLoginFilter);
        const days = num * factor;
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        filtered = filtered.filter(u => u.lastLogin && new Date(u.lastLogin) >= cutoff);
      }
      
      setUsers(filtered);
      setTotalPages(1);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUserIds(users.filter(u => u.status !== 'suspended').map(u => u.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const toggleSelectUser = (id) => {
    setSelectedUserIds(prev => prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]);
  };

  // --- Suspend action logic ---
  const handleOpenSuspendModal = (user = null) => {
    setSingleSuspendUser(user);
    setSuspensionReason('Violation of Terms');
    setShowSuspendModal(true);
  };

  const handleSuspendSubmit = async (e) => {
    e.preventDefault();
    try {
      if (singleSuspendUser) {
        // Suspend single user from Actions column
        await adminService.updateUserStatus(singleSuspendUser.id, 'suspended', suspensionReason);
        showToastMsg(`Successfully suspended ${singleSuspendUser.name}.`);
      } else {
        // Suspend multiple users from checkboxes
        await Promise.all(selectedUserIds.map(id => adminService.updateUserStatus(id, 'suspended', suspensionReason)));
        showToastMsg(`Successfully suspended ${selectedUserIds.length} user(s).`);
      }
      
      setShowSuspendModal(false);
      setSingleSuspendUser(null);
      setSelectedUserIds([]);
      fetchUsers();
    } catch (error) {
      showToastMsg('Failed to suspend user.', 'error');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>

        {toast && (
          <div className={`rounded-xl px-4 py-3 text-sm font-medium ${toast.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-green-50 text-green-800 border-green-200'} border`}>
            {toast.msg}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row justify-between items-end gap-4">
          <div className="w-full sm:w-1/3">
            <label className="block text-xs font-medium text-gray-500 mb-1">Filter by Last Login</label>
            <select
              value={lastLoginFilter}
              onChange={e => setLastLoginFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Any Time</option>
              <option value="1">Last 1 Day</option>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="1-year">Last 1 Year</option>
              <option value="2-year">Last 2 Years</option>
            </select>
          </div>

          {/* Suspend Multiple Button */}
          {selectedUserIds.length > 0 && (
            <button
              onClick={() => handleOpenSuspendModal(null)}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 font-medium whitespace-nowrap"
            >
              Suspend Selected ({selectedUserIds.length})
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-visible overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left w-12 text-center">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                    checked={users.length > 0 && users.filter(u => u.status !== 'suspended').length > 0 && selectedUserIds.length === users.filter(u => u.status !== 'suspended').length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-400 text-sm">No users found.</td>
                </tr>
              ) : users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4 disabled:opacity-50"
                      checked={selectedUserIds.includes(user.id)}
                      onChange={() => toggleSelectUser(user.id)}
                      disabled={user.status === 'suspended'}
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 capitalize">{user.role}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '—'}
                  </td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-1 text-xs rounded-full font-medium ${user.status === 'active' ? 'bg-green-100 text-green-800' : 
                          user.status === 'suspended' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.status === 'suspended' ? (
                      <span className="text-gray-400 text-sm font-medium italic">Suspended</span>
                    ) : (
                      <button 
                        onClick={() => handleOpenSuspendModal(user)} 
                        className="text-orange-600 hover:text-orange-800 text-sm font-medium"
                      >
                        Suspend
                      </button>
                    )}
                    {/* Nothing else here as strictly required. Edit/Delete removed entirely */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {/* Suspend Users Modal */}
      <Modal isOpen={showSuspendModal} onClose={() => setShowSuspendModal(false)} title="Suspend User(s)">
        <form onSubmit={handleSuspendSubmit} className="space-y-4">
          <p className="text-sm text-gray-600">
            {singleSuspendUser 
              ? `You are about to suspend ${singleSuspendUser.name}. Please select a reason:`
              : `You are about to suspend ${selectedUserIds.length} user(s). Please select a reason:`
            }
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pre-template Reason</label>
            <select
              value={suspensionReason}
              onChange={(e) => setSuspensionReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary"
              required
            >
              <option value="Violation of Terms">Violation of Terms</option>
              <option value="Inappropriate Behavior">Inappropriate Behavior</option>
              <option value="Spam / Scammer Activity">Spam / Scammer Activity</option>
              <option value="Payment / Fraud Issue">Payment / Fraud Issue</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-orange-600 text-white rounded-lg py-2 hover:bg-orange-700 font-medium">
            Confirm Suspension
          </button>
        </form>
      </Modal>

    </AdminLayout>
  );
};

export default AdminUsers;
