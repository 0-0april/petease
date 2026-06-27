import React from 'react';
import { useState, useEffect } from 'react';
import VetLayout from '../../components/VetLayout';
import Modal from '../../components/Modal';
import { vetService } from '../../services/vetService';

const AVAILABILITY_TYPES = {
  specific: 'Specific Date',
  recurring: 'Recurring (Weekdays)',
};

const VetServices = () => {
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    availabilityType: 'recurring',
    specificDate: '',
    notifyUsers: true,
  });
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
    setFormData({
      name: '',
      description: '',
      availabilityType: 'recurring',
      specificDate: '',
      notifyUsers: true,
    });
    setShowModal(true);
  };

  const openEdit = (service) => {
    setEditing(service);
    setFormData({
      name: service.name,
      description: service.description,
      availabilityType: service.availabilityType,
      specificDate: service.specificDate || '',
      notifyUsers: true,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await vetService.updateService(editing.id, formData);
        if (formData.notifyUsers) {
          showToast('Service updated. All users have been notified.');
        } else {
          showToast('Service updated successfully.');
        }
      } else {
        await vetService.createService(formData);
        showToast('Service created successfully.');
      }
      setShowModal(false);
      setFormData({
        name: '',
        description: '',
        availabilityType: 'recurring',
        specificDate: '',
        notifyUsers: true,
      });
      setEditing(null);
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

  return (
    <VetLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Services Management</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Manage veterinary services and their availability. Users will be notified of updates.
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
          <div
            className={`rounded-xl px-4 py-3 text-sm font-medium ${
              toast.type === 'error'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-green-50 text-green-800 border border-green-200'
            }`}
          >
            {toast.msg}
          </div>
        )}

        {services.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
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
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span
                        className={`px-2 py-1 rounded-full font-medium ${
                          service.availabilityType === 'recurring'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {AVAILABILITY_TYPES[service.availabilityType]}
                      </span>
                      {service.availabilityType === 'specific' && service.specificDate && (
                        <span className="text-gray-500">
                          Available: {new Date(service.specificDate).toLocaleDateString()}
                        </span>
                      )}
                      {service.availabilityType === 'recurring' && (
                        <span className="text-gray-500">Mon-Fri</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => openEdit(service)}
                      className="text-sm text-primary hover:text-primary-dark font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditing(null);
        }}
        title={editing ? 'Edit Service' : 'Add Service'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Spay/Neuter, Consultation, Vaccination"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Availability Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.availabilityType}
              onChange={(e) => setFormData({ ...formData, availabilityType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="recurring">Recurring (Weekdays)</option>
              <option value="specific">Specific Date</option>
            </select>
          </div>
          {formData.availabilityType === 'specific' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specific Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.specificDate}
                onChange={(e) => setFormData({ ...formData, specificDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required={formData.availabilityType === 'specific'}
              />
            </div>
          )}
          {editing && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="notifyUsers"
                checked={formData.notifyUsers}
                onChange={(e) => setFormData({ ...formData, notifyUsers: e.target.checked })}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="notifyUsers" className="text-sm text-gray-700">
                Notify all users about this update
              </label>
            </div>
          )}
          <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs text-blue-800">
            {editing
              ? 'Users will be notified if the checkbox above is selected.'
              : 'Service will be available for booking once created.'}
          </div>
          <div className="flex space-x-3 pt-1">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditing(null);
              }}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark text-sm font-medium"
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
