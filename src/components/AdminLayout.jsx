import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout = ({ children }) => {
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
              <Link to="/admin/dashboard" className="text-2xl font-bold text-primary">PetEase Admin</Link>
              <div className="hidden md:flex space-x-4">
                <Link to="/admin/users" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md">Users</Link>
                <Link to="/admin/reports" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md">Reports</Link>
                <Link to="/admin/announcements" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md">Announcements</Link>
                <Link to="/admin/system-announcements" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md">System Updates</Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
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

export default AdminLayout;
