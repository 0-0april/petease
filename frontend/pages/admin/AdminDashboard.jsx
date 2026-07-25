import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import AdminLayout from '../../components/AdminLayout';
import { adminService } from '../../services/adminService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const FILTER_OPTIONS = [
  { value: 'week',  label: 'This Week'  },
  { value: 'month', label: 'This Month' },
  { value: 'year',  label: 'This Year'  },
];

function buildChartPoints(rawUsers, filter) {
  const now = new Date();

  if (filter === 'week') {
    // Last 7 days, each day is one point
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      const count = rawUsers.filter(u => u.UserLastLogin?.split('T')[0] === dateStr).length;
      return { label, count };
    });
  }

  if (filter === 'month') {
    // Last 30 days split into 4 weeks
    return Array.from({ length: 4 }, (_, i) => {
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - (3 - i) * 7);
      weekEnd.setHours(23, 59, 59, 999);
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekEnd.getDate() - 6);
      weekStart.setHours(0, 0, 0, 0);
      const label = `Wk ${i + 1}`;
      const count = rawUsers.filter(u => {
        const d = u.UserLastLogin ? new Date(u.UserLastLogin) : null;
        return d && d >= weekStart && d <= weekEnd;
      }).length;
      return { label, count };
    });
  }

  // year — last 12 months, one point per month
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    const label = d.toLocaleDateString('en-US', { month: 'short' });
    const count = rawUsers.filter(u => {
      const ud = u.UserLastLogin ? new Date(u.UserLastLogin) : null;
      return ud && ud.getMonth() === d.getMonth() && ud.getFullYear() === d.getFullYear();
    }).length;
    return { label, count };
  });
}

// Chart.js line graph
function LineGraph({ points }) {
  const primaryColor = 'hsl(130, 100%, 30%)';
  const primaryColorTransparent = 'hsla(130, 100%, 30%, 0.15)';

  const data = {
    labels: points.map(p => p.label),
    datasets: [
      {
        label: 'Active Users',
        data: points.map(p => p.count),
        borderColor: primaryColor,
        backgroundColor: primaryColorTransparent,
        borderWidth: 2.5,
        pointBackgroundColor: primaryColor,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => {
            const v = ctx.parsed.y;
            return ` ${v} user${v !== 1 ? 's' : ''}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#6b7280', font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: '#e5e7eb', borderDash: [4, 3] },
        ticks: {
          color: '#9ca3af',
          font: { size: 11 },
          precision: 0,
        },
      },
    },
  };

  return (
    <div style={{ height: '200px' }}>
      <Line data={data} options={options} aria-label="Active users line graph" />
    </div>
  );
}

export default function AdminDashboard() {
  const [rawUsers, setRawUsers]     = useState([]);
  const [chartFilter, setChartFilter] = useState('month');
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    adminService.getActiveUsersChart()
      .then(data => setRawUsers(data || []))
      .catch(err => console.error('Chart fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  const chartPoints = useMemo(
    () => buildChartPoints(rawUsers, chartFilter),
    [rawUsers, chartFilter]
  );

  const totalInRange = chartPoints.reduce((s, p) => s + p.count, 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Active Users Over Time</h2>
              <p className="text-xs text-gray-400 mt-1">
                {loading ? 'Loading…' : `${totalInRange} active user${totalInRange !== 1 ? 's' : ''} logged in during selected period`}
              </p>
            </div>
            <div className="flex bg-gray-100 rounded-lg p-1 mt-4 sm:mt-0">
              {FILTER_OPTIONS.map(f => (
                <button
                  key={f.value}
                  onClick={() => setChartFilter(f.value)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors focus:outline-none ${
                    chartFilter === f.value
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Loading chart…</div>
          ) : (
            <LineGraph points={chartPoints} />
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
