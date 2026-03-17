import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { appointmentService } from '../../services/appointmentService';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const data = await appointmentService.getMyAppointments();
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await appointmentService.cancelAppointment(id);
        fetchAppointments();
      } catch (error) {
        alert('Failed to cancel appointment');
      }
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
          <Link to="/book-appointment" className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark">
            Book Appointment
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 mb-4">No appointments found</p>
            <Link to="/book-appointment" className="text-primary hover:underline">
              Book your first appointment
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map(appointment => (
              <div key={appointment.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 capitalize">{appointment.type}</h3>
                    <p className="text-gray-600 mt-1">
                      Date: {new Date(appointment.date).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600">
                      Pets: {appointment.pets?.map(p => p.name).join(', ')}
                    </p>
                    <span className={`inline-block mt-2 px-3 py-1 text-sm rounded-full ${
                      appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                  {appointment.status === 'confirmed' && (
                    <button
                      onClick={() => handleCancel(appointment.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Appointments;
