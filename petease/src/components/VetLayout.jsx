import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const VetLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/vet/dashboard" className="text-2xl font-bold text-primary">PetEase Vet</Link>
              <div className="hidden md:flex space-x-4">
                <Link to="/vet/appointments" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md">Appointments</Link>
                <Link to="/vet/attendance" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md">Attendance</Link>
                <Link to="/vet/medical-records" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md">Medical Records</Link>
                <Link to="/vet/adoptions" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md">Adoptions</Link>
                <Link to="/vet/announcements" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md">Announcements</Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/vet/notifications" className="text-gray-700 hover:text-primary">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </Link>
              <span className="text-gray-700">{user?.name}</span>
              <button onClick={handleLogout} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default VetLayout;
