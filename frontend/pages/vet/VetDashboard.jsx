import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import VetLayout from '../../components/VetLayout';
import Modal from '../../components/Modal';
import { vetService } from '../../services/vetService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// ─── Constants ───────────────────────────────────────────────────────────────

const FILTER_OPTIONS = ['week', 'month', 'year'];

const SERVICE_LABELS = {
  consultation: 'Consultation',
  'anti-rabies': 'Rabies Vaccination',
  spay: 'Spay',
  neuter: 'Neuter',
};

const STATUS_STYLES = {
  confirmed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
};

// Distinct colors for service lines — green/red are reserved for status chart
const SERVICE_LINE_COLORS = [
  '#3b82f6', // blue
  '#a855f7', // purple
  '#f97316', // orange
  '#06b6d4', // cyan
  '#eab308', // yellow
  '#ec4899', // pink
  '#14b8a6', // teal
  '#8b5cf6', // violet
];

// Distinct colors for species pie segments
const SPECIES_PIE_COLORS = [
  '#f59e0b', // amber  – dog
  '#ec4899', // pink   – cat
  '#38bdf8', // sky    – bird
  '#a78bfa', // violet – rabbit
  '#34d399', // emerald
  '#fb923c', // orange
  '#f87171', // rose
  '#94a3b8', // slate  – other / overflow
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Get the last N month labels ending on `now`. */
function lastNMonths(n) {
  const now = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1);
    return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  });
}

/** Return { year, month } key for a date string. */
function monthKey(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Use the stored PetSpecie value directly; fall back to breed-keyword matching only as a last resort. */
function getSpecies(appointment) {
  // Use the species field from the DB if present
  const speciesRaw = appointment.pets.map(p => p.species || '').join(' ').trim();
  if (speciesRaw) {
    const s = speciesRaw.toLowerCase();
    if (s.includes('cat') || s.includes('feline')) return 'Cat';
    if (s.includes('dog') || s.includes('canine')) return 'Dog';
    if (s.includes('bird') || s.includes('avian')) return 'Bird';
    if (s.includes('rabbit') || s.includes('bunny')) return 'Rabbit';
    // Return it capitalised as-is for any other stored value
    return speciesRaw.charAt(0).toUpperCase() + speciesRaw.slice(1).toLowerCase();
  }
  // Fallback: infer from breed keywords
  const breed = appointment.pets.map(p => (p.breed || '').toLowerCase()).join(' ');
  if (/retriever|labrador|beagle|bulldog|poodle|shih|husky|corgi|dachshund/.test(breed)) return 'Dog';
  if (/persian|siamese|maine coon|tabby|ragdoll|bengal|sphynx/.test(breed)) return 'Cat';
  if (/parrot|cockatiel|canary|macaw|budgie/.test(breed)) return 'Bird';
  if (/rabbit|bunny|lop/.test(breed)) return 'Rabbit';
  return 'Other';
}

// ─── Chart: Service Usage (multi-line, monthly trends) ───────────────────────

function ServiceUsageChart({ appointments }) {
  const months = lastNMonths(6);

  // Collect all service types present in data
  const allTypes = useMemo(() => {
    const types = new Set(appointments.map(a => a.type));
    return [...types];
  }, [appointments]);

  // Total appointments per service type
  const totalPerType = useMemo(() => {
    const counts = {};
    appointments.forEach(a => {
      counts[a.type] = (counts[a.type] || 0) + 1;
    });
    return counts;
  }, [appointments]);

  const grandTotal = Object.values(totalPerType).reduce((s, v) => s + v, 0) || 1;

  // Separate main types (≥5% of total) from "Other"
  const { mainTypes, otherTypes } = useMemo(() => {
    const main = allTypes.filter(t => (totalPerType[t] || 0) / grandTotal >= 0.05);
    const other = allTypes.filter(t => (totalPerType[t] || 0) / grandTotal < 0.05);
    return { mainTypes: main, otherTypes: other };
  }, [allTypes, totalPerType, grandTotal]);

  // Build monthly counts for each main type + "Other"
  const seriesLabels = [
    ...mainTypes.map(t => SERVICE_LABELS[t] || t.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())),
    ...(otherTypes.length > 0 ? ['Other'] : []),
  ];

  const seriesData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: seriesLabels.length }, (_, si) => {
      return Array.from({ length: 6 }, (_, mi) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - mi), 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const isOther = si >= mainTypes.length;
        const typesToCount = isOther ? otherTypes : [mainTypes[si]];
        return appointments.filter(a => {
          return typesToCount.includes(a.type) && monthKey(a.date) === key;
        }).length;
      });
    });
  }, [appointments, mainTypes, otherTypes, seriesLabels.length]);

  const datasets = seriesLabels.map((label, i) => ({
    label,
    data: seriesData[i],
    borderColor: SERVICE_LINE_COLORS[i % SERVICE_LINE_COLORS.length],
    backgroundColor: SERVICE_LINE_COLORS[i % SERVICE_LINE_COLORS.length] + '22',
    borderWidth: 2,
    pointRadius: 4,
    pointHoverRadius: 6,
    tension: 0.3,
    fill: false,
  }));

  const data = { labels: months, datasets };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: { usePointStyle: true, padding: 16, font: { size: 12 } },
        onClick(e, legendItem, legend) {
          // Default toggle behavior
          const ci = legend.chart;
          const index = legendItem.datasetIndex;
          const meta = ci.getDatasetMeta(index);
          meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
          ci.update();
        },
      },
      tooltip: {
        callbacks: {
          label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y} appt${ctx.parsed.y !== 1 ? 's' : ''}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#6b7280', font: { size: 11 } } },
      y: {
        beginAtZero: true,
        grid: { color: '#e5e7eb', borderDash: [4, 3] },
        ticks: { color: '#9ca3af', font: { size: 11 }, precision: 0 },
      },
    },
  };

  return (
    <div
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
      aria-label="Service usage line chart showing monthly appointment trends per service type"
    >
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Vet Services Usage</h2>
      {appointments.length === 0 ? (
        <p className="text-gray-400 text-sm">No data available.</p>
      ) : (
        <div style={{ height: '280px' }}>
          <Line data={data} options={options} aria-label="Service usage monthly trends" />
        </div>
      )}
    </div>
  );
}

// ─── Chart: Species Distribution (pie) ───────────────────────────────────────

function SpeciesDistributionChart({ appointments }) {
  const speciesCounts = useMemo(() => {
    const counts = {};
    appointments.forEach(a => {
      const s = getSpecies(a);
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [appointments]);

  const labels = Object.keys(speciesCounts);
  const values = Object.values(speciesCounts);
  const total = values.reduce((s, v) => s + v, 0) || 1;

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: labels.map((_, i) => SPECIES_PIE_COLORS[i % SPECIES_PIE_COLORS.length]),
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 14,
          font: { size: 12 },
          generateLabels(chart) {
            const ds = chart.data.datasets[0];
            return chart.data.labels.map((label, i) => {
              const value = ds.data[i];
              const pct = Math.round((value / total) * 100);
              return {
                text: `${label} — ${pct}%`,
                fillStyle: ds.backgroundColor[i],
                strokeStyle: ds.borderColor,
                lineWidth: ds.borderWidth,
                datasetIndex: 0,
                index: i,
                hidden: false,
              };
            });
          },
        },
      },
      tooltip: {
        callbacks: {
          label: ctx => {
            const v = ctx.parsed;
            const pct = Math.round((v / total) * 100);
            return ` ${ctx.label}: ${v} (${pct}%)`;
          },
        },
      },
      // percentage labels on segments via datalabels would need plugin;
      // we handle them via tooltip + legend instead (no extra dep needed)
    },
  };

  return (
    <div
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
      aria-label="Species distribution pie chart showing percentage of appointments per pet species"
    >
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Species Distribution</h2>
      {appointments.length === 0 ? (
        <p className="text-gray-400 text-sm">No data available.</p>
      ) : (
        <div style={{ height: '280px' }}>
          <Pie data={data} options={options} aria-label="Species distribution pie chart" />
        </div>
      )}
    </div>
  );
}

// ─── Chart: Completed vs Cancelled (line) ────────────────────────────────────

function CompletedVsCancelledChart({ appointments }) {
  const months = lastNMonths(6);

  const seriesData = useMemo(() => {
    const now = new Date();
    const completed = [];
    const cancelled = [];
    for (let mi = 0; mi < 6; mi++) {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - mi), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      completed.push(appointments.filter(a => a.status === 'completed' && monthKey(a.date) === key).length);
      cancelled.push(appointments.filter(a => a.status === 'cancelled' && monthKey(a.date) === key).length);
    }
    return { completed, cancelled };
  }, [appointments]);

  const data = {
    labels: months,
    datasets: [
      {
        label: 'Completed',
        data: seriesData.completed,
        borderColor: '#16a34a',       // fixed green
        backgroundColor: '#16a34a22',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.3,
        fill: false,
      },
      {
        label: 'Cancelled',
        data: seriesData.cancelled,
        borderColor: '#dc2626',       // fixed red
        backgroundColor: '#dc262622',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.3,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: { usePointStyle: true, padding: 16, font: { size: 12 } },
      },
      tooltip: {
        callbacks: {
          label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y} appt${ctx.parsed.y !== 1 ? 's' : ''}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#6b7280', font: { size: 11 } } },
      y: {
        beginAtZero: true,
        grid: { color: '#e5e7eb', borderDash: [4, 3] },
        ticks: { color: '#9ca3af', font: { size: 11 }, precision: 0 },
      },
    },
  };

  return (
    <div
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
      aria-label="Line chart comparing monthly completed vs cancelled appointments"
    >
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Appointments: Completed vs Cancelled</h2>
      {appointments.length === 0 ? (
        <p className="text-gray-400 text-sm">No data available.</p>
      ) : (
        <div style={{ height: '280px' }}>
          <Line data={data} options={options} aria-label="Completed vs cancelled appointments monthly trends" />
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const isInRange = (dateStr, filter) => {
  const date = new Date(dateStr);
  const now = new Date();
  if (filter === 'week') {
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    return date >= weekAgo && date <= now;
  }
  if (filter === 'month') {
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }
  if (filter === 'year') {
    return date.getFullYear() === now.getFullYear();
  }
  return true;
};

const VetDashboard = () => {
  const [allAppointments, setAllAppointments] = useState([]);
  const [filter, setFilter] = useState('month');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [logs, setLogs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Fetch a large set so chart data covers all months
        const data = await vetService.getAllAppointments(1, 500);
        setAllAppointments(data.appointments);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const filtered = useMemo(
    () => allAppointments.filter(a => isInRange(a.date, filter)),
    [allAppointments, filter]
  );

  const handleRowClick = async (appointment) => {
    setSelectedAppointment(appointment);
    try {
      const appointmentLogs = await vetService.getAppointmentLogs(appointment.id);
      setLogs(appointmentLogs);
    } catch {
      setLogs([]);
    }
    setShowModal(true);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = allAppointments.filter(a => a.date === todayStr).length;
  const pendingCount = allAppointments.filter(a => a.status === 'pending').length;
  const confirmedCount = allAppointments.filter(a => a.status === 'confirmed').length;

  return (
    <VetLayout>
      <div className="space-y-6">

        {/* Header + filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex bg-gray-100 rounded-lg p-1 space-x-1">
            {FILTER_OPTIONS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                  filter === f ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Today's Appointments</p>
            <p className="text-4xl font-bold text-primary mt-1">{todayCount}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Pending Confirmation</p>
            <p className="text-4xl font-bold text-yellow-600 mt-1">{pendingCount}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Confirmed</p>
            <p className="text-4xl font-bold text-green-600 mt-1">{confirmedCount}</p>
          </div>
        </div>

        {/* Charts — three separate sections */}
        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Loading charts…</div>
        ) : (
          <>
            {/* 1. Service Usage — full width */}
            <ServiceUsageChart appointments={allAppointments} />

            {/* 2 & 3 — side by side on wider screens */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SpeciesDistributionChart appointments={allAppointments} />
              <CompletedVsCancelledChart appointments={allAppointments} />
            </div>
          </>
        )}

        {/* Appointments Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">
              Appointments — <span className="capitalize">{filter}</span>
              <span className="ml-2 text-sm font-normal text-gray-500">({filtered.length} records)</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Click any row to view full details</p>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No appointments in this period.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pet(s)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(apt => (
                    <tr
                      key={apt.id}
                      onClick={() => handleRowClick(apt)}
                      className="hover:bg-green-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900">{apt.date}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{apt.time}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                        {SERVICE_LABELS[apt.type] || apt.type}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{apt.userName}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {apt.pets.map(p => p.name).join(', ')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${STATUS_STYLES[apt.status] || 'bg-gray-100 text-gray-600'}`}>
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Appointment Details">
        {selectedAppointment && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Patient</p>
                <p className="font-semibold">{selectedAppointment.userName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="font-semibold">{selectedAppointment.userPhone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="font-semibold">{selectedAppointment.date}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Time</p>
                <p className="font-semibold">{selectedAppointment.time}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Service</p>
                <p className="font-semibold capitalize">
                  {SERVICE_LABELS[selectedAppointment.type] || selectedAppointment.type}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${STATUS_STYLES[selectedAppointment.status] || 'bg-gray-100 text-gray-600'}`}>
                  {selectedAppointment.status}
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Pet(s)</p>
              {selectedAppointment.pets.map(pet => (
                <p key={pet.id} className="font-semibold">{pet.name} — {pet.breed}</p>
              ))}
            </div>
            {selectedAppointment.notes && (
              <div>
                <p className="text-xs text-gray-500">Notes</p>
                <p className="text-sm text-gray-800">{selectedAppointment.notes}</p>
              </div>
            )}
            <div className="border-t pt-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Activity Log</p>
              {logs.length === 0 ? (
                <p className="text-sm text-gray-400">No activity recorded.</p>
              ) : (
                <div className="space-y-2">
                  {logs.map(log => (
                    <div key={log.id} className="text-sm border-l-2 border-primary pl-3">
                      <p className="font-medium capitalize">{log.action}</p>
                      <p className="text-gray-600">{log.notes}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(log.timestamp).toLocaleString()} · {log.performedBy}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </VetLayout>
  );
};

export default VetDashboard;
