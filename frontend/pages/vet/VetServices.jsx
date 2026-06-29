import React from 'react';
import { useState, useEffect } from 'react';
import VetLayout from '../../components/VetLayout';
import Modal from '../../components/Modal';
import { vetService } from '../../services/vetService';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const EMPTY_FORM = {
  name: '',
  description: '',
  selectedDays: [],
  specificDate: '',
  notifyUsers: true,
};

// Derive availabilityType for display from stored data
const getAvailabilityLabel = (service) => {
  if (service.specificDate) return `Specific date: ${new Date(service.specificDate).toLocaleDateString()}`;
  if (service.daysAvailable?.length) return service.daysAvailable.join(', ');
  return 'Not set';
};

const VetServices = () => {
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const data = await vetService.getServices();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
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

  const openEdit = (service) => {
    setEditing(service);
    setFormData({
      name: service.name,
      description: service.description,
      selectedDays: service.daysAvailable || [],
      specificDate: service.specificDate || '',
      notifyUsers: true,
    });
    setShowModal(true);
  };

  const toggleDay = (day) => {
    // If specific date is set, do nothing (days are disabled)
    if (formData.specificDate) return;
    setFormData(f => ({
      ...f,
      selectedDays: f.selectedDays.includes(day)
        ? f.selectedDays.filter(d => d !== day)
        : [...f.selectedDays, day],
    }));
  };

  const handleSpecificDateChange = (e) => {
    const val = e.target.value;
    setFormData(f => ({
      ...f,
      specificDate: val,
      // Clear selected days when a specific date is chosen
      selectedDays: val ? [] : f.selectedDays,
    }));
  };

  const handleClearSpecificDate = () => {
    setFormData(f => ({ ...f, specificDate: '' }));
  };

  const isValid = () => {
    return !!(formData.name.trim() && formData.description.trim());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid()) return;

    // Build payload — use new fields
    const payload = {
      name: formData.name,
      description: formData.description,
      availabilityType: formData.specificDate ? 'specific' : 'days',
      selectedDays: formData.selectedDays,
      specificDate: formData.specificDate || null,
      notifyUsers: formData.notifyUsers,
    };

    try {
      if (editing) {
        await vetService.updateService(editing.id, payload);
        showToast(formData.notifyUsers ? 'Service updated. All users have been notified.' : 'Service updated successfully.');
      } else {
        await vetService.createService(payload);
        showToast('Service created successfully.');
      }
      setShowModal(false);
      setEditing(null);
      setFormData(EMPTY_FORM);
      fetchServices();
    } catch {
      showToast('Failed to save service.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await vetService.deleteService(id);
      fetchServices();
      showToast('Service deleted successfully.');
    } catch {
      showToast('Failed to delete service.', 'error');
    }
  };

  const hasSpecificDate = !!formData.specificDate;
  const hasDays = formData.selectedDays.length > 0;

  return (
    <VetLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Services Management</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Manage veterinary services and their availability. Users will be notified of updates.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="self-start bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary-dark text-sm font-medium transition-colors"
          >
            + Add Service
          </button>
        </div>

        {toast && (
          <div className={`rounded-xl px-4 py-3 text-sm font-medium border ${
            toast.type === 'error'
              ? 'bg-red-50 text-red-800 border-red-200'
              : 'bg-green-50 text-green-800 border-green-200'
          }`}>
            {toast.msg}
          </div>
        )}

        {services.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-600 font-medium">No services yet</p>
            <p className="text-sm text-gray-400 mt-1">Create your first service to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{service.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {service.specificDate ? (
                        <span className="px-2 py-1 rounded-full font-medium bg-purple-100 text-purple-700">
                          {new Date(service.specificDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      ) : service.daysAvailable?.length > 0 ? (
                        service.daysAvailable.map(d => (
                          <span key={d} className="px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-700">{d}</span>
                        ))
                      ) : (
                        <span className="text-gray-400">No availability set</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button onClick={() => openEdit(service)} className="text-sm text-primary hover:text-primary-dark font-medium">Edit</button>
                    <button onClick={() => handleDelete(service.id)} className="text-sm text-red-600 hover:text-red-800 font-medium">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditing(null); setFormData(EMPTY_FORM); }}
        title={editing ? 'Edit Service' : 'Add Service'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Spay/Neuter, Consultation, Vaccination"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the service..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={3}
              required
            />
          </div>

          {/* Availability */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Availability <span className="text-red-500">*</span>
            </label>

            {/* Day checkboxes */}
            <div className="space-y-2 mb-3">
              {DAYS.map(day => (
                <label
                  key={day}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                    hasSpecificDate
                      ? 'opacity-40 cursor-not-allowed border-gray-200 bg-gray-50'
                      : formData.selectedDays.includes(day)
                      ? 'border-primary bg-green-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.selectedDays.includes(day)}
                    onChange={() => toggleDay(day)}
                    disabled={hasSpecificDate}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">{day}</span>
                </label>
              ))}
            </div>

            {/* Specific date */}
            <div className={`border rounded-lg p-3 transition-colors ${
              hasDays
                ? 'opacity-40 border-gray-200 bg-gray-50'
                : 'border-gray-200 bg-white'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Specific Date</span>
                {formData.specificDate && (
                  <button
                    type="button"
                    onClick={handleClearSpecificDate}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Clear
                  </button>
                )}
              </div>
              <input
                type="date"
                value={formData.specificDate}
                onChange={handleSpecificDateChange}
                disabled={hasDays}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed"
              />
              {hasDays && (
                <p className="text-xs text-gray-400 mt-1">Clear day selections above to pick a specific date.</p>
              )}
            </div>


          </div>

          {/* Notify users (edit only) */}
          {editing && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                id="notifyUsers"
                checked={formData.notifyUsers}
                onChange={(e) => setFormData({ ...formData, notifyUsers: e.target.checked })}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="text-sm text-gray-700">Notify all users about this update</span>
            </label>
          )}

          <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs text-blue-800">
            {editing ? 'Users will be notified if the checkbox above is selected.' : 'Service will be available for booking once created.'}
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
              disabled={!isValid()}
              className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {editing ? 'Save Changes' : 'Create Service'}
            </button>
          </div>
        </form>
      </Modal>
    </VetLayout>
  );
};

export default VetServices;
