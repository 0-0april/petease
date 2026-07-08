import React from 'react';
import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import { adminService } from '../../services/adminService';

const AdminAnnouncements = () => {
  const [activeTab, setActiveTab] = useState('system'); // 'system' or 'vet'

  // --- Vet Announcements State ---
  const [vetAnnouncements, setVetAnnouncements] = useState([]);
  const [vetFilter, setVetFilter] = useState('pending');
  const [vetPage, setVetPage] = useState(1);
  const [vetTotalPages, setVetTotalPages] = useState(1);
  const [selectedVetAnn, setSelectedVetAnn] = useState(null);
  const [showVetRejectModal, setShowVetRejectModal] = useState(false);
  const [vetRejectionReason, setVetRejectionReason] = useState('');
  const [showVetEditModal, setShowVetEditModal] = useState(false);
  const [vetEditData, setVetEditData] = useState({ title: '', content: '', serviceType: '', availableDates: '' });

  // --- System Announcements State ---
  const [sysAnnouncements, setSysAnnouncements] = useState([]);
  const [showSysModal, setShowSysModal] = useState(false);
  const [editingSysAnn, setEditingSysAnn] = useState(null);
  const [sysFormData, setSysFormData] = useState({ title: '', content: '', type: 'maintenance', priority: 'medium', expiresAt: '' });

  useEffect(() => {
    if (activeTab === 'vet') fetchVetAnnouncements();
    else fetchSysAnnouncements();
  }, [activeTab, vetPage, vetFilter]);

  // --- Vet Functions ---
  const fetchVetAnnouncements = async () => {
    try {
      const data = await adminService.getAllAnnouncements(vetPage, 10, vetFilter);
      setVetAnnouncements(data.announcements);
      setVetTotalPages(data.totalPages);
    } catch (error) {
      console.error(error);
    }
  };

  const handleVetApprove = async (id) => {
    try {
      await adminService.approveAnnouncement(id);
      fetchVetAnnouncements();
    } catch (error) {
      alert('Failed to approve');
    }
  };

  const handleVetReject = async (e) => {
    e.preventDefault();
    try {
      await adminService.rejectAnnouncement(selectedVetAnn.id, vetRejectionReason);
      setShowVetRejectModal(false);
      setVetRejectionReason('');
      fetchVetAnnouncements();
    } catch (error) {
      alert('Failed to reject');
    }
  };

  const handleVetEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const dates = vetEditData.availableDates ? vetEditData.availableDates.split(',').map(d => d.trim()) : [];
      await adminService.editAnnouncement(selectedVetAnn.id, { ...vetEditData, availableDates: dates });
      setShowVetEditModal(false);
      fetchVetAnnouncements();
    } catch (error) {
      alert('Failed to update');
    }
  };

  // --- System Functions ---
  const fetchSysAnnouncements = async () => {
    try {
      const data = await adminService.getSystemAnnouncements();
      setSysAnnouncements(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSysSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSysAnn) {
        await adminService.updateSystemAnnouncement(editingSysAnn.id, sysFormData);
      } else {
        await adminService.createSystemAnnouncement(sysFormData);
      }
      setShowSysModal(false);
      fetchSysAnnouncements();
    } catch (error) {
      alert('Failed to save');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('system')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'system' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              System Announcements
            </button>
            <button
              onClick={() => setActiveTab('vet')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'vet' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Vet Submissions
            </button>
          </div>
        </div>

        {activeTab === 'system' ? (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setEditingSysAnn(null);
                  setSysFormData({ title: '', content: '', type: 'maintenance', priority: 'medium', expiresAt: '' });
                  setShowSysModal(true);
                }}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
              >
                Create Announcement
              </button>
            </div>
            {sysAnnouncements.map(ann => (
              <div key={ann.id} className="bg-white rounded-lg shadow-sm p-5 border border-gray-100 flex justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{ann.title}</h3>
                  <p className="text-gray-700 mt-1">{ann.content}</p>
                </div>
                <button
                  onClick={() => {
                    setEditingSysAnn(ann);
                    setSysFormData({ ...ann, expiresAt: ann.expiresAt ? ann.expiresAt.split('T')[0] : '' });
                    setShowSysModal(true);
                  }}
                  className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded text-sm hover:bg-blue-200"
                >
                  Edit
                </button>
              </div>
            ))}
            {sysAnnouncements.length === 0 && <p className="text-gray-500 text-center py-6">No system announcements.</p>}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-end">
              <select value={vetFilter} onChange={(e) => setVetFilter(e.target.value)} className="px-3 py-2 border rounded-md">
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="all">All</option>
              </select>
            </div>
            {vetAnnouncements.map(ann => (
              <div key={ann.id} className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{ann.title} <span className="text-xs bg-gray-100 px-2 py-1 rounded ml-2">{ann.status}</span></h3>
                    <p className="text-gray-700 mt-1">{ann.content}</p>
                  </div>
                  {ann.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button onClick={() => handleVetApprove(ann.id)} className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700">Approve</button>
                      <button 
                        onClick={() => {
                          setSelectedVetAnn(ann);
                          setVetEditData({ title: ann.title, content: ann.content, serviceType: ann.serviceType, availableDates: ann.availableDates.join(', ') });
                          setShowVetEditModal(true);
                        }} 
                        className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700">Edit
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedVetAnn(ann);
                          setShowVetRejectModal(true);
                        }} 
                        className="bg-red-600 text-white px-3 py-1.5 rounded text-sm hover:bg-red-700">Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {vetAnnouncements.length === 0 && <p className="text-gray-500 text-center py-6">No vet announcements found.</p>}
            <Pagination currentPage={vetPage} totalPages={vetTotalPages} onPageChange={setVetPage} />
          </div>
        )}

        {/* System Edit Modal */}
        <Modal isOpen={showSysModal} onClose={() => setShowSysModal(false)} title={editingSysAnn ? 'Edit System Announcement' : 'Create System Announcement'}>
          <form onSubmit={handleSysSubmit} className="space-y-4">
            <div><label>Title</label><input required className="w-full border p-2 rounded" value={sysFormData.title} onChange={e => setSysFormData({...sysFormData, title: e.target.value})} /></div>
            <div><label>Content</label><textarea required className="w-full border p-2 rounded" rows="3" value={sysFormData.content} onChange={e => setSysFormData({...sysFormData, content: e.target.value})} /></div>
            <button type="submit" className="w-full bg-primary text-white py-2 rounded hover:bg-primary-dark">Save</button>
          </form>
        </Modal>

        {/* Vet Edit Modal */}
        <Modal isOpen={showVetEditModal} onClose={() => setShowVetEditModal(false)} title="Edit Vet Announcement">
          <form onSubmit={handleVetEditSubmit} className="space-y-4">
            <div><label>Title</label><input required className="w-full border p-2 rounded" value={vetEditData.title} onChange={e => setVetEditData({...vetEditData, title: e.target.value})} /></div>
            <div><label>Content</label><textarea required className="w-full border p-2 rounded" rows="3" value={vetEditData.content} onChange={e => setVetEditData({...vetEditData, content: e.target.value})} /></div>
            <div><label>Dates</label><input className="w-full border p-2 rounded" value={vetEditData.availableDates} onChange={e => setVetEditData({...vetEditData, availableDates: e.target.value})} /></div>
            <button type="submit" className="w-full bg-primary text-white py-2 rounded hover:bg-primary-dark">Update & Approve</button>
          </form>
        </Modal>

        {/* Vet Reject Modal */}
        <Modal isOpen={showVetRejectModal} onClose={() => setShowVetRejectModal(false)} title="Reject Announcement">
          <form onSubmit={handleVetReject} className="space-y-4">
            <div><label>Reason</label><textarea required className="w-full border p-2 rounded" rows="3" value={vetRejectionReason} onChange={e => setVetRejectionReason(e.target.value)} /></div>
            <button type="submit" className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700">Reject</button>
          </form>
        </Modal>

      </div>
    </AdminLayout>
  );
};

export default AdminAnnouncements;
