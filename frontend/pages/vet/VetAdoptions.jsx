import React from 'react';
import { useState, useEffect } from 'react';
import VetLayout from '../../components/VetLayout';
import Pagination from '../../components/Pagination';
import { vetService } from '../../services/vetService';
import { useBadge } from '../../contexts/BadgeContext';

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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete</h3>

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
            Waiver <span className="text-red-500">*</span>
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
            Service (opt.)
          </label>
          <input
            type="text"
            value={service}
            onChange={e => setService(e.target.value)}
            placeholder="Health check, Deworming…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (opt.)
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="Notes…"
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
            {loading ? 'Uploading…' : 'Complete'}
          </button>
        </div>
      </div>
    </div>
  );
};

const VetAdoptions = () => {
  const { clear } = useBadge();
  const [adoptions, setAdoptions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAdoption, setSelectedAdoption] = useState(null);
  const [loading, setLoading] = useState(true);
  const [successId, setSuccessId] = useState(null);

  useEffect(() => {
    clear('/vet/adoptions');
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
          <h1 className="text-3xl font-bold text-gray-900">Adoptions</h1>
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-600 font-medium">No adoptions</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pet</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adopter</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {adoptions.map(adoption => (
                      <tr key={adoption.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {adoption.petName}
                          {adoption.message && (
                            <p className="text-xs text-gray-400 mt-0.5 italic max-w-[160px] truncate"
                              title={adoption.message}>
                              "{adoption.message}"
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{adoption.adopterName}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div>{adoption.adopterEmail}</div>
                          <div className="text-xs text-gray-400">{adoption.adopterPhone}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {formatDate(adoption.createdAt)}
                          {adoption.status === 'completed' && adoption.completedAt && (
                            <p className="text-xs text-green-600 mt-0.5">
                              Done {formatDate(adoption.completedAt)}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLES[adoption.status] || 'bg-gray-100 text-gray-600'}`}>
                            {adoption.status.charAt(0).toUpperCase() + adoption.status.slice(1)}
                          </span>
                          {adoption.waiverDocument && (
                            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[100px]"
                              title={adoption.waiverDocument}>
                              {adoption.waiverDocument}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {adoption.status === 'approved' && (
                            <button
                              onClick={() => setSelectedAdoption(adoption)}
                              className="px-3 py-1.5 bg-primary text-white text-xs rounded-lg hover:bg-primary-dark font-medium"
                            >
                              Complete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </>
        )}
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
