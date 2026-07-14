import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import { adminService } from '../../services/adminService';

const PAGE_SIZE = 10;

const STATUS_STYLES = {
  Active:    'bg-green-100 text-green-800',
  Warning:   'bg-yellow-100 text-yellow-800',
  Suspended: 'bg-red-100 text-red-800',
};

const AdminUsers = () => {
  const [allUsers, setAllUsers]               = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [currentPage, setCurrentPage]         = useState(1);
  const [lastLoginFilter, setLastLoginFilter] = useState('all');
  const [toast, setToast]                     = useState(null);
  const [selectedIds, setSelectedIds]         = useState([]);
  const [showSuspendModal, setShowSuspendModal]   = useState(false);
  const [suspensionReason, setSuspensionReason]   = useState('Violation of Terms');
  const [singleSuspendUser, setSingleSuspendUser] = useState(null);
  const [submitting, setSubmitting]               = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers();
      setAllUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter by last login inactivity period
  const filteredUsers = allUsers.filter(u => {
    if (lastLoginFilter === 'all') return true;
    if (!u.UserLastLogin) return true; // never logged in = always inactive
    const diffDays = (Date.now() - new Date(u.UserLastLogin)) / (1000 * 60 * 60 * 24);
    if (lastLoginFilter === '1')      return diffDays > 1;
    if (lastLoginFilter === '7')      return diffDays > 7;
    if (lastLoginFilter === '30')     return diffDays > 30;
    if (lastLoginFilter === '1-year') return diffDays > 365;
    if (lastLoginFilter === '2-year') return diffDays > 730;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const paginated  = filteredUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleSelectAll = (e) => {
    setSelectedIds(e.target.checked ? paginated.map(u => u.UserID) : []);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleOpenSuspendModal = (user = null) => {
    setSingleSuspendUser(user);
    setSuspensionReason('Violation of Terms');
    setShowSuspendModal(true);
  };

  const handleSuspendSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const ids = singleSuspendUser ? [singleSuspendUser.UserID] : selectedIds;
      // Suspend each selected user by updating their ACCOUNT.AccStatus via the admin API
      await Promise.all(ids.map(userId => adminService.suspendUser(userId)));
      showToastMsg(
        singleSuspendUser
          ? `${singleSuspendUser.UserName} has been suspended.`
          : `${ids.length} user(s) have been suspended.`
      );
      setShowSuspendModal(false);
      setSingleSuspendUser(null);
      setSelectedIds([]);
      fetchUsers(); // refresh table with updated statuses
    } catch {
      showToastMsg('Failed to suspend user(s).', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage Users</h1>

        {toast && (
          <div className={`rounded-xl px-4 py-3 text-sm font-medium border ${
            toast.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-green-50 text-green-800 border-green-200'
          }`}>
            {toast.msg}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row justify-between items-end gap-4">
          <div className="w-full sm:w-1/3">
            <label className="block text-xs font-medium text-gray-500 mb-1">Show users inactive since</label>
            <select
              value={lastLoginFilter}
              onChange={e => { setLastLoginFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Users</option>
              <option value="1">More than 1 day ago</option>
              <option value="7">More than 7 days ago</option>
              <option value="30">More than 30 days ago</option>
              <option value="1-year">More than 1 year ago</option>
              <option value="2-year">More than 2 years ago</option>
            </select>
          </div>

          {selectedIds.length > 0 && (
            <button
              onClick={() => handleOpenSuspendModal(null)}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 font-medium whitespace-nowrap"
            >
              Suspend Selected ({selectedIds.length})
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 w-12 text-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                      checked={paginated.length > 0 && selectedIds.length === paginated.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400 text-sm">Loading…</td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400 text-sm">No users found.</td>
                  </tr>
                ) : paginated.map(user => (
                  <tr key={user.UserID} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                        checked={selectedIds.includes(user.UserID)}
                        onChange={() => toggleSelect(user.UserID)}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{user.UserName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.AccEmail || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.UserLastLogin ? new Date(user.UserLastLogin).toLocaleString() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${STATUS_STYLES[user.AccStatus] || STATUS_STYLES.Active}`}>
                        {user.AccStatus || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.AccStatus !== 'Suspended' ? (
                        <button
                          onClick={() => handleOpenSuspendModal(user)}
                          className="text-orange-600 hover:text-orange-800 text-sm font-medium"
                        >
                          Suspend
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">Suspended</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {/* Suspend Confirmation Modal */}
      <Modal isOpen={showSuspendModal} onClose={() => setShowSuspendModal(false)} title="Suspend User(s)">
        <form onSubmit={handleSuspendSubmit} className="space-y-4">
          <p className="text-sm text-gray-600">
            {singleSuspendUser
              ? `You are about to suspend ${singleSuspendUser.UserName}. Please select a reason:`
              : `You are about to suspend ${selectedIds.length} user(s). Please select a reason:`}
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <select
              value={suspensionReason}
              onChange={e => setSuspensionReason(e.target.value)}
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
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-orange-600 text-white rounded-lg py-2 hover:bg-orange-700 font-medium disabled:opacity-60"
          >
            {submitting ? 'Suspending…' : 'Confirm Suspension'}
          </button>
        </form>
      </Modal>
    </AdminLayout>
  );
};

export default AdminUsers;
