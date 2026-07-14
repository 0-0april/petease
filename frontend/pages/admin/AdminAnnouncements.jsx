import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import { adminService } from '../../services/adminService';

// DB enum values for AnnounceType
const ANNOUNCE_TYPES = ['General', 'Event', 'Alert', 'Update'];

const TYPE_STYLES = {
  General: 'bg-blue-100 text-blue-800',
  Event:   'bg-purple-100 text-purple-800',
  Alert:   'bg-red-100 text-red-800',
  Update:  'bg-green-100 text-green-800',
};

const AdminAnnouncements = () => {
  const [activeTab, setActiveTab] = useState('system'); // 'system' or 'vet'

  // --- System Announcements State ---
  const [sysAnnouncements, setSysAnnouncements]   = useState([]);
  const [sysLoading, setSysLoading]               = useState(false);
  const [showSysModal, setShowSysModal]           = useState(false);
  const [editingSysAnn, setEditingSysAnn]         = useState(null);
  const [sysFormData, setSysFormData]             = useState({ title: '', content: '', type: 'General' });
  const [sysSubmitting, setSysSubmitting]         = useState(false);
  const [toast, setToast]                         = useState(null);

  // --- Vet Announcements State ---
  const [vetAnnouncements, setVetAnnouncements]   = useState([]);
  const [vetPage, setVetPage]                     = useState(1);
  const [vetTotalPages, setVetTotalPages]         = useState(1);
  const [selectedVetAnn, setSelectedVetAnn]       = useState(null);
  const [showVetRejectModal, setShowVetRejectModal] = useState(false);
  const [vetRejectionReason, setVetRejectionReason] = useState('');
  const [showVetEditModal, setShowVetEditModal]   = useState(false);
  const [vetEditData, setVetEditData]             = useState({ title: '', content: '', type: 'General' });

  useEffect(() => {
    if (activeTab === 'system') fetchSysAnnouncements();
    else fetchVetAnnouncements();
  }, [activeTab, vetPage]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // --- System Announcement Functions ---
  const fetchSysAnnouncements = async () => {
    setSysLoading(true);
    try {
      const data = await adminService.getSystemAnnouncements();
      setSysAnnouncements(data || []);
    } catch (err) {
      console.error('Error fetching announcements:', err);
      showToast('Failed to load announcements.', 'error');
    } finally {
      setSysLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingSysAnn(null);
    setSysFormData({ title: '', content: '', type: 'General' });
    setShowSysModal(true);
  };

  const openEditModal = (ann) => {
    setEditingSysAnn(ann);
    setSysFormData({ title: ann.title, content: ann.content, type: ann.type || 'General' });
    setShowSysModal(true);
  };

  const handleSysSubmit = async (e) => {
    e.preventDefault();
    setSysSubmitting(true);
    try {
      if (editingSysAnn) {
        await adminService.updateSystemAnnouncement(editingSysAnn.id, sysFormData);
        showToast('Announcement updated.');
      } else {
        await adminService.createSystemAnnouncement(sysFormData);
        showToast('Announcement created.');
      }
      setShowSysModal(false);
      fetchSysAnnouncements();
    } catch {
      showToast('Failed to save announcement.', 'error');
    } finally {
      setSysSubmitting(false);
    }
  };

  const handleSysDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await adminService.deleteSystemAnnouncement(id);
      showToast('Announcement deleted.');
      fetchSysAnnouncements();
    } catch {
      showToast('Failed to delete announcement.', 'error');
    }
  };

  // --- Vet Announcement Functions ---
  const fetchVetAnnouncements = async () => {
    try {
      const data = await adminService.getAllAnnouncements();
      setVetAnnouncements(data.announcements || []);
      setVetTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
      showToast('Failed to load vet submissions.', 'error');
    }
  };

  const handleVetApprove = async (id) => {
    try {
      await adminService.approveAnnouncement(id);
      showToast('Announcement approved and published.');
      fetchVetAnnouncements();
    } catch {
      showToast('Failed to approve.', 'error');
    }
  };

  const handleVetReject = async (e) => {
    e.preventDefault();
    try {
      await adminService.rejectAnnouncement(selectedVetAnn.id);
      setShowVetRejectModal(false);
      setVetRejectionReason('');
      showToast('Announcement rejected and removed.');
      fetchVetAnnouncements();
    } catch {
      showToast('Failed to reject.', 'error');
    }
  };

  const handleVetEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminService.editAnnouncement(selectedVetAnn.id, vetEditData);
      setShowVetEditModal(false);
      showToast('Announcement updated and approved.');
      fetchVetAnnouncements();
    } catch {
      showToast('Failed to update.', 'error');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('system')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'system' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              System Announcements
            </button>
            <button
              onClick={() => setActiveTab('vet')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'vet' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Vet Submissions
            </button>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`rounded-xl px-4 py-3 text-sm font-medium border ${
            toast.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-green-50 text-green-800 border-green-200'
          }`}>
            {toast.msg}
          </div>
        )}

        {/* ── System Announcements Tab ── */}
        {activeTab === 'system' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={openCreateModal}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark font-medium"
              >
                Create Announcement
              </button>
            </div>

            {sysLoading ? (
              <p className="text-gray-400 text-center py-10 text-sm">Loading…</p>
            ) : sysAnnouncements.length === 0 ? (
              <p className="text-gray-500 text-center py-10">No system announcements yet.</p>
            ) : (
              sysAnnouncements.map(ann => (
                <div key={ann.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-base font-bold text-gray-900">{ann.title}</h3>
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${TYPE_STYLES[ann.type] || 'bg-gray-100 text-gray-700'}`}>
                          {ann.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{ann.content}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        By {ann.createdBy} · {new Date(ann.createdAt).toLocaleString()}
                        {ann.updatedAt && ann.updatedAt !== ann.createdAt && (
                          <> · Updated {new Date(ann.updatedAt).toLocaleString()}</>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => openEditModal(ann)}
                        className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded text-sm hover:bg-blue-200 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleSysDelete(ann.id)}
                        className="bg-red-100 text-red-700 px-3 py-1.5 rounded text-sm hover:bg-red-200 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Vet Submissions Tab ── */}
        {activeTab === 'vet' && (
          <div className="space-y-4">
            {vetAnnouncements.length === 0 ? (
              <p className="text-gray-500 text-center py-10">No pending vet submissions.</p>
            ) : (
              vetAnnouncements.map(ann => (
                <div key={ann.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-base font-bold text-gray-900">{ann.title}</h3>
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${TYPE_STYLES[ann.type] || 'bg-gray-100 text-gray-700'}`}>
                          {ann.type}
                        </span>
                        <span className="px-2 py-0.5 text-xs rounded-full font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{ann.content}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        Submitted {new Date(ann.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleVetApprove(ann.id)}
                        className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 font-medium"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setSelectedVetAnn(ann);
                          setVetEditData({ title: ann.title, content: ann.content, type: ann.type || 'General' });
                          setShowVetEditModal(true);
                        }}
                        className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => { setSelectedVetAnn(ann); setShowVetRejectModal(true); }}
                        className="bg-red-600 text-white px-3 py-1.5 rounded text-sm hover:bg-red-700 font-medium"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}

            <Pagination currentPage={vetPage} totalPages={vetTotalPages} onPageChange={setVetPage} />
          </div>
        )}
      </div>

      {/* System Create/Edit Modal */}
      <Modal
        isOpen={showSysModal}
        onClose={() => setShowSysModal(false)}
        title={editingSysAnn ? 'Edit Announcement' : 'Create Announcement'}
      >
        <form onSubmit={handleSysSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              required
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={sysFormData.title}
              onChange={e => setSysFormData({ ...sysFormData, title: e.target.value })}
              placeholder="Announcement title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={sysFormData.type}
              onChange={e => setSysFormData({ ...sysFormData, type: e.target.value })}
            >
              {ANNOUNCE_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              value={sysFormData.content}
              onChange={e => setSysFormData({ ...sysFormData, content: e.target.value })}
              placeholder="Announcement message…"
            />
          </div>
          <button
            type="submit"
            disabled={sysSubmitting}
            className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary-dark disabled:opacity-60"
          >
            {sysSubmitting ? 'Saving…' : editingSysAnn ? 'Update' : 'Create'}
          </button>
        </form>
      </Modal>

      {/* Vet Edit Modal */}
      <Modal isOpen={showVetEditModal} onClose={() => setShowVetEditModal(false)} title="Edit & Approve Vet Submission">
        <form onSubmit={handleVetEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input required className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" value={vetEditData.title} onChange={e => setVetEditData({ ...vetEditData, title: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" value={vetEditData.type} onChange={e => setVetEditData({ ...vetEditData, type: e.target.value })}>
              {ANNOUNCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea required className="w-full border border-gray-300 p-2 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary" rows={4} value={vetEditData.content} onChange={e => setVetEditData({ ...vetEditData, content: e.target.value })} />
          </div>
          <button type="submit" className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary-dark">Update & Approve</button>
        </form>
      </Modal>

      {/* Vet Reject Modal */}
      <Modal isOpen={showVetRejectModal} onClose={() => setShowVetRejectModal(false)} title="Reject Vet Submission">
        <form onSubmit={handleVetReject} className="space-y-4">
          <p className="text-sm text-gray-600">
            This will permanently remove <strong>{selectedVetAnn?.title}</strong> from the pending submissions.
          </p>
          <button type="submit" className="w-full bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700">Confirm Reject</button>
          <button type="button" onClick={() => setShowVetRejectModal(false)} className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200">Cancel</button>
        </form>
      </Modal>
    </AdminLayout>
  );
};

export default AdminAnnouncements;
