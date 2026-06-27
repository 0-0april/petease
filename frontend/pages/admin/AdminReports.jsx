import React from 'react';
import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import { adminService } from '../../services/adminService';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [toast, setToast] = useState(null);

  // For review modal
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [currentPage]);

  const fetchReports = async () => {
    try {
      // Fetch all reports (pending, etc)
      const data = await adminService.getAllReports(currentPage, 10, 'all');
      setReports(data.reports);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleReview = (report) => {
    setSelectedReport(report);
    setShowReviewModal(true);
  };

  const handleDisableAccount = async () => {
    if (window.confirm(`Are you sure you want to disable ${selectedReport.reportedUserName}'s account?`)) {
      try {
        await adminService.updateUserStatus(selectedReport.reportedUserId, 'disabled');
        // Resolve the report
        await adminService.resolveReport(selectedReport.id, 'Account Disabled');
        showToast('Account disabled and report resolved.');
        setShowReviewModal(false);
        fetchReports();
      } catch (error) {
        showToast('Failed to disable account.', 'error');
      }
    }
  };

  const handleIgnore = async () => {
    try {
      await adminService.dismissReport(selectedReport.id);
      showToast('Report ignored.');
      setShowReviewModal(false);
      fetchReports();
    } catch (error) {
      showToast('Failed to ignore report.', 'error');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Manage Reports</h1>

        {toast && (
          <div className={`rounded-xl px-4 py-3 text-sm font-medium ${toast.type === 'error'
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-green-50 text-green-800 border border-green-200'
            }`}>
            {toast.msg}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reported User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400 text-sm">No reports found.</td>
                </tr>
              ) : reports.map(report => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    {report.reportedUserName} <span className="text-xs text-gray-500">({report.reportedBy})</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs">{report.reason}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        report.status === 'dismissed' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                      }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {report.status === 'pending' ? (
                      <button
                        onClick={() => handleReview(report)}
                        className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                      >
                        Review
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">Done</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {/* Review Report Modal */}
      <Modal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} title="Review Report">
        {selectedReport && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-500">Reported User</p>
              <p className="font-semibold text-gray-900 mb-3">{selectedReport.reportedUserName}</p>
              
              <p className="text-sm text-gray-500">Reported By</p>
              <p className="font-semibold text-gray-900 mb-3">{selectedReport.reportedBy}</p>

              <p className="text-sm text-gray-500">Reason</p>
              <p className="font-semibold text-gray-900 mb-3">{selectedReport.reason}</p>

              <p className="text-sm text-gray-500">Description</p>
              <p className="text-sm text-gray-800">{selectedReport.description}</p>
            </div>
            
            <p className="text-sm text-gray-700 font-medium pt-2">Take Action:</p>
            <div className="flex space-x-3">
              <button
                onClick={handleDisableAccount}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700"
              >
                Disable Account
              </button>
              <button
                onClick={handleIgnore}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg text-sm font-medium hover:bg-gray-300"
              >
                Ignore
              </button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
};

export default AdminReports;
