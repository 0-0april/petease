import { useState, useEffect } from 'react';
import VetLayout from '../../components/VetLayout';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import { vetService } from '../../services/vetService';

const VetAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchAppointments();
  }, [currentPage]);

  const fetchAppointments = async () => {
    try {
      const data = await vetService.getAllAppointments(currentPage, 10);
      setAppointments(data.appointments);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleViewDetails = async (appointment) => {
    setSelectedAppointment(appointment);
    try {
      const appointmentLogs = await vetService.getAppointmentLogs(appointment.id);
      setLogs(appointmentLogs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
    setShowDetailModal(true);
  };

  const handleConfirm = async (id) => {
    try {
      await vetService.confirmAppointment(id);
      fetchAppointments();
      alert('Appointment confirmed successfully');
    } catch (error) {
      alert('Failed to confirm appointment');
    }
  };

  const handleCancel = async (id) => {
    const reason = prompt('Enter cancellation reason:');
    if (reason) {
      try {
        await vetService.cancelAppointment(id, reason);
        fetchAppointments();
        alert('Appointment cancelled successfully');
      } catch (error) {
        alert('Failed to cancel appointment');
      }
    }
  };

  const handleExportCSV = async () => {
    try {
      const csvContent = await vetService.exportAppointmentsToCSV(appointments);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `appointments-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export CSV');
    }
  };

  return (
    <VetLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <button
            onClick={handleExportCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export CSV</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pet</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map(appointment => (
                <tr key={appointment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.time}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{appointment.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.userName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {appointment.pets.map(p => p.name).join(', ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => handleViewDetails(appointment)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View
                    </button>
                    {appointment.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleConfirm(appointment.id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleCancel(appointment.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Appointment Details"
      >
        {selectedAppointment && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Patient Name</p>
                <p className="font-semibold">{selectedAppointment.userName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-semibold">{selectedAppointment.userPhone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-semibold">{selectedAppointment.date}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="font-semibold">{selectedAppointment.time}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <p className="font-semibold capitalize">{selectedAppointment.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold capitalize">{selectedAppointment.status}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pets</p>
              {selectedAppointment.pets.map(pet => (
                <p key={pet.id} className="font-semibold">{pet.name} - {pet.breed}</p>
              ))}
            </div>
            <div>
              <p className="text-sm text-gray-600">Notes</p>
              <p className="font-semibold">{selectedAppointment.notes || 'No notes'}</p>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Appointment History</h4>
              {logs.length === 0 ? (
                <p className="text-gray-600 text-sm">No history available</p>
              ) : (
                <div className="space-y-2">
                  {logs.map(log => (
                    <div key={log.id} className="text-sm border-l-2 border-primary pl-3">
                      <p className="font-semibold capitalize">{log.action}</p>
                      <p className="text-gray-600">{log.notes}</p>
                      <p className="text-gray-500 text-xs">
                        {new Date(log.timestamp).toLocaleString()} - {log.performedBy}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </VetLayout>
  );
};

export default VetAppointments;
