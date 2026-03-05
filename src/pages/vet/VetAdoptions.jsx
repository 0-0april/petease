import { useState, useEffect } from 'react';
import VetLayout from '../../components/VetLayout';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import { vetService } from '../../services/vetService';

const VetAdoptions = () => {
  const [adoptions, setAdoptions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showWaiverModal, setShowWaiverModal] = useState(false);
  const [selectedAdoption, setSelectedAdoption] = useState(null);
  const [waiverFile, setWaiverFile] = useState('');

  useEffect(() => {
    fetchAdoptions();
  }, [currentPage]);

  const fetchAdoptions = async () => {
    try {
      const data = await vetService.getPendingAdoptions(currentPage, 10);
      setAdoptions(data.adoptions);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching adoptions:', error);
    }
  };

  const handleUploadWaiver = (adoption) => {
    setSelectedAdoption(adoption);
    setShowWaiverModal(true);
  };

  const handleSubmitWaiver = async (e) => {
    e.preventDefault();
    if (!waiverFile) {
      alert('Please enter waiver document name');
      return;
    }
    try {
      await vetService.confirmAdoptionWithWaiver(selectedAdoption.id, {
        waiverDocument: waiverFile
      });
      setShowWaiverModal(false);
      setWaiverFile('');
      fetchAdoptions();
      alert('Adoption confirmed with waiver uploaded successfully');
    } catch (error) {
      alert('Failed to upload waiver');
    }
  };

  return (
    <VetLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Adoption Management</h1>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pet Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adopter</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {adoptions.map(adoption => (
                <tr key={adoption.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{adoption.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{adoption.petName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{adoption.adopterName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{adoption.ownerId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(adoption.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                      {adoption.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleUploadWaiver(adoption)}
                      className="text-primary hover:text-primary-dark"
                    >
                      Upload Waiver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {adoptions.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600">No pending adoptions</p>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <Modal
        isOpen={showWaiverModal}
        onClose={() => setShowWaiverModal(false)}
        title="Upload Adoption Waiver"
      >
        {selectedAdoption && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">Pet: <span className="font-semibold">{selectedAdoption.petName}</span></p>
              <p className="text-sm text-gray-600">Adopter: <span className="font-semibold">{selectedAdoption.adopterName}</span></p>
              <p className="text-sm text-gray-600">Owner ID: <span className="font-semibold">{selectedAdoption.ownerId}</span></p>
            </div>

            <form onSubmit={handleSubmitWaiver} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Waiver Document Name</label>
                <input
                  type="text"
                  value={waiverFile}
                  onChange={(e) => setWaiverFile(e.target.value)}
                  placeholder="e.g., waiver-adoption-001.pdf"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the name of the signed waiver document
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-sm text-blue-900 font-semibold mb-2">Waiver Requirements:</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ Owner signature required</li>
                  <li>✓ Adopter signature required</li>
                  <li>✓ Vet staff witness signature required</li>
                </ul>
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary-dark"
              >
                Confirm Adoption & Upload Waiver
              </button>
            </form>
          </div>
        )}
      </Modal>
    </VetLayout>
  );
};

export default VetAdoptions;
