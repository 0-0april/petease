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
  const [searching, setSearching] = useState(false);
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
    setSearching(true);
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
    } finally {
      setSearching(false);
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Medical Records</h1>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Search Pet by ID</h2>
          <div className="flex gap-3">
            <input
              type="number"
              value={searchPetId}
              onChange={(e) => setSearchPetId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter Pet ID"
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              disabled={searching || !searchPetId}
              className="bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary-dark disabled:opacity-50 text-sm font-medium transition-colors"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {selectedPet && (
          <>
            {/* Pet Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedPet.name}</h2>
                  <p className="text-gray-500 mt-1 text-sm">
                    {selectedPet.breed} · {selectedPet.age} yrs · <span className="capitalize">{selectedPet.gender}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Owner ID: {selectedPet.ownerId}</p>
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="self-start bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary-dark text-sm font-medium transition-colors"
                >
                  + Add Record
                </button>
              </div>
            </div>

            {/* Medical History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6">
              <h2 className="text-base font-semibold text-gray-800 mb-4">Medical History</h2>
              {medicalHistory.length === 0 ? (
                <div className="text-center py-10">
                  <svg className="w-12 h-12 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500 text-sm">No medical records yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {medicalHistory.map(record => (
                    <div key={record.id} className="border-l-4 border-primary pl-4 py-3 bg-gray-50 rounded-r-lg">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                        <p className="font-semibold text-gray-900">{record.medication}</p>
                        <p className="text-xs text-gray-400 shrink-0">
                          {new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      {record.diagnosis && (
                        <p className="text-sm text-gray-700 mt-1">
                          <span className="font-medium text-gray-600">Diagnosis:</span> {record.diagnosis}
                        </p>
                      )}
                      {record.treatment && (
                        <p className="text-sm text-gray-700 mt-1">
                          <span className="font-medium text-gray-600">Treatment:</span> {record.treatment}
                        </p>
                      )}
                      {record.notes && (
                        <p className="text-sm text-gray-700 mt-1">
                          <span className="font-medium text-gray-600">Notes:</span> {record.notes}
                        </p>
                      )}
                      {record.followUp && (
                        <p className="text-sm text-gray-700 mt-1">
                          <span className="font-medium text-gray-600">Follow-up:</span> {record.followUp}
                        </p>
                      )}
                      {record.veterinarian && (
                        <p className="text-xs text-gray-400 mt-2">By: {record.veterinarian}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Medical Record">
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Medication / Vaccine <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.medication}
              onChange={(e) => setFormData({ ...formData, medication: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
            <input
              type="text"
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Treatment</label>
            <input
              type="text"
              value={formData.treatment}
              onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes <span className="text-red-500">*</span></label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows="3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Instructions</label>
            <textarea
              value={formData.followUp}
              onChange={(e) => setFormData({ ...formData, followUp: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows="2"
            />
          </div>
          <div className="flex space-x-3 pt-1">
            <button type="button" onClick={() => setShowModal(false)}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark text-sm font-medium">
              Add Record
            </button>
          </div>
        </form>
      </Modal>
    </VetLayout>
  );
};

export default VetMedicalRecords;
