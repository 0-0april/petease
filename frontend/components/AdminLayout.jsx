import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/landing');
  };

  const navLinks = [
    { to: '/admin/users', label: 'Manage Users' },
    { to: '/admin/reports', label: 'Manage Reports' },
    { to: '/admin/announcements', label: 'Announcements' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-40 bg-white/95 shadow-sm border-b border-gray-200 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-16 items-center justify-between gap-3 py-3">
            <div className="flex min-w-0 items-center gap-4 lg:gap-8">
              <Link to="/admin/dashboard" className="shrink-0 text-xl sm:text-2xl font-bold text-primary tracking-tight">
                PetEase Admin
              </Link>
              <div className="hidden md:flex flex-wrap items-center gap-1">
                {navLinks.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                      isActive(link.to)
                        ? 'bg-green-50 text-primary'
                        : 'text-gray-700 hover:text-primary hover:bg-green-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/admin/notifications"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:text-primary hover:bg-green-50 transition-colors relative"
                title="Notifications"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </Link>
              <span className="hidden sm:block max-w-[160px] truncate text-sm text-gray-700 font-medium">
                {user?.name || user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="hidden sm:inline-flex bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark text-sm font-medium shadow-sm transition-colors"
              >
                Logout
              </button>
              <button
                type="button"
                onClick={() => setMenuOpen(o => !o)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 md:hidden"
                aria-label="Toggle navigation menu"
                aria-expanded={menuOpen}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                </svg>
              </button>
            </div>
          </div>

          {menuOpen && (
            <div className="md:hidden border-t border-gray-100 py-3">
              <div className="grid gap-1">
                {navLinks.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive(link.to)
                        ? 'bg-green-50 text-primary'
                        : 'text-gray-700 hover:bg-green-50 hover:text-primary'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="mt-2 flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2">
                  <span className="min-w-0 truncate text-sm text-gray-600">{user?.name || user?.email}</span>
                  <button
                    onClick={handleLogout}
                    className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-dark"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
