import React from 'react';
<<<<<<< HEAD
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
=======
import { useState, useEffect } from 'react';
import VetLayout from '../../components/VetLayout';
import Pagination from '../../components/Pagination';
import { vetService } from '../../services/vetService';

const VetAttendance = () => {
  const [appointments, setAppointments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('all');

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

  const handleMarkAttendance = async (id, attended) => {
    try {
      await vetService.markAttendance(id, attended);
      fetchAppointments();
      alert(`Marked as ${attended ? 'attended' : 'no-show'}`);
    } catch (error) {
      alert('Failed to mark attendance');
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'attended') return apt.attended === true;
    if (filter === 'no-show') return apt.attended === false && apt.status === 'confirmed';
    if (filter === 'pending') return apt.status === 'confirmed' && apt.attended === false;
    return true;
  });

  return (
    <VetLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Appointments</option>
            <option value="pending">Pending Attendance</option>
            <option value="attended">Attended</option>
            <option value="no-show">No Show</option>
          </select>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pet</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.map(appointment => (
                <tr key={appointment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.time}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.userName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {appointment.pets.map(p => p.name).join(', ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{appointment.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {appointment.attended === true ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        Attended
                      </span>
                    ) : appointment.attended === false && appointment.status === 'completed' ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                        No Show
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    {appointment.status === 'confirmed' && !appointment.attended && (
                      <>
                        <button
                          onClick={() => handleMarkAttendance(appointment.id, true)}
                          className="text-green-600 hover:text-green-800"
                        >
                          Mark Attended
                        </button>
                        <button
                          onClick={() => handleMarkAttendance(appointment.id, false)}
                          className="text-red-600 hover:text-red-800"
                        >
                          No Show
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
    </VetLayout>
  );
};

export default VetAttendance;
>>>>>>> 8555e327320ce828f5dfb4efd072c21355eac3c7
