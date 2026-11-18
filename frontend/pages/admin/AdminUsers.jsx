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
  const [showInviteModal, setShowInviteModal]   = useState(false);
  const [showInvitePass, setShowInvitePass]     = useState(false);
  const [inviteForm, setInviteForm]             = useState({ email: '', password: '', name: '', role: 'admin' });
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [submitting, setSubmitting]             = useState(false);

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

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setInviteSubmitting(true);
    try {
      await adminService.inviteStaff(inviteForm);
      showToastMsg(`${inviteForm.role === 'admin' ? 'Admin' : 'Vet Staff'} account created successfully.`);
      setShowInviteModal(false);
      setShowInvitePass(false);
      setInviteForm({ email: '', password: '', name: '', role: 'admin' });
    } catch (err) {
      showToastMsg(err?.response?.data?.error || 'Failed to create account.', 'error');
    } finally {
      setInviteSubmitting(false);
    }
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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Users</h1>
          <button
            onClick={() => setShowInviteModal(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark text-sm font-medium"
          >
            + Invite Staff
          </button>
        </div>

        {toast && (
          <div className={`rounded-xl px-4 py-3 text-sm font-medium border ${
            toast.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-green-50 text-green-800 border-green-200'
          }`}>
            {toast.msg}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row justify-between items-end gap-4">
          <div className="w-full sm:w-1/3">
            <label className="block text-xs font-medium text-gray-500 mb-1">Inactive since</label>
            <select
              value={lastLoginFilter}
              onChange={e => { setLastLoginFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All</option>
              <option value="1">&gt; 1 day</option>
              <option value="7">&gt; 7 days</option>
              <option value="30">&gt; 30 days</option>
              <option value="1-year">&gt; 1 year</option>
              <option value="2-year">&gt; 2 years</option>
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

        {/* Mobile cards */}
        <div className="sm:hidden space-y-3">
          {loading ? (
            <p className="text-center text-gray-400 text-sm py-8">Loading…</p>
          ) : paginated.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">No users found.</p>
          ) : paginated.map(user => (
            <div key={user.UserID} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <input type="checkbox"
                    className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4 shrink-0"
                    checked={selectedIds.includes(user.UserID)}
                    onChange={() => toggleSelect(user.UserID)} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user.UserName}</p>
                    <p className="text-xs text-gray-500 truncate">{user.AccEmail || '—'}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full font-medium shrink-0 ${STATUS_STYLES[user.AccStatus] || STATUS_STYLES.Active}`}>
                  {user.AccStatus || 'Active'}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Last Login</p>
                <p className="text-sm text-gray-600">
                  {user.UserLastLogin ? new Date(user.UserLastLogin).toLocaleString() : '—'}
                </p>
              </div>
              <div>
                {user.AccStatus !== 'Suspended' ? (
                  <button onClick={() => handleOpenSuspendModal(user)}
                    className="px-3 py-1.5 text-xs font-medium text-orange-600 hover:text-orange-800 border border-orange-200 rounded-lg hover:bg-orange-50">
                    Suspend
                  </button>
                ) : (
                  <span className="text-xs text-gray-400">Suspended</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 w-12 text-center">
                    <input type="checkbox"
                      className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                      checked={paginated.length > 0 && selectedIds.length === paginated.length}
                      onChange={toggleSelectAll} />
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
                  <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400 text-sm">Loading…</td></tr>
                ) : paginated.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400 text-sm">No users found.</td></tr>
                ) : paginated.map(user => (
                  <tr key={user.UserID} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-center">
                      <input type="checkbox"
                        className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                        checked={selectedIds.includes(user.UserID)}
                        onChange={() => toggleSelect(user.UserID)} />
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
                        <button onClick={() => handleOpenSuspendModal(user)}
                          className="text-orange-600 hover:text-orange-800 text-sm font-medium">
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

      {/* Invite Admin / Vet Staff Modal */}
      <Modal isOpen={showInviteModal} onClose={() => { if (!inviteSubmitting) { setShowInviteModal(false); setShowInvitePass(false); } }} title="Invite Staff">
        <form onSubmit={handleInviteSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={inviteForm.name}
              onChange={e => setInviteForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Dr. Maria Santos"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
            <input
              type="email"
              value={inviteForm.email}
              onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))}
              placeholder="staff@shelter.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                type={showInvitePass ? 'text' : 'password'}
                value={inviteForm.password}
                onChange={e => setInviteForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Min. 6 chars"
                minLength={6}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <button
                type="button"
                onClick={() => setShowInvitePass(s => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showInvitePass ? 'Hide password' : 'Show password'}
              >
                {showInvitePass ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role <span className="text-red-500">*</span></label>
            <select
              value={inviteForm.role}
              onChange={e => setInviteForm(f => ({ ...f, role: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="admin">Admin</option>
              <option value="vet">Vet Staff</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={inviteSubmitting}
            className="w-full bg-primary text-white rounded-lg py-2.5 hover:bg-primary-dark font-medium text-sm disabled:opacity-60"
          >
            {inviteSubmitting ? 'Creating…' : 'Create'}
          </button>
        </form>
      </Modal>

      {/* Suspend Confirmation Modal */}
      <Modal isOpen={showSuspendModal} onClose={() => setShowSuspendModal(false)} title="Suspend">
        <form onSubmit={handleSuspendSubmit} className="space-y-4">
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
            {submitting ? 'Suspending…' : 'Confirm'}
          </button>
        </form>
      </Modal>
    </AdminLayout>
  );
};

export default AdminUsers;
