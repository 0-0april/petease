import { useState, useEffect } from 'react';
import VetLayout from '../../components/VetLayout';
import Modal from '../../components/Modal';
import { vetService } from '../../services/vetService';

const VetAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    serviceType: 'spay',
    availableDates: ''
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dates = formData.availableDates
        ? formData.availableDates.split(',').map(d => d.trim())
        : [];
      
      await vetService.createAnnouncement({
        ...formData,
        availableDates: dates
      });
      
      setShowModal(false);
      setFormData({
        title: '',
        content: '',
        serviceType: 'spay',
        availableDates: ''
      });
      fetchAnnouncements();
      alert('Announcement created successfully');
    } catch (error) {
      alert('Failed to create announcement');
    }
  };

  return (
    <VetLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Service Announcements</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark"
          >
            Create Announcement
          </button>
        </div>

        <div className="space-y-4">
          {announcements.map(announcement => (
            <div key={announcement.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{announcement.title}</h3>
                  <p className="text-gray-700 mt-2">{announcement.content}</p>
                  <div className="mt-4 flex items-center space-x-4">
                    <span className="px-3 py-1 bg-primary-light bg-opacity-20 text-primary rounded-full text-sm capitalize">
                      {announcement.serviceType}
                    </span>
                    <span className="text-sm text-gray-500">
                      Posted on {new Date(announcement.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-sm text-gray-500">
                      By {announcement.createdBy}
                    </span>
                  </div>
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
                </div>
              </div>
            </div>
          ))}
        </div>

        {announcements.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600">No announcements yet</p>
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Announcement">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Service Type</label>
            <select
              value={formData.serviceType}
              onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
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
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              rows="4"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Available Dates (comma-separated)</label>
            <input
              type="text"
              value={formData.availableDates}
              onChange={(e) => setFormData({ ...formData, availableDates: e.target.value })}
              placeholder="2024-03-20, 2024-03-25, 2024-03-30"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: YYYY-MM-DD, separated by commas (optional)
            </p>
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary-dark"
          >
            Create Announcement
          </button>
        </form>
      </Modal>
    </VetLayout>
  );
};

export default VetAnnouncements;
