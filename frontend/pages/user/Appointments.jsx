import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { appointmentService } from '../../services/appointmentService';
import { useBadge } from '../../contexts/BadgeContext';

const SEEN_KEY = 'appointments_seen_ids';

const getSeenIds = () => {
  try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]')); }
  catch { return new Set(); }
};

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const { notify, clear } = useBadge();

  useEffect(() => {
    fetchAppointments();
    return () => clear('/appointments');
  }, []);

  const fetchAppointments = async () => {
    try {
      const data = await appointmentService.getMyAppointments();
      setAppointments(data);
      const seen = getSeenIds();
      const unseen = data.filter(a =>
        (a.status === 'pending' || a.status === 'confirmed') && !seen.has(String(a.id))
      ).length;
      // Mark all current as seen now that user is on the page
      const allIds = data.map(a => String(a.id));
      localStorage.setItem(SEEN_KEY, JSON.stringify(allIds));
      notify('/appointments', unseen);
      // immediately clear since user is viewing
      clear('/appointments');
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelConfirmed = async () => {
    try {
      await appointmentService.cancelAppointment(cancelTarget);
      setCancelTarget(null);
      setFeedback('Appointment cancelled successfully.');
      setTimeout(() => setFeedback(null), 3000);
      fetchAppointments();
    } catch {
      setFeedback('Failed to cancel appointment. Please try again.');
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

  const typeLabel = (type) => {
    if (type === 'anti-rabies') return 'Anti-Rabies Vaccine';
    if (type === 'spay') return 'Spay / Neuter';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
            <p className="text-gray-500 mt-1">View and manage your veterinary appointments.</p>
          </div>
          <Link to="/book-appointment"
            className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary-dark font-medium text-sm">
            + New Appointment
          </Link>
        </div>

        {feedback && (
          <div className="px-4 py-3 rounded-lg text-sm font-medium bg-green-50 text-green-700 border border-green-200">
            {feedback}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-600 font-medium mb-2">No appointments yet</p>
            <Link to="/book-appointment" className="text-primary hover:underline text-sm">
              Book your first appointment
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map(appointment => (
              <div key={appointment.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{typeLabel(appointment.type)}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Date: <span className="font-medium text-gray-800">{formatDate(appointment.date)}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Pets: <span className="font-medium text-gray-800">{appointment.pets?.map(p => p.name).join(', ')}</span>
                    </p>
                  </div>
                  {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
                    <button onClick={() => setCancelTarget(appointment.id)}
                      className="border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 text-sm font-medium flex-shrink-0">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel confirmation modal */}
      {cancelTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cancel Appointment</h3>
            <p className="text-sm text-gray-600 mb-5">Are you sure you want to cancel this appointment? This action cannot be undone.</p>
            <div className="flex space-x-3">
              <button onClick={() => setCancelTarget(null)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium">
                Keep It
              </button>
              <button onClick={handleCancelConfirmed}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 text-sm font-medium">
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Appointments;
