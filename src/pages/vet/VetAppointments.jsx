import { useState, useEffect } from 'react';
import VetLayout from '../../components/VetLayout';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import { vetService } from '../../services/vetService';

const STATUS_STYLES = {
  confirmed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
};

const SERVICE_LABELS = {
  consultation: 'Consultation',
  'anti-rabies': 'Rabies Vaccination',
  spay: 'Spay',
  neuter: 'Neuter',
};

const VetAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('pending'); // pending, confirmed, completed
  const [filterDate, setFilterDate] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [attendanceModal, setAttendanceModal] = useState(null);
  const [logs, setLogs] = useState([]);
  const [toast, setToast] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    fetchAppointments();
  }, [currentPage, activeTab]);

  useEffect(() => {
    // Clear selections when changing tabs
    setSelectedIds([]);
  }, [activeTab]);

  const fetchAppointments = async () => {
    try {
      const data = await vetService.getAllAppointments(currentPage, 10);
      console.log('📅 Fetched appointments:', data.appointments.length);
      console.log('📊 Sample appointment:', data.appointments[0]);
      setAppointments(data.appointments);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleViewDetails = async (appointment) => {
    try {
      // Fetch full appointment details with all information
      const fullDetails = await vetService.getAppointmentById(appointment.id);
      setSelectedAppointment(fullDetails);
      
      // Fetch appointment logs
      const appointmentLogs = await vetService.getAppointmentLogs(appointment.id);
      setLogs(appointmentLogs);
    } catch (error) {
      console.error('Error fetching appointment details:', error);
      setLogs([]);
    }
    setShowDetailModal(true);
  };

  const handleConfirm = async (id) => {
    try {
      await vetService.confirmAppointment(id);
      fetchAppointments();
      showToast('Appointment confirmed.');
    } catch {
      showToast('Failed to confirm appointment.', 'error');
    }
  };

  const handleBulkConfirm = async () => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(selectedIds.map(id => vetService.confirmAppointment(id)));
      setSelectedIds([]);
      fetchAppointments();
      showToast(`${selectedIds.length} appointment(s) confirmed.`);
    } catch {
      showToast('Failed to confirm appointments.', 'error');
    }
  };

  const handleBulkCancel = () => {
    if (selectedIds.length === 0) return;
    setCancelModal({ id: 'bulk', ids: selectedIds });
    setCancelReason('');
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === displayed.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayed.map(apt => apt.id));
    }
  };

  const handleCancelSubmit = async () => {
    if (!cancelReason.trim()) return;
    try {
      if (cancelModal.id === 'bulk') {
        // Bulk cancel
        await Promise.all(cancelModal.ids.map(id => vetService.cancelAppointment(id, cancelReason)));
        setSelectedIds([]);
        showToast(`${cancelModal.ids.length} appointment(s) cancelled.`);
      } else {
        // Single cancel
        await vetService.cancelAppointment(cancelModal.id, cancelReason);
        showToast('Appointment cancelled.');
      }
      setCancelModal(null);
      setCancelReason('');
      fetchAppointments();
    } catch {
      showToast('Failed to cancel appointment.', 'error');
    }
  };

  const handleMarkAttendance = async (attended) => {
    if (!attendanceModal) return;
    try {
      await vetService.markAttendance(attendanceModal.id, attended);
      if (attended) {
        // Only create medical history if patient showed up
        await vetService.addMedicalHistory(attendanceModal.pets[0]?.id, {
          medication: SERVICE_LABELS[attendanceModal.type] || attendanceModal.type,
          date: attendanceModal.date,
          notes: `Service performed: ${SERVICE_LABELS[attendanceModal.type] || attendanceModal.type}. Appointment on ${attendanceModal.date}.`,
          diagnosis: '',
          treatment: SERVICE_LABELS[attendanceModal.type] || attendanceModal.type,
          followUp: ''
        });
      }
      setAttendanceModal(null);
      fetchAppointments();
      showToast(attended ? 'Marked as Show. Medical record updated.' : 'Marked as No Show.');
    } catch (error) {
      console.error('Error marking attendance:', error);
      showToast('Failed to update attendance.', 'error');
    }
  };

  const handleExportCSV = async () => {
    try {
      const completedAppointments = appointments.filter(a => a.status === 'completed' && a.attended === true);
      const csvContent = await vetService.exportAppointmentsToCSV(completedAppointments);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `completed-appointments-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      showToast('CSV exported successfully.');
    } catch {
      showToast('Failed to export CSV.', 'error');
    }
  };

  const displayed = appointments
    .filter(a => {
      // Filter by tab (requirement 23)
      if (activeTab === 'pending' && a.status !== 'pending') return false;
      if (activeTab === 'confirmed' && a.status !== 'confirmed') return false;
      // Completed tab: show appointments where LogAttendance = true (marked as "Show")
      if (activeTab === 'completed') {
        console.log(`🔍 Checking appointment ${a.id}: attended=${a.attended}, status=${a.status}`);
        if (a.attended !== true) return false;
      }

      // Filter by date
      if (filterDate && a.date !== filterDate) return false;

      // Search by user name
      if (searchQuery && !a.userName.toLowerCase().includes(searchQuery.toLowerCase())) return false;

      return true;
    })
    .sort((a, b) => {
      const diff = new Date(a.date) - new Date(b.date);
      return sortOrder === 'asc' ? diff : -diff;
    });

  console.log(`📋 Active tab: ${activeTab}, Total appointments: ${appointments.length}, Displayed: ${displayed.length}`);

  return (
    <VetLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Appointments Management</h1>
          {activeTab === 'completed' && (
            <button
              onClick={handleExportCSV}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark flex items-center space-x-2 text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export CSV</span>
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1 space-x-1">
          {[
            { value: 'pending', label: 'Pending Appointments' },
            { value: 'confirmed', label: 'Confirmed Appointments' },
            { value: 'completed', label: 'Completed Appointments' },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => { setActiveTab(tab.value); setCurrentPage(1); }}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.value ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          {activeTab === 'pending' && selectedIds.length > 0 && (
            <div className="flex gap-2 items-center bg-blue-50 px-4 py-2 rounded-lg">
              <span className="text-sm font-medium text-blue-900">{selectedIds.length} selected</span>
              <button
                onClick={handleBulkConfirm}
                className="px-3 py-1 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
              >
                Confirm All
              </button>
              <button
                onClick={handleBulkCancel}
                className="px-3 py-1 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
              >
                Cancel All
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50"
              >
                Clear
              </button>
            </div>
          )}
          <input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            placeholder="Filter by date"
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {activeTab === 'completed' && (
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by user name..."
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary flex-1 min-w-[200px]"
            />
          )}
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
          {(filterDate || searchQuery) && (
            <button
              onClick={() => { setFilterDate(''); setSearchQuery(''); }}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg"
            >
              Clear Filters
            </button>
          )}
        </div>

        {toast && (
          <div className={`rounded-xl px-4 py-3 text-sm font-medium ${toast.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'
            }`}>
            {toast.msg}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {activeTab === 'pending' && (
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={displayed.length > 0 && selectedIds.length === displayed.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pet(s)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayed.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'pending' ? 8 : 7} className="px-6 py-10 text-center text-gray-400 text-sm">
                    No appointments found.
                  </td>
                </tr>
              ) : displayed.map(apt => (
                <tr key={apt.id} className="hover:bg-gray-50">
                  {activeTab === 'pending' && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(apt.id)}
                        onChange={() => toggleSelection(apt.id)}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                    </td>
                  )}
                  <td className="px-6 py-4 text-sm text-gray-500">#{apt.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{apt.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {SERVICE_LABELS[apt.type] || apt.type}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{apt.userName}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {apt.pets.map(p => p.name).join(', ')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${STATUS_STYLES[apt.status] || 'bg-gray-100 text-gray-600'}`}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleViewDetails(apt)}
                        className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                      >
                        View
                      </button>
                      {activeTab === 'pending' && (
                        <>
                          <button
                            onClick={() => handleConfirm(apt.id)}
                            className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => { setCancelModal(apt); setCancelReason(''); }}
                            className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {activeTab === 'confirmed' && (
                        <button
                          onClick={() => setAttendanceModal(apt)}
                          className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors"
                        >
                          Mark Attendance
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {/* Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Appointment Details">
        {selectedAppointment && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Owner Name</p>
                <p className="font-semibold">{selectedAppointment.userName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Owner Phone</p>
                <p className="font-semibold">{selectedAppointment.userPhone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500">Owner Address</p>
                <p className="font-semibold">{selectedAppointment.userAddress || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Scheduled Date</p>
                <p className="font-semibold">{selectedAppointment.date}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${STATUS_STYLES[selectedAppointment.status] || 'bg-gray-100 text-gray-600'}`}>
                  {selectedAppointment.status}
                </span>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500">Service</p>
                <p className="font-semibold capitalize">
                  {SERVICE_LABELS[selectedAppointment.type] || selectedAppointment.type}
                </p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">Pet Information</p>
              {selectedAppointment.pets.map(pet => (
                <div key={pet.id} className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Pet Name</p>
                      <p className="font-semibold">{pet.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Species</p>
                      <p className="font-semibold">{pet.species || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Breed</p>
                      <p className="font-semibold">{pet.breed}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Gender</p>
                      <p className="font-semibold">{pet.gender || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Age</p>
                      <p className="font-semibold">{pet.age || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Markings</p>
                      <p className="font-semibold">{pet.markings || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Medical Records</p>
              {selectedAppointment.medicalRecords && selectedAppointment.medicalRecords.length > 0 ? (
                <div className="space-y-2">
                  {selectedAppointment.medicalRecords.map((record, idx) => (
                    <div key={idx} className="text-sm border-l-2 border-primary pl-3 bg-gray-50 p-2 rounded">
                      <p className="font-medium">{record.medicine}</p>
                      <p className="text-gray-600 text-xs">{record.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {record.date ? new Date(record.date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No medical records available.</p>
              )}
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Activity Log</p>
              {logs.length === 0 ? (
                <p className="text-sm text-gray-400">No activity recorded.</p>
              ) : (
                <div className="space-y-2">
                  {logs.map(log => (
                    <div key={log.id} className="text-sm border-l-2 border-primary pl-3">
                      <p className="font-medium capitalize">{log.action}</p>
                      <p className="text-gray-600">{log.notes}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(log.timestamp).toLocaleString()} · {log.performedBy}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Modal */}
      <Modal isOpen={!!cancelModal} onClose={() => setCancelModal(null)} title="Cancel Appointment">
        {cancelModal && (
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Cancel appointment for <span className="font-semibold">{cancelModal.userName}</span> on{' '}
              <span className="font-semibold">{cancelModal.date}</span>?
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                rows={3}
                placeholder="Enter cancellation reason..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setCancelModal(null)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                Back
              </button>
              <button
                onClick={handleCancelSubmit}
                disabled={!cancelReason.trim()}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
              >
                Cancel Appointment
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Attendance Modal */}
      <Modal isOpen={!!attendanceModal} onClose={() => setAttendanceModal(null)} title="Mark Attendance">
        {attendanceModal && (
          <div className="space-y-4">
            <p className="text-gray-700">
              Mark attendance for <span className="font-semibold">{attendanceModal.userName}</span>'s appointment on{' '}
              <span className="font-semibold">{attendanceModal.date}</span>
            </p>
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-sm text-blue-800">
              If marked as "Show", a medical record will be automatically created for{' '}
              <span className="font-medium">{attendanceModal.pets.map(p => p.name).join(', ')}</span> with the service:{' '}
              <span className="font-medium">{SERVICE_LABELS[attendanceModal.type] || attendanceModal.type}</span>.
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setAttendanceModal(null)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleMarkAttendance(false)}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 text-sm font-medium"
              >
                No Show
              </button>
              <button
                onClick={() => handleMarkAttendance(true)}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
              >
                Show
              </button>
            </div>
          </div>
        )}
      </Modal>
    </VetLayout>
  );
};

export default VetAppointments;
