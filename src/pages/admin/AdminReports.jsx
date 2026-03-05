import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import { adminService } from '../../services/adminService';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolution, setResolution] = useState('');

  useEffect(() => {
    fetchReports();
  }, [currentPage, filter]);

  const fetchReports = async () => {
    try {
      const data = await adminService.getAllReports(currentPage, 10, filter);
      setReports(data.reports);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const handleResolve = (report) => {
    setSelectedReport(report);
    setShowResolveModal(true);
  };

  const handleSubmitResolution = async (e) => {
    e.preventDefault();
    try {
      await adminService.resolveReport(selectedReport.id, resolution);
      setShowResolveModal(false);
      setResolution('');
      fetchReports();
      alert('Report resolved successfully');
    } catch (error) {
      alert('Failed to resolve report');
    }
  };

  const handleDismiss = async (reportId) => {
    if (window.confirm('Are you sure you want to dismiss this report?')) {
      try {
        await adminService.dismissReport(reportId);
        fetchReports();
        alert('Report dismissed');
      } catch (error) {
        alert('Failed to dismiss report');
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">User Reports</h1>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Reports</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>

        <div className="space-y-4">
          {reports.map(report => (
            <div key={report.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Report #{report.id}</h3>
                    <span className={`px-3 py-1 text-xs rounded-full ${
                      report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700">
                      <span className="font-semibold">Reported User:</span> {report.reportedUserName} (ID: {report.reportedUserId})
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Reported By:</span> {report.reportedBy}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Reason:</span> {report.reason}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Description:</span> {report.description}
                    </p>
                    <p className="text-gray-500 text-xs">
                      Reported on: {new Date(report.createdAt).toLocaleString()}
                    </p>
                    {report.status === 'resolved' && (
                      <>
                        <p className="text-gray-700">
                          <span className="font-semibold">Resolution:</span> {report.resolution}
                        </p>
                        <p className="text-gray-500 text-xs">
                          Resolved by {report.resolvedBy} on {new Date(report.resolvedAt).toLocaleString()}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                {report.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleResolve(report)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => handleDismiss(report.id)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {reports.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600">No reports found</p>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <Modal
        isOpen={showResolveModal}
        onClose={() => setShowResolveModal(false)}
        title="Resolve Report"
      >
        {selectedReport && (
          <form onSubmit={handleSubmitResolution} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">Report: <span className="font-semibold">{selectedReport.reason}</span></p>
              <p className="text-sm text-gray-600">User: <span className="font-semibold">{selectedReport.reportedUserName}</span></p>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Resolution Details</label>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                rows="4"
                placeholder="Describe the action taken to resolve this report..."
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary-dark"
            >
              Submit Resolution
            </button>
          </form>
        )}
      </Modal>
    </AdminLayout>
  );
};

export default AdminReports;
