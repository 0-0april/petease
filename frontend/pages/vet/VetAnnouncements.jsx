import React from 'react';
<<<<<<< HEAD
import { useState, useEffect } from 'react';
import VetLayout from '../../components/VetLayout';
import Modal from '../../components/Modal';
import { vetService } from '../../services/vetService';

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const SERVICE_OPTIONS = [
  { value: 'spay', label: 'Spay/Neuter' },
  { value: 'consultation', label: 'Consultation' },
  { value: 'anti-rabies', label: 'Rabies Vaccination' },
  { value: 'general', label: 'General Service' },
];

const EMPTY_FORM = {
  title: '',
  content: '',
  serviceType: 'spay',
  availableDates: '',
};

const VetAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null); // announcement being edited
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const data = await vetService.getAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openCreate = () => {
    setEditing(null);
    setFormData(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (announcement) => {
    setEditing(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      serviceType: announcement.serviceType,
      availableDates: (announcement.availableDates || []).join(', '),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dates = formData.availableDates
      ? formData.availableDates.split(',').map(d => d.trim()).filter(Boolean)
      : [];

    try {
      if (editing) {
        // Update in-place (mock: replace in array)
        setAnnouncements(prev =>
          prev.map(a =>
            a.id === editing.id
              ? { ...a, ...formData, availableDates: dates, updatedAt: new Date().toISOString() }
              : a
          )
        );
        showToast('Announcement updated successfully.');
      } else {
        await vetService.createAnnouncement({ ...formData, availableDates: dates });
        fetchAnnouncements();
        showToast('Announcement created. Users will be notified once approved.');
      }
      setShowModal(false);
      setFormData(EMPTY_FORM);
      setEditing(null);
    } catch {
      showToast('Failed to save announcement.', 'error');
    }
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <VetLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Service Announcements</h1>
            <p className="text-gray-500 mt-1 text-sm">Announcements are reviewed by admin before being published to users.</p>
          </div>
          <button
            onClick={openCreate}
            className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary-dark text-sm font-medium"
          >
            + New Announcement
          </button>
        </div>

        {toast && (
          <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
            toast.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'
          }`}>
            {toast.msg}
          </div>
        )}

        {announcements.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-500">No announcements yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map(announcement => (
              <div key={announcement.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_STYLES[announcement.status] || 'bg-gray-100 text-gray-600'}`}>
                        {announcement.status}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm mb-3">{announcement.content}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full capitalize font-medium">
                        {SERVICE_OPTIONS.find(s => s.value === announcement.serviceType)?.label || announcement.serviceType}
                      </span>
                      <span>Posted {formatDate(announcement.createdAt)}</span>
                      <span>by {announcement.createdBy}</span>
                      {announcement.reviewedBy && (
                        <span className="text-green-600">Reviewed by {announcement.reviewedBy}</span>
                      )}
                    </div>
                    {announcement.availableDates?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-gray-600 mb-1">Available Dates:</p>
                        <div className="flex flex-wrap gap-2">
                          {announcement.availableDates.map((date, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {formatDate(date)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {announcement.status !== 'approved' && (
                    <button
                      onClick={() => openEdit(announcement)}
                      className="flex-shrink-0 text-sm text-primary hover:text-primary-dark font-medium border border-primary rounded-lg px-3 py-1.5"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditing(null); setFormData(EMPTY_FORM); }}
        title={editing ? 'Edit Announcement' : 'New Announcement'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
            <select
              value={formData.serviceType}
              onChange={e => setFormData({ ...formData, serviceType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {SERVICE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={4}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Available Dates <span className="text-gray-400 font-normal">(comma-separated, optional)</span>
            </label>
            <input
              type="text"
              value={formData.availableDates}
              onChange={e => setFormData({ ...formData, availableDates: e.target.value })}
              placeholder="2024-03-20, 2024-03-25"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-gray-400 mt-1">Format: YYYY-MM-DD</p>
          </div>
          <div className="flex space-x-3 pt-1">
            <button
              type="button"
              onClick={() => { setShowModal(false); setEditing(null); setFormData(EMPTY_FORM); }}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark text-sm font-medium"
            >
              {editing ? 'Save Changes' : 'Create Announcement'}
            </button>
          </div>
        </form>
      </Modal>
    </VetLayout>
  );
};

export default VetAnnouncements;
=======
import { useState, useEffect } from 'react';
import VetLayout from '../../components/VetLayout';
import Modal from '../../components/Modal';
import { vetService } from '../../services/vetService';

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const SERVICE_OPTIONS = [
  { value: 'spay', label: 'Spay/Neuter' },
  { value: 'consultation', label: 'Consultation' },
  { value: 'anti-rabies', label: 'Rabies Vaccination' },
  { value: 'general', label: 'General Service' },
];

const EMPTY_FORM = {
  title: '',
  content: '',
  serviceType: 'spay',
  availableDates: '',
};

const VetAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null); // announcement being edited
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const data = await vetService.getAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openCreate = () => {
    setEditing(null);
    setFormData(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (announcement) => {
    setEditing(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      serviceType: announcement.serviceType,
      availableDates: (announcement.availableDates || []).join(', '),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dates = formData.availableDates
      ? formData.availableDates.split(',').map(d => d.trim()).filter(Boolean)
      : [];

    try {
      if (editing) {
        // Update in-place (mock: replace in array)
        setAnnouncements(prev =>
          prev.map(a =>
            a.id === editing.id
              ? { ...a, ...formData, availableDates: dates, updatedAt: new Date().toISOString() }
              : a
          )
        );
        showToast('Announcement updated successfully.');
      } else {
        await vetService.createAnnouncement({ ...formData, availableDates: dates });
        fetchAnnouncements();
        showToast('Announcement created. Users will be notified once approved.');
      }
      setShowModal(false);
      setFormData(EMPTY_FORM);
      setEditing(null);
    } catch {
      showToast('Failed to save announcement.', 'error');
    }
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <VetLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Service Announcements</h1>
            <p className="text-gray-500 mt-1 text-sm">Announcements are reviewed by admin before being published to users.</p>
          </div>
          <button
            onClick={openCreate}
            className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary-dark text-sm font-medium"
          >
            + New Announcement
          </button>
        </div>

        {toast && (
          <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
            toast.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'
          }`}>
            {toast.msg}
          </div>
        )}

        {announcements.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-500">No announcements yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map(announcement => (
              <div key={announcement.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_STYLES[announcement.status] || 'bg-gray-100 text-gray-600'}`}>
                        {announcement.status}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm mb-3">{announcement.content}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full capitalize font-medium">
                        {SERVICE_OPTIONS.find(s => s.value === announcement.serviceType)?.label || announcement.serviceType}
                      </span>
                      <span>Posted {formatDate(announcement.createdAt)}</span>
                      <span>by {announcement.createdBy}</span>
                      {announcement.reviewedBy && (
                        <span className="text-green-600">Reviewed by {announcement.reviewedBy}</span>
                      )}
                    </div>
                    {announcement.availableDates?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-gray-600 mb-1">Available Dates:</p>
                        <div className="flex flex-wrap gap-2">
                          {announcement.availableDates.map((date, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {formatDate(date)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {announcement.status !== 'approved' && (
                    <button
                      onClick={() => openEdit(announcement)}
                      className="flex-shrink-0 text-sm text-primary hover:text-primary-dark font-medium border border-primary rounded-lg px-3 py-1.5"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditing(null); setFormData(EMPTY_FORM); }}
        title={editing ? 'Edit Announcement' : 'New Announcement'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
            <select
              value={formData.serviceType}
              onChange={e => setFormData({ ...formData, serviceType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {SERVICE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={4}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Available Dates <span className="text-gray-400 font-normal">(comma-separated, optional)</span>
            </label>
            <input
              type="text"
              value={formData.availableDates}
              onChange={e => setFormData({ ...formData, availableDates: e.target.value })}
              placeholder="2024-03-20, 2024-03-25"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-gray-400 mt-1">Format: YYYY-MM-DD</p>
          </div>
          <div className="flex space-x-3 pt-1">
            <button
              type="button"
              onClick={() => { setShowModal(false); setEditing(null); setFormData(EMPTY_FORM); }}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark text-sm font-medium"
            >
              {editing ? 'Save Changes' : 'Create Announcement'}
            </button>
          </div>
        </form>
      </Modal>
    </VetLayout>
  );
};

export default VetAnnouncements;
>>>>>>> 8555e327320ce828f5dfb4efd072c21355eac3c7
