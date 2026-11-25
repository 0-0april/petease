import React from 'react';
import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import { petService } from '../../services/petService';

const EMPTY_FORM = {
  name: '',
  species: 'dog',
  breed: '',
  color: '',
  gender: 'Male',
  birthday: '',
  description: '',
  medication: '',
  medDescript: '',
  registrationType: 'adoption',
  image: '',
  vaccinationCard: ''
};

// Check icon used by the global display format
const CheckIcon = () => (
  <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Renders a single verified vet medical history entry (read-only).
const VetMedEntry = ({ record }) => (
  <div className="border-l-2 border-primary pl-3 bg-gray-50 p-3 rounded-r-lg space-y-0.5">
    <div className="flex items-center gap-1.5">
      <CheckIcon />
      <p className="text-sm font-semibold text-gray-900">
        {record.serviceName || 'Vet Service'}
      </p>
    </div>
    {record.medSumDiagnosis && (
      <p className="text-sm text-gray-800">
        <span className="font-medium">Diagnosis:</span> {record.medSumDiagnosis}
      </p>
    )}
    <p className="text-sm text-gray-700">
      <span className="font-medium">Medication:</span> {record.medication || '—'}
    </p>
    {record.medDescript && (
      <p className="text-sm text-gray-600">
        <span className="font-medium">Description:</span> {record.medDescript}
      </p>
    )}
  </div>
);

const MyPets = () => {
  const [pets, setPets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [vaccinationFile, setVaccinationFile] = useState(null);
  const [vaccinationUploading, setVaccinationUploading] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false); // kept for compat but unused — banner moved to Layout
  // Vet medical history rows for the pet currently open in the modal
  const [vetHistory, setVetHistory] = useState([]);
  const [vetHistoryLoading, setVetHistoryLoading] = useState(false);

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

  // Load vet medical history (LogID NOT NULL, MedVerified=true) for a pet
  const loadVetHistory = async (petId) => {
    setVetHistoryLoading(true);
    try {
      const rows = await petService.getMedicalHistory(petId);
      // Owner view: only verified vet rows (LogID NOT NULL + MedVerified=true)
      setVetHistory(rows.filter(r => r.logId != null && r.medVerified === true));
    } catch (err) {
      console.error('Error loading vet history:', err);
      setVetHistory([]);
    } finally {
      setVetHistoryLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Upload vaccination card through backend if a file was selected
      let vaccinationUrl = formData.vaccinationCard || '';
      if (vaccinationFile) {
        if (vaccinationFile.size > 5 * 1024 * 1024) {
          showFeedback('Vaccination card file must be under 5 MB.', 'error');
          setSaving(false);
          return;
        }
        setVaccinationUploading(true);
        vaccinationUrl = await petService.uploadVaccinationCard(vaccinationFile);
        setVaccinationUploading(false);
      }

      const formDataToSend = new FormData();
      formDataToSend.append('petName', formData.name);
      formDataToSend.append('petBDay', formData.birthday);
      formDataToSend.append('petSpecie', formData.species);
      formDataToSend.append('petBreed', formData.breed);
      formDataToSend.append('petMarkings', formData.color);
      formDataToSend.append('petGender', formData.gender);
      formDataToSend.append('petDetails', formData.description);
      formDataToSend.append('petRegType', formData.registrationType === 'adoption' ? 'Adoption' : formData.registrationType === 'both' ? 'Both' : 'Appointment');

      if (imageFile) {
        formDataToSend.append('image', imageFile);
      } else if (formData.image) {
        formDataToSend.append('petImg', formData.image);
      }

      if (vaccinationUrl) {
        formDataToSend.append('vaccinationCard', vaccinationUrl);
      }

      let savedPet;
      if (editingPet) {
        savedPet = await petService.updatePet(editingPet.id, formDataToSend);
        showFeedback('Pet updated successfully.');
      } else {
        savedPet = await petService.createPet(formDataToSend);
        showFeedback('Pet registered successfully.');
      }

      // Persist owner-entered medical history row (Medication / MedDescript)
      // Uses PUT which upserts the single owner row (LogID NULL) for the pet.
      const petId = editingPet?.id || savedPet?.id;
      if (petId) {
        await petService.updateOwnerMedicalHistory(
          petId,
          formData.medication,
          formData.medDescript
        );
      }

      setShowModal(false);
      setEditingPet(null);
      setFormData(EMPTY_FORM);
      setImageFile(null);
      setImagePreview(null);
      setVaccinationFile(null);
      setVetHistory([]);
      fetchMyPets();
    } catch (error) {
      console.error('Save error:', error);
      setVaccinationUploading(false);
      showFeedback('Failed to save pet. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (pet) => {
    setEditingPet(pet);
    let formattedBirthday = '';
    if (pet.birthday) {
      const date = new Date(pet.birthday);
      formattedBirthday = date.toISOString().split('T')[0];
    }

    // Pre-load the existing owner medical row (LogID NULL) if any
    let ownerMedication = '';
    let ownerMedDescript = '';
    try {
      const rows = await petService.getMedicalHistory(pet.id);
      const ownerRow = rows.find(r => r.logId === null);
      if (ownerRow) {
        ownerMedication = ownerRow.medication || '';
        ownerMedDescript = ownerRow.medDescript || '';
      }
    } catch (_) { /* non-fatal */ }

    setFormData({
      name: pet.name || '',
      species: pet.species || pet.type || 'dog',
      breed: pet.breed || '',
      color: pet.color || '',
      gender: pet.gender || 'Male',
      birthday: formattedBirthday,
      description: pet.description || '',
      medication: ownerMedication,
      medDescript: ownerMedDescript,
      registrationType: pet.registrationType || 'adoption',
      image: pet.image || '',
      vaccinationCard: pet.vaccinationCard || ''
    });
    setImageFile(null);
    setImagePreview(pet.image || null);
    setVaccinationFile(null);

    // Load vet history for this pet
    loadVetHistory(pet.id);
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
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
          <h1 className="text-3xl font-bold text-gray-900">My Pets</h1>
          <button
            onClick={() => {
              setShowModal(true);
              setEditingPet(null);
              setFormData(EMPTY_FORM);
              setImageFile(null);
              setImagePreview(null);
              setVaccinationFile(null);
              setVetHistory([]);
            }}
            className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary-dark font-medium"
          >
            + Pet
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
            <p className="text-gray-600 font-medium">No pets</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map(pet => (
              <div key={pet.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <img
                  src={pet.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect width='400' height='200' fill='%23e8f5e9'/%3E%3Ctext x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-size='48' fill='%2381c784'%3E%F0%9F%90%BE%3C/text%3E%3C/svg%3E"}
                  alt={pet.name}
                  className="w-full h-44 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{pet.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      pet.registrationType === 'adoption' ? 'bg-green-100 text-green-700' :
                      pet.registrationType === 'both' ? 'bg-purple-100 text-purple-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {pet.registrationType === 'adoption' ? 'For Adoption' :
                       pet.registrationType === 'both' ? 'Adoption & Appointment' :
                       'For Appointment'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{pet.breed} · {pet.species || pet.type} · {pet.gender}</p>
                  {pet.color && <p className="text-xs text-gray-400 mt-0.5">{pet.color}</p>}
                  {pet.birthday && (
                    <p className="text-xs text-gray-400">
                      {new Date(pet.birthday).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  )}
                  {pet.vaccinationCard && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <a
                        href={pet.vaccinationCard}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-green-700 underline font-medium"
                      >
                        View Vaccination Card
                      </a>
                    </div>
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
        onClose={() => { if (!saving) { setShowModal(false); setEditingPet(null); setVetHistory([]); } }}
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
                <option value="Male">Male</option>
                <option value="Female">Female</option>
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
                <option value="appointment">For Appointment Only</option>
                <option value="both">Both (Adoption + Appointment)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
            <textarea value={formData.description} onChange={e => field('description', e.target.value)}
              rows={3} placeholder="Describe your pet's personality, habits, and needs..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" required />
          </div>

          {/* Owner-entered medical history — saved as LogID NULL row */}
          <div className="border-t pt-4 space-y-3">
            <p className="text-sm font-semibold text-gray-700">Medical History</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Medication</label>
              <input
                type="text"
                value={formData.medication}
                onChange={e => field('medication', e.target.value)}
                placeholder="e.g. Frontline, Heartgard, Amoxicillin…"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.medDescript}
                onChange={e => field('medDescript', e.target.value)}
                rows={2}
                placeholder="Known conditions, past treatments, allergies…"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pet Image <span className="text-red-500">*</span></label>
            {imagePreview && (
              <div className="mb-2">
                <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required={!editingPet && !imagePreview}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vaccination Card <span className="text-gray-400 font-normal">(optional · PDF or image)</span>
            </label>
            {vaccinationFile && (
              <div className="mb-2">
                <p className="text-xs text-gray-500 truncate">{vaccinationFile.name}</p>
              </div>
            )}
            {formData.vaccinationCard && !vaccinationFile && (
              <div className="mb-2">
                <a href={formData.vaccinationCard} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-primary underline">View current vaccination card</a>
              </div>
            )}
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={e => setVaccinationFile(e.target.files[0] || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Read-only Vet Medical History — shown only when editing an existing pet */}
          {editingPet && (
            <div className="border-t pt-4 space-y-3">
              <p className="text-sm font-semibold text-gray-700">Vet Medical History</p>
              {vetHistoryLoading ? (
                <p className="text-xs text-gray-400">Loading…</p>
              ) : vetHistory.length > 0 ? (
                <div className="space-y-2">
                  {vetHistory.map(record => (
                    <VetMedEntry key={record.medId} record={record} />
                  ))}
                </div>
              ) : null /* per spec: render nothing if no rows */}
            </div>
          )}

          <button type="submit" disabled={saving || vaccinationUploading}
            className="w-full bg-primary text-white py-2.5 rounded-lg hover:bg-primary-dark disabled:opacity-60 font-medium text-sm">
            {vaccinationUploading ? 'Uploading card…' : saving ? 'Saving…' : editingPet ? 'Update Pet' : 'Register Pet'}
          </button>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
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
