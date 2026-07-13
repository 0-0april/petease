import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { adminService } from '../../services/adminService';

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

// SVG line graph — no external library
function LineGraph({ points }) {
  const W = 800;
  const H = 200;
  const PAD = { top: 20, right: 20, bottom: 32, left: 36 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const maxVal = Math.max(1, ...points.map(p => p.count));
  const step = innerW / Math.max(points.length - 1, 1);

  const coords = points.map((p, i) => ({
    x: PAD.left + i * step,
    y: PAD.top + innerH - (p.count / maxVal) * innerH,
    ...p,
  }));

  const pathD = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  const fillD = `${pathD} L${coords[coords.length - 1].x.toFixed(1)},${(PAD.top + innerH).toFixed(1)} L${PAD.left.toFixed(1)},${(PAD.top + innerH).toFixed(1)} Z`;

  // y-axis ticks
  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const val = Math.round((maxVal / 4) * i);
    const y = PAD.top + innerH - (val / maxVal) * innerH;
    return { val, y };
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: '200px' }} aria-label="Active users line graph">
      {/* Grid lines */}
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={PAD.left} x2={W - PAD.right} y1={t.y} y2={t.y}
            stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 3" />
          <text x={PAD.left - 6} y={t.y + 4} textAnchor="end"
            fontSize="10" fill="#9ca3af">{t.val}</text>
        </g>
      ))}

      {/* Fill area */}
      <path d={fillD} fill="url(#lineGrad)" opacity="0.18" />

      {/* Line */}
      <path d={pathD} fill="none" stroke="hsl(130,100%,30%)" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots + tooltips */}
      {coords.map((c, i) => (
        <g key={i}>
          <circle cx={c.x} cy={c.y} r="4" fill="hsl(130,100%,30%)" stroke="white" strokeWidth="2" />
          {/* hover label via title */}
          <title>{`${c.label}: ${c.count} user${c.count !== 1 ? 's' : ''}`}</title>
          {/* x-axis label */}
          <text x={c.x} y={H - 6} textAnchor="middle" fontSize="10" fill="#6b7280">{c.label}</text>
        </g>
      ))}

      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(130,100%,30%)" />
          <stop offset="100%" stopColor="hsl(130,100%,30%)" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
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
