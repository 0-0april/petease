import React from 'react';
import { useState, useEffect } from 'react';
import VetLayout from '../../components/VetLayout';
import Pagination from '../../components/Pagination';
import { vetService } from '../../services/vetService';

const AttendanceBadge = ({ attended, status }) => {
  if (attended === true) {
    return <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Attended</span>;
  }
  if (attended === false && status === 'completed') {
    return <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">No Show</span>;
  }
  return <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">Pending</span>;
};

const StatusBadge = ({ status }) => {
  const styles = {
    completed: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full capitalize ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
};

const VetAttendance = () => {
  const [appointments, setAppointments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState(null);

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

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleMarkAttendance = async (id, attended) => {
    try {
      await vetService.markAttendance(id, attended);
      fetchAppointments();
      showToast(`Marked as ${attended ? 'attended' : 'no-show'}`);
    } catch (error) {
      showToast('Failed to mark attendance', 'error');
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'attended') return apt.attended === true;
    if (filter === 'no-show') return apt.attended === false && apt.status === 'completed';
    if (filter === 'pending') return apt.status === 'confirmed' && !apt.attended;
    return true;
  });

  return (
    <VetLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Attendance Management</h1>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Appointments</option>
            <option value="pending">Pending Attendance</option>
            <option value="attended">Attended</option>
            <option value="no-show">No Show</option>
          </select>
        </div>

        {toast && (
          <div className={`rounded-xl px-4 py-3 text-sm font-medium border ${
            toast.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-green-50 text-green-800 border-green-200'
          }`}>
            {toast.msg}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Pet</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Type</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-gray-400 text-sm">
                      No appointments found for this filter.
                    </td>
                  </tr>
                ) : filteredAppointments.map(appointment => (
                  <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{appointment.date}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{appointment.time}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm font-medium text-gray-900">{appointment.userName}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 hidden sm:table-cell">
                      {appointment.pets.map(p => p.name).join(', ')}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 capitalize hidden md:table-cell">{appointment.type}</td>
                    <td className="px-4 sm:px-6 py-4">
                      <StatusBadge status={appointment.status} />
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <AttendanceBadge attended={appointment.attended} status={appointment.status} />
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      {appointment.status === 'confirmed' && !appointment.attended && (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => handleMarkAttendance(appointment.id, true)}
                            className="px-3 py-1.5 text-xs font-semibold bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          >
                            Show
                          </button>
                          <button
                            onClick={() => handleMarkAttendance(appointment.id, false)}
                            className="px-3 py-1.5 text-xs font-semibold bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                          >
                            No Show
                          </button>
                        </div>
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
    </VetLayout>
  );
};

export default VetAttendance;
