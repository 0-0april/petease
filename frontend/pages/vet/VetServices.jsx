import React, { useState, useEffect } from 'react';
import VetLayout from '../../components/VetLayout';
import Modal from '../../components/Modal';
import { vetService } from '../../services/vetService';

// Days available in the DB enum + Saturday (stored as-is string in array)
const DAY_OPTIONS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const EMPTY_FORM = {
  name: '',
  description: '',
  selectedDays: [],
  specificDate: '',
  notifyUsers: true,
};

const VetServices = () => {
  const [services, setServices]     = useState([]);
  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [formData, setFormData]     = useState(EMPTY_FORM);
  const [toast, setToast]           = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    try {
      const data = await vetService.getServices();
      setServices(data);
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const openCreate = () => {
    setEditing(null);
    setFormData(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (service) => {
    setEditing(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      selectedDays: service.daysAvailable || [],
      specificDate: service.specificDate || '',
      notifyUsers: true,
    });
    setShowModal(true);
  };

  const toggleDay = (day) => {
    setFormData(prev => ({
      ...prev,
      specificDate: '',  // clear specific date when a day is chosen
      selectedDays: prev.selectedDays.includes(day)
        ? prev.selectedDays.filter(d => d !== day)
        : [...prev.selectedDays, day],
    }));
  };

  const handleSpecificDate = (val) => {
    setFormData(prev => ({
      ...prev,
      specificDate: val,
      selectedDays: [],   // clear days when a specific date is chosen
    }));
  };

  const isFormValid = formData.name.trim() &&
    (formData.selectedDays.length > 0 || formData.specificDate);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        selectedDays: formData.selectedDays,
        specificDate: formData.specificDate || null,
        availabilityType: formData.specificDate ? 'specific' : 'recurring',
        notifyUsers: formData.notifyUsers,
      };
      if (editing) {
        await vetService.updateService(editing.id, payload);
        showToast(formData.notifyUsers
          ? 'Service updated. Announcement submitted to admin for review.'
          : 'Service updated successfully.');
      } else {
        await vetService.createService(payload);
        showToast(formData.notifyUsers
          ? 'Service created. Announcement submitted to admin for review.'
          : 'Service created successfully.');
      }
      setShowModal(false);
      setEditing(null);
      setFormData(EMPTY_FORM);
      fetchServices();
    } catch {
      showToast('Failed to save service.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await vetService.deleteService(id);
      fetchServices();
      showToast('Service deleted.');
    } catch {
      showToast('Failed to delete service.', 'error');
    }
  };

  return (
    <VetLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Services Management</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Manage veterinary services and their availability.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary-dark text-sm font-medium"
          >
            + Add Service
          </button>
        </div>

        {toast && (
          <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
            toast.type === 'error'
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-green-50 text-green-800 border border-green-200'
          }`}>
            {toast.msg}
          </div>
        )}

        {services.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-600 font-medium">No services yet</p>
            <p className="text-sm text-gray-400 mt-1">Create your first service to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map(service => (
              <div key={service.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{service.name}</h3>
                    {service.description && (
                      <p className="text-gray-600 text-sm mb-2">{service.description}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {service.specificDate ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                          {new Date(service.specificDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      ) : service.daysAvailable?.length > 0 ? (
                        service.daysAvailable.map(d => (
                          <span key={d} className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{d}</span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">No availability set</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button onClick={() => openEdit(service)}
                      className="text-sm text-primary hover:text-primary-dark font-medium">Edit</button>
                    <button onClick={() => handleDelete(service.id)}
                      className="text-sm text-red-600 hover:text-red-800 font-medium">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditing(null); }}
        title={editing ? 'Edit Service' : 'Add Service'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Spay/Neuter, Consultation, Vaccination"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the service..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={2}
            />
          </div>

          {/* Availability — Days */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Days <span className="text-gray-400 font-normal text-xs">(select one or more)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {DAY_OPTIONS.map(day => {
                const checked = formData.selectedDays.includes(day);
                const disabled = !!formData.specificDate;
                return (
                  <label
                    key={day}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors select-none ${
                      disabled
                        ? 'opacity-40 cursor-not-allowed bg-gray-50 border-gray-200'
                        : checked
                        ? 'bg-blue-50 border-blue-400 text-blue-700 font-medium'
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggleDay(day)}
                      className="w-3.5 h-3.5 text-primary rounded"
                    />
                    {day}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <div className="flex-1 h-px bg-gray-200" />
            <span>or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Specific Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specific Date{' '}
              <span className="text-gray-400 font-normal text-xs">(disables day selection)</span>
            </label>
            <input
              type="date"
              value={formData.specificDate}
              disabled={formData.selectedDays.length > 0}
              onChange={e => handleSpecificDate(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-opacity ${
                formData.selectedDays.length > 0
                  ? 'opacity-40 cursor-not-allowed bg-gray-50 border-gray-200'
                  : 'border-gray-300'
              }`}
            />
          </div>

          {/* Validation hint */}
          {!isFormValid && (
            <p className="text-xs text-amber-600">Please select at least one day or a specific date.</p>
          )}

          {/* Notify users */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="notifyUsers"
              checked={formData.notifyUsers}
              onChange={e => setFormData({ ...formData, notifyUsers: e.target.checked })}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label htmlFor="notifyUsers" className="text-sm text-gray-700">
              Notify users about this service
            </label>
          </div>

          {formData.notifyUsers && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs text-blue-800">
              An announcement will be submitted to admin for review and published once approved.
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => { setShowModal(false); setEditing(null); }}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid || submitting}
              className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark text-sm font-medium disabled:opacity-60"
            >
              {submitting ? 'Saving…' : editing ? 'Save Changes' : 'Create Service'}
            </button>
          </div>
        </form>
      </Modal>
    </VetLayout>
  );
};

export default VetServices;
