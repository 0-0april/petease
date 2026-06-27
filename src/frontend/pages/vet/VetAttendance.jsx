import React from 'react';
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
