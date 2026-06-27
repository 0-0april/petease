import React from 'react';
import { useState, useEffect } from 'react';
import VetLayout from '../../components/VetLayout';
import Pagination from '../../components/Pagination';
import { vetService } from '../../services/vetService';

const STATUS_STYLES = {
  approved:  'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
};

const CompleteModal = ({ adoption, onConfirm, onClose }) => {
  const [waiverFile, setWaiverFile] = useState(null);
  const [service, setService] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (PDF, images)
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a PDF or image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setWaiverFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!waiverFile) return;
    setLoading(true);
    try {
      await onConfirm({ waiverFile, service, notes });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Complete Adoption</h3>
        <p className="text-sm text-gray-500 mb-4">
          Finalize the adoption of <span className="font-medium text-gray-700">{adoption.petName}</span> by{' '}
          <span className="font-medium text-gray-700">{adoption.adopterName}</span>.
        </p>

        {/* Parties info */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Adopter</p>
            <p className="text-sm font-medium text-gray-900">{adoption.adopterName}</p>
            <p className="text-xs text-gray-500">{adoption.adopterEmail}</p>
            <p className="text-xs text-gray-500">{adoption.adopterPhone}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Pet</p>
            <p className="text-sm font-medium text-gray-900">{adoption.petName}</p>
            <p className="text-xs text-gray-500">ID: {adoption.petId}</p>
          </div>
        </div>

        {/* Waiver */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Waiver Document <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
          />
          {waiverFile && (
            <p className="mt-2 text-sm text-green-600">
              ✓ Selected: {waiverFile.name} ({(waiverFile.size / 1024).toFixed(2)} KB)
            </p>
          )}
          <div className="mt-2 bg-blue-50 rounded-lg px-3 py-2 text-xs text-blue-800 space-y-0.5">
            <p className="font-medium">Waiver Requirements:</p>
            <p>✓ Owner signature</p>
            <p>✓ Adopter signature</p>
            <p>✓ Vet staff witness signature</p>
            <p className="text-gray-600 mt-1">Accepted: PDF, JPG, PNG (max 5MB)</p>
          </div>
        </div>

        {/* Medical record */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service Performed <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={service}
            onChange={e => setService(e.target.value)}
            placeholder="e.g. General health check, Deworming, Vaccination..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Medical Notes <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="Notes about the pet's condition or services rendered during the meetup..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!waiverFile || loading}
            className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
          >
            {loading ? 'Uploading...' : 'Mark as Completed'}
          </button>
        </div>
      </div>
    </div>
  );
};

const VetAdoptions = () => {
  const [adoptions, setAdoptions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAdoption, setSelectedAdoption] = useState(null);
  const [loading, setLoading] = useState(true);
  const [successId, setSuccessId] = useState(null);

  useEffect(() => {
    fetchAdoptions();
  }, [currentPage]);

  const fetchAdoptions = async () => {
    setLoading(true);
    try {
      const data = await vetService.getApprovedAdoptions(currentPage, 10);
      setAdoptions(data.adoptions);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching adoptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async ({ waiverFile, service, notes }) => {
    const formData = new FormData();
    formData.append('waiver', waiverFile);
    formData.append('service', service || '');
    formData.append('notes', notes || '');
    formData.append('petId', selectedAdoption.petId);

    await vetService.completeAdoption(selectedAdoption.id, formData);
    setSuccessId(selectedAdoption.id);
    setSelectedAdoption(null);
    fetchAdoptions();
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <VetLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Adoption Management</h1>
          <p className="text-gray-500 mt-1">Approved adoptions awaiting vet processing and waiver signing.</p>
        </div>

        {successId && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <p className="text-sm text-green-800 font-medium">Adoption #{successId} marked as completed.</p>
            <button onClick={() => setSuccessId(null)} className="text-green-600 hover:text-green-800 text-lg leading-none">×</button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        ) : adoptions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-600 font-medium">No approved adoptions yet</p>
            <p className="text-sm text-gray-400 mt-1">Approved adoption requests will appear here for processing.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {adoptions.map(adoption => (
              <div key={adoption.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{adoption.petName}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[adoption.status] || 'bg-gray-100 text-gray-600'}`}>
                        {adoption.status.charAt(0).toUpperCase() + adoption.status.slice(1)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600 mb-2">
                      <span><span className="text-gray-400">Adopter:</span> {adoption.adopterName}</span>
                      <span><span className="text-gray-400">Email:</span> {adoption.adopterEmail}</span>
                      <span><span className="text-gray-400">Phone:</span> {adoption.adopterPhone}</span>
                      <span><span className="text-gray-400">Submitted:</span> {formatDate(adoption.createdAt)}</span>
                    </div>
                    {adoption.message && (
                      <p className="text-sm text-gray-500 italic bg-gray-50 rounded-lg px-3 py-2">"{adoption.message}"</p>
                    )}
                    {adoption.status === 'completed' && adoption.completedAt && (
                      <p className="text-xs text-green-700 mt-2">Completed on {formatDate(adoption.completedAt)}</p>
                    )}
                    {adoption.waiverDocument && (
                      <p className="text-xs text-gray-400 mt-1">Waiver: {adoption.waiverDocument}</p>
                    )}
                  </div>

                  {adoption.status === 'approved' && (
                    <button
                      onClick={() => setSelectedAdoption(adoption)}
                      className="flex-shrink-0 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark text-sm font-medium"
                    >
                      Complete Adoption
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {selectedAdoption && (
        <CompleteModal
          adoption={selectedAdoption}
          onConfirm={handleComplete}
          onClose={() => setSelectedAdoption(null)}
        />
      )}
    </VetLayout>
  );
};

export default VetAdoptions;
