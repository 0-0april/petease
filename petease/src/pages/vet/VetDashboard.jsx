import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import VetLayout from '../../components/VetLayout';
import { vetService } from '../../services/vetService';

const VetDashboard = () => {
  const [stats, setStats] = useState({
    todayAppointments: 0,
    pendingAppointments: 0,
    pendingAdoptions: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { appointments } = await vetService.getAllAppointments(1, 100);
      const today = new Date().toISOString().split('T')[0];
      const todayCount = appointments.filter(a => a.date === today).length;
      const pendingCount = appointments.filter(a => a.status === 'pending').length;
      const { total: adoptionCount } = await vetService.getPendingAdoptions(1, 100);
      
      setStats({
        todayAppointments: todayCount,
        pendingAppointments: pendingCount,
        pendingAdoptions: adoptionCount
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <VetLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Veterinary Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Today's Appointments</p>
                <p className="text-3xl font-bold text-primary mt-2">{stats.todayAppointments}</p>
              </div>
              <div className="bg-primary-light bg-opacity-20 p-3 rounded-full">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Appointments</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pendingAppointments}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Adoptions</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.pendingAdoptions}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/vet/appointments" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Appointments</h3>
            <p className="text-gray-600">View, confirm, and manage all veterinary appointments</p>
          </Link>

          <Link to="/vet/medical-records" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Medical Records</h3>
            <p className="text-gray-600">Add and manage pet medical history</p>
          </Link>

          <Link to="/vet/adoptions" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Adoption Management</h3>
            <p className="text-gray-600">Process adoption requests and upload waivers</p>
          </Link>

          <Link to="/vet/announcements" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Announcements</h3>
            <p className="text-gray-600">Create announcements for new services</p>
          </Link>
        </div>
      </div>
    </VetLayout>
  );
};

export default VetDashboard;
