import React from 'react';
import { useState } from 'react';
import VetLayout from '../../components/VetLayout';
import Modal from '../../components/Modal';
import { vetService } from '../../services/vetService';
import { petService } from '../../services/petService';

const VetMedicalRecords = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchPetId, setSearchPetId] = useState('');
  const [selectedPet, setSelectedPet] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [formData, setFormData] = useState({
    medication: '',
    diagnosis: '',
    treatment: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    followUp: ''
  });

  const handleSearch = async () => {
    if (!searchPetId) return;
    try {
      const pet = await petService.getPetById(searchPetId);
      if (pet) {
        setSelectedPet(pet);
        const history = await petService.getMedicalHistory(searchPetId);
        setMedicalHistory(history);
      } else {
        alert('Pet not found');
      }
    } catch (error) {
      alert('Error fetching pet information');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPet) {
      alert('Please search and select a pet first');
      return;
    }
    try {
      await vetService.addMedicalHistory(selectedPet.id, formData);
      setShowModal(false);
      setFormData({
        medication: '',
        diagnosis: '',
        treatment: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        followUp: ''
      });
      handleSearch();
      alert('Medical record added successfully');
    } catch (error) {
      alert('Failed to add medical record');
    }
  };

  return (
    <VetLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Medical Records Management</h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Pet</h2>
          <div className="flex space-x-4">
            <input
              type="number"
              value={searchPetId}
              onChange={(e) => setSearchPetId(e.target.value)}
              placeholder="Enter Pet ID"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleSearch}
              className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark"
            >
              Search
            </button>
          </div>
        </div>

        {selectedPet && (
          <>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedPet.name}</h2>
                  <p className="text-gray-600 mt-1">{selectedPet.breed} • {selectedPet.age} years old • {selectedPet.gender}</p>
                  <p className="text-gray-600">Owner ID: {selectedPet.ownerId}</p>
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark"
                >
                  Add Medical Record
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Medical History</h2>
              {medicalHistory.length === 0 ? (
                <p className="text-gray-600">No medical history available</p>
              ) : (
                <div className="space-y-4">
                  {medicalHistory.map(record => (
                    <div key={record.id} className="border-l-4 border-primary pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{record.medication}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Date: {new Date(record.date).toLocaleDateString()}
                          </p>
                          {record.diagnosis && (
                            <p className="text-sm text-gray-700 mt-1">
                              <span className="font-semibold">Diagnosis:</span> {record.diagnosis}
                            </p>
                          )}
                          {record.treatment && (
                            <p className="text-sm text-gray-700 mt-1">
                              <span className="font-semibold">Treatment:</span> {record.treatment}
                            </p>
                          )}
                          <p className="text-sm text-gray-700 mt-1">
                            <span className="font-semibold">Notes:</span> {record.notes}
                          </p>
                          {record.followUp && (
                            <p className="text-sm text-gray-700 mt-1">
                              <span className="font-semibold">Follow-up:</span> {record.followUp}
                            </p>
                          )}
                          {record.veterinarian && (
                            <p className="text-xs text-gray-500 mt-2">
                              By: {record.veterinarian}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Medical Record">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Medication/Vaccine</label>
            <input
              type="text"
              value={formData.medication}
              onChange={(e) => setFormData({ ...formData, medication: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Diagnosis</label>
            <input
              type="text"
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Treatment</label>
            <input
              type="text"
              value={formData.treatment}
              onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              rows="3"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Follow-up Instructions</label>
            <textarea
              value={formData.followUp}
              onChange={(e) => setFormData({ ...formData, followUp: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              rows="2"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary-dark"
          >
            Add Record
          </button>
        </form>
      </Modal>
    </VetLayout>
  );
};

export default VetMedicalRecords;
