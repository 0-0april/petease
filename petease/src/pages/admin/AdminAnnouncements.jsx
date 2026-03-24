import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import { adminService } from '../../services/adminService';

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('pending');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [editData, setEditData] = useState({
    title: '',
    content: '',
    serviceType: '',
    availableDates: ''
  });

  useEffect(() => {
    fetchAnnouncements();
  }, [currentPage, filter]);

  const fetchAnnouncements = async () => {
    try {
      const data = await adminService.getAllAnnouncements(currentPage, 10, filter);
      setAnnouncements(data.announcements);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const handleApprove = async (id) => {
    if (window.confirm('Approve this announcement?')) {
      try {
        await adminService.approveAnnouncement(id);
        fetchAnnouncements();
        alert('Announcement approved');
      } catch (error) {
        alert('Failed to approve announcement');
      }
    }
  };

  const handleReject = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowRejectModal(true);
  };

  const handleSubmitRejection = async (e) => {
    e.preventDefault();
    try {
      await adminService.rejectAnnouncement(selectedAnnouncement.id, rejectionReason);
      setShowRejectModal(false);
      setRejectionReason('');
      fetchAnnouncements();
      alert('Announcement rejected');
    } catch (error) {
      alert('Failed to reject announcement');
    }
  };

  const handleEdit = (announcement) => {
    setSelectedAnnouncement(announcement);
    setEditData({
      title: announcement.title,
      content: announcement.content,
      serviceType: announcement.serviceType,
      availableDates: announcement.availableDates.join(', ')
    });
    setShowEditModal(true);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      const dates = editData.availableDates
        ? editData.availableDates.split(',').map(d => d.trim())
        : [];
      
      await adminService.editAnnouncement(selectedAnnouncement.id, {
        ...editData,
        availableDates: dates
      });
      
      setShowEditModal(false);
      fetchAnnouncements();
      alert('Announcement updated and approved');
    } catch (error) {
      alert('Failed to update announcement');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Announcement Review</h1>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Announcements</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="space-y-4">
          {announcements.map(announcement => (
            <div key={announcement.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{announcement.title}</h3>
                    <span className={`px-3 py-1 text-xs rounded-full ${
                      announcement.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      announcement.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {announcement.status}
                    </span>
                    <span className="px-3 py-1 text-xs rounded-full bg-primary-light bg-opacity-20 text-primary capitalize">
                      {announcement.serviceType}
                    </span>
                  </div>
                  <p className="text-gray-700 mt-2">{announcement.content}</p>
                  {announcement.availableDates && announcement.availableDates.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-semibold text-gray-700">Available Dates:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {announcement.availableDates.map((date, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                            {new Date(date).toLocaleDateString()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-3 text-sm text-gray-500">
                    <p>Created by: {announcement.createdBy} on {new Date(announcement.createdAt).toLocaleString()}</p>
                    {announcement.reviewedBy && (
                      <p>Reviewed by: {announcement.reviewedBy} on {new Date(announcement.reviewedAt).toLocaleString()}</p>
                    )}
                    {announcement.rejectionReason && (
                      <p className="text-red-600 mt-1">Rejection Reason: {announcement.rejectionReason}</p>
                    )}
                  </div>
                </div>
                {announcement.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApprove(announcement.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleReject(announcement)}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {announcements.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600">No announcements found</p>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Announcement">
        <form onSubmit={handleSubmitEdit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Service Type</label>
            <select
              value={editData.serviceType}
              onChange={(e) => setEditData({ ...editData, serviceType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="spay">Spay/Neuter</option>
              <option value="consultation">Consultation</option>
              <option value="anti-rabies">Anti-Rabies Vaccine</option>
              <option value="general">General Service</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Content</label>
            <textarea
              value={editData.content}
              onChange={(e) => setEditData({ ...editData, content: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              rows="4"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Available Dates (comma-separated)</label>
            <input
              type="text"
              value={editData.availableDates}
              onChange={(e) => setEditData({ ...editData, availableDates: e.target.value })}
              placeholder="2024-03-20, 2024-03-25"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary-dark"
          >
            Update & Approve
          </button>
        </form>
      </Modal>

      <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} title="Reject Announcement">
        <form onSubmit={handleSubmitRejection} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Rejection Reason</label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              rows="4"
              placeholder="Explain why this announcement is being rejected..."
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700"
          >
            Reject Announcement
          </button>
        </form>
      </Modal>
    </AdminLayout>
  );
};

export default AdminAnnouncements;
