import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import { adminService } from '../../services/adminService';
import { useBadge } from '../../contexts/BadgeContext';

const PAGE_SIZE = 10;

const STATUS_STYLES = {
  'Open':         'bg-yellow-100 text-yellow-800',
  'Under Review': 'bg-orange-100 text-orange-800',
  'Resolved':     'bg-red-100 text-red-800',
  'Dismissed':    'bg-gray-100 text-gray-800',
  'Suspended':    'bg-red-100 text-red-800',
};

// Derive the display status: if the reported user is suspended, override badge to "Suspended"
const getDisplayStatus = (report) => {
  if (report.reportedUserAccStatus === 'Suspended') return 'Suspended';
  return report.status;
};

const AdminReports = () => {
  const { clear } = useBadge();
  const [reports, setReports]               = useState([]);
  const [currentPage, setCurrentPage]       = useState(1);
  const [loading, setLoading]               = useState(true);
  const [toast, setToast]                   = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [pendingAction, setPendingAction]   = useState(null); // 'Resolved' | 'Warning' | 'Closed'

  useEffect(() => {
    clear('/admin/reports');
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await adminService.getReports();
      setReports(data || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleReview = (report) => {
    setSelectedReport(report);
    setPendingAction(null);
    setShowReviewModal(true);
  };

  const handleUpdateStatus = async (status) => {
    try {
      await adminService.updateReportStatus(selectedReport.id, status, selectedReport.reportedUserId);
      showToast(`Report marked as ${status}.`);
      setShowReviewModal(false);
      setSelectedReport(null);
      fetchReports();
    } catch {
      showToast('Failed to update report.', 'error');
    }
  };

  const totalPages = Math.max(1, Math.ceil(reports.length / PAGE_SIZE));
  const paginated  = reports.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage Reports</h1>

        {toast && (
          <div className={`rounded-xl px-4 py-3 text-sm font-medium border ${
            toast.type === 'error'
              ? 'bg-red-50 text-red-800 border-red-200'
              : 'bg-green-50 text-green-800 border-green-200'
          }`}>
            {toast.msg}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reported User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reported By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400 text-sm">Loading…</td></tr>
                ) : paginated.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400 text-sm">No reports found.</td></tr>
                ) : paginated.map(report => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{report.reportedUserName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{report.reportedByName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs">{report.reason}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${STATUS_STYLES[getDisplayStatus(report)] || 'bg-gray-100 text-gray-800'}`}>
                        {getDisplayStatus(report)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {report.reportedUserAccStatus === 'Suspended' ? (
                        <span className="text-xs text-gray-400">Done</span>
                      ) : (report.status === 'Open' || report.status === 'Under Review') ? (
                        <button
                          onClick={() => handleReview(report)}
                          className="px-3 py-1.5 rounded-md text-xs font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
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
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {/* Review Modal */}
      <Modal isOpen={showReviewModal} onClose={() => { setShowReviewModal(false); setPendingAction(null); }} title="Review Report">
        {selectedReport && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg space-y-3">
              <div>
                <p className="text-xs text-gray-500">Reported User</p>
                <p className="text-sm font-semibold text-gray-900">{selectedReport.reportedUserName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Reported By</p>
                <p className="text-sm font-semibold text-gray-900">{selectedReport.reportedByName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Reason</p>
                <p className="text-sm font-semibold text-gray-900">{selectedReport.reason}</p>
              </div>
              {selectedReport.description && (
                <div>
                  <p className="text-xs text-gray-500">Description</p>
                  <p className="text-sm text-gray-800">{selectedReport.description}</p>
                </div>
              )}
              {selectedReport.messageLog && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Message Log</p>
                  <pre className="text-xs text-gray-700 bg-white border border-gray-200 rounded p-3 whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {selectedReport.messageLog}
                  </pre>
                </div>
              )}
            </div>

            {!pendingAction ? (
              <>
                <p className="text-sm font-medium text-gray-700">Take Action:</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setPendingAction('Resolved')}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700"
                  >
                    Suspend
                  </button>
                  <button
                    onClick={() => setPendingAction('Warning')}
                    className="flex-1 bg-yellow-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-yellow-600"
                  >
                    Warning
                  </button>
                  <button
                    onClick={() => setPendingAction('Closed')}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg text-sm font-medium hover:bg-gray-300"
                  >
                    Dismiss
                  </button>
                </div>
              </>
            ) : (
              <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                <p className="text-sm text-gray-700">
                  {pendingAction === 'Resolved' && <>Are you sure you want to <span className="font-semibold text-red-600">suspend {selectedReport.reportedUserName}</span>?</>}
                  {pendingAction === 'Warning'  && <>Are you sure you want to <span className="font-semibold text-yellow-600">send a warning to {selectedReport.reportedUserName}</span>?</>}
                  {pendingAction === 'Closed'   && <>Are you sure you want to <span className="font-semibold text-gray-600">dismiss this report</span>?</>}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleUpdateStatus(pendingAction)}
                    className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-primary-dark"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setPendingAction(null)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
};

export default AdminReports;
