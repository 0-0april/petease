import React from 'react';
import { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { adminService } from '../../services/adminService';

const FILTER_OPTIONS = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
];

const AdminDashboard = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [chartFilter, setChartFilter] = useState('month');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const usersData = await adminService.getAllUsers(1, 200, {});
      setAllUsers(usersData.users);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  // Build chart data: active users per time bucket
  const chartData = useMemo(() => {
    const now = new Date();
    const activeUsers = allUsers.filter(u => u.status === 'active' && u.role === 'user');

    if (chartFilter === 'week') {
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now);
        d.setDate(now.getDate() - (6 - i));
        const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
        const dateStr = d.toISOString().split('T')[0];
        const count = activeUsers.filter(u => {
          const login = u.lastLogin ? u.lastLogin.split('T')[0] : '';
          return login === dateStr;
        }).length;
        return { label, count };
      });
    }

    if (chartFilter === 'month') {
      return Array.from({ length: 4 }, (_, i) => {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - (3 - i) * 7 - 6);
        const weekEnd = new Date(now);
        weekEnd.setDate(now.getDate() - (3 - i) * 7);
        const label = `Wk ${i + 1}`;
        const count = activeUsers.filter(u => {
          const login = u.lastLogin ? new Date(u.lastLogin) : null;
          return login && login >= weekStart && login <= weekEnd;
        }).length;
        return { label, count };
      });
    }

    // Year: last 12 months
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      const label = d.toLocaleDateString('en-US', { month: 'short' });
      const count = activeUsers.filter(u => {
        const login = u.lastLogin ? new Date(u.lastLogin) : null;
        return login &&
          login.getMonth() === d.getMonth() &&
          login.getFullYear() === d.getFullYear();
      }).length;
      return { label, count };
    });
  }, [allUsers, chartFilter]);

  const maxCount = Math.max(1, ...chartData.map(d => d.count));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>

        {/* Active Users Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Active Users Over Time</h2>
              <p className="text-xs text-gray-400 mt-1">Based on last login activity</p>
            </div>
            <div className="flex bg-gray-100 rounded-lg p-1 mt-4 sm:mt-0">
              {FILTER_OPTIONS.map(f => (
                <button
                  key={f.value}
                  onClick={() => setChartFilter(f.value)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors focus:outline-none ${chartFilter === f.value
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                    }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-end space-x-2 h-56 pt-6">
            {chartData.map((bar, i) => {
              const heightPct = maxCount === 0 ? 0 : Math.round((bar.count / maxCount) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center group relative">
                  <div className="relative w-full flex justify-center h-full items-end pb-6">
                    {bar.count > 0 && (
                      <span className="absolute -top-6 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity bg-primary-100 px-2 py-0.5 rounded-full">
                        {bar.count}
                      </span>
                    )}
                    <div
                      className="w-full sm:w-8 md:w-12 bg-primary group-hover:bg-primary-dark rounded-t-lg transition-all duration-500"
                      style={{ height: `${heightPct === 0 ? 4 : heightPct}%`, minHeight: heightPct === 0 ? '4px' : '0', opacity: heightPct === 0 ? 0.2 : 1 }}
                    />
                  </div>
                  <p className="text-xs font-medium text-gray-500 mt-2 truncate w-full text-center absolute bottom-0">{bar.label}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
