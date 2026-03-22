import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import { petService } from '../../services/petService';

const EMPTY_FORM = {
  name: '',
  species: 'dog',
  breed: '',
  color: '',
  gender: 'male',
  birthday: '',
  description: '',
  medicalHistory: '',
  registrationType: 'adoption',
  image: '',
  vaccinationCard: ''
};

const MyPets = () => {
  const [pets, setPets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => { fetchMyPets(); }, []);

  const fetchMyPets = async () => {
    try {
      const data = await petService.getMyPets();
      setPets(data);
    } catch (error) {
      console.error('Error fetching pets:', error);
    }
  };

  const showFeedback = (msg, type = 'success') => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingPet) {
        await petService.updatePet(editingPet.id, formData);
        showFeedback('Pet updated successfully.');
      } else {
        await petService.createPet(formData);
        showFeedback('Pet registered successfully.');
      }
      setShowModal(false);
      setEditingPet(null);
      setFormData(EMPTY_FORM);
      fetchMyPets();
    } catch {
      showFeedback('Failed to save pet. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (pet) => {
    setEditingPet(pet);
    setFormData({
      name: pet.name || '',
      species: pet.species || pet.type || 'dog',
      breed: pet.breed || '',
      color: pet.color || '',
      gender: pet.gender || 'male',
      birthday: pet.birthday || '',
      description: pet.description || '',
      medicalHistory: pet.medicalHistory || '',
      registrationType: pet.registrationType || 'adoption',
      image: pet.image || '',
      vaccinationCard: pet.vaccinationCard || ''
    });
    setShowModal(true);
  };

  const handleDeleteConfirmed = async () => {
    try {
      await petService.deletePet(deleteConfirm.id);
      setDeleteConfirm(null);
      showFeedback('Pet removed successfully.');
      fetchMyPets();
    } catch {
      showFeedback('Failed to delete pet.', 'error');
    }
  };

  const field = (key, val) => setFormData(f => ({ ...f, [key]: val }));

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Pets</h1>
            <p className="text-gray-500 mt-1">Register and manage your pets.</p>
          </div>
          <button
            onClick={() => { setShowModal(true); setEditingPet(null); setFormData(EMPTY_FORM); }}
            className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary-dark font-medium"
          >
            + Register Pet
          </button>
        </div>

        {feedback && (
          <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
            feedback.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {feedback.msg}
          </div>
        )}

        {pets.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <p className="text-gray-600 font-medium">No pets registered yet</p>
            <p className="text-sm text-gray-400 mt-1">Click "Register Pet" to add your first pet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map(pet => (
              <div key={pet.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <img
                  src={pet.image || 'https://via.placeholder.com/400x200?text=No+Image'}
                  alt={pet.name}
                  className="w-full h-44 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{pet.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      pet.registrationType === 'adoption' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {pet.registrationType === 'adoption' ? 'For Adoption' : 'For Appointment'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{pet.breed} · {pet.species || pet.type} · {pet.gender}</p>
                  {pet.color && <p className="text-xs text-gray-400 mt-0.5">Color: {pet.color}</p>}
                  {pet.birthday && (
                    <p className="text-xs text-gray-400">
                      Born: {new Date(pet.birthday).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  )}
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => handleEdit(pet)}
                      className="flex-1 border border-primary text-primary px-3 py-1.5 rounded-lg hover:bg-green-50 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(pet)}
                      className="flex-1 border border-red-300 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 text-sm font-medium"
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

      {/* Register / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { if (!saving) { setShowModal(false); setEditingPet(null); } }}
        title={editingPet ? 'Edit Pet' : 'Register Pet'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Pet Name <span className="text-red-500">*</span></label>
              <input type="text" value={formData.name} onChange={e => field('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Species <span className="text-red-500">*</span></label>
              <select value={formData.species} onChange={e => field('species', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="bird">Bird</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender <span className="text-red-500">*</span></label>
              <select value={formData.gender} onChange={e => field('gender', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Breed <span className="text-red-500">*</span></label>
              <input type="text" value={formData.breed} onChange={e => field('breed', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color <span className="text-red-500">*</span></label>
              <input type="text" value={formData.color} onChange={e => field('color', e.target.value)}
                placeholder="e.g. Golden, Black & White"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Birthday <span className="text-red-500">*</span></label>
              <input type="date" value={formData.birthday} onChange={e => field('birthday', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registration Type <span className="text-red-500">*</span></label>
              <select value={formData.registrationType} onChange={e => field('registrationType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="adoption">For Adoption</option>
                <option value="appointment">For Appointment</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
            <textarea value={formData.description} onChange={e => field('description', e.target.value)}
              rows={3} placeholder="Describe your pet's personality, habits, and needs..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Medical History</label>
            <textarea value={formData.medicalHistory} onChange={e => field('medicalHistory', e.target.value)}
              rows={2} placeholder="Known conditions, past treatments, allergies..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pet Image URL <span className="text-red-500">*</span></label>
            <input type="url" value={formData.image} onChange={e => field('image', e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vaccination Card URL <span className="text-gray-400 font-normal">(optional)</span></label>
            <input type="url" value={formData.vaccinationCard} onChange={e => field('vaccinationCard', e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <button type="submit" disabled={saving}
            className="w-full bg-primary text-white py-2.5 rounded-lg hover:bg-primary-dark disabled:opacity-60 font-medium text-sm">
            {saving ? 'Saving...' : editingPet ? 'Update Pet' : 'Register Pet'}
          </button>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Remove Pet</h3>
            <p className="text-sm text-gray-600 mb-5">
              Are you sure you want to remove <span className="font-medium text-gray-900">{deleteConfirm.name}</span>? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium">
                Cancel
              </button>
              <button onClick={handleDeleteConfirmed}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 text-sm font-medium">
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default MyPets;
