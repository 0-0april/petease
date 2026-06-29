import React from 'react';
<<<<<<< HEAD
import { useState, useEffect, useMemo } from 'react';
import VetLayout from '../../components/VetLayout';
import Modal from '../../components/Modal';
import { vetService } from '../../services/vetService';

const FILTER_OPTIONS = ['week', 'month', 'year'];

const SERVICE_LABELS = {
  consultation: 'Consultation',
  'anti-rabies': 'Rabies Vaccination',
  spay: 'Spay',
  neuter: 'Neuter',
};

const SERVICE_COLORS = {
  consultation: 'bg-green-500',
  'anti-rabies': 'bg-blue-500',
  spay: 'bg-purple-500',
  neuter: 'bg-orange-500',
};

const SPECIES_COLORS = {
  dog: 'bg-yellow-500',
  cat: 'bg-pink-500',
  bird: 'bg-sky-500',
  other: 'bg-gray-400',
};

const STATUS_STYLES = {
  confirmed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
};

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

const getSpecies = (appointment) => {
  const breeds = appointment.pets.map(p => (p.breed || '').toLowerCase()).join(' ');
  if (/retriever|labrador|beagle|bulldog|poodle/.test(breeds)) return 'dog';
  if (/persian|siamese|maine coon|tabby/.test(breeds)) return 'cat';
  if (/parrot|cockatiel|canary/.test(breeds)) return 'bird';
  return 'other';
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
        const data = await vetService.getAllAppointments(1, 100);
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

  const serviceStats = useMemo(() => {
    const counts = {};
    filtered.forEach(a => {
      counts[a.type] = (counts[a.type] || 0) + 1;
    });
    return counts;
  }, [filtered]);

  const speciesStats = useMemo(() => {
    const counts = {};
    filtered.forEach(a => {
      const s = getSpecies(a);
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [filtered]);

  const maxServiceCount = Math.max(1, ...Object.values(serviceStats));
  const maxSpeciesCount = Math.max(1, ...Object.values(speciesStats));

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex bg-gray-100 rounded-lg p-1 space-x-1">
            {FILTER_OPTIONS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${filter === f ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-900'
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

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Service Usage */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Service Usage</h2>
            {filtered.length === 0 ? (
              <p className="text-gray-400 text-sm">No data for this period.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(SERVICE_LABELS).map(([key, label]) => {
                  const count = serviceStats[key] || 0;
                  const pct = Math.round((count / maxServiceCount) * 100);
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{label}</span>
                        <span className="font-semibold text-gray-900">{count}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${SERVICE_COLORS[key] || 'bg-gray-400'} transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Species Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Species Distribution</h2>
            {Object.keys(speciesStats).length === 0 ? (
              <p className="text-gray-400 text-sm">No data for this period.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(speciesStats).map(([species, count]) => {
                  const pct = Math.round((count / maxSpeciesCount) * 100);
                  return (
                    <div key={species}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 capitalize">{species}</span>
                        <span className="font-semibold text-gray-900">{count}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${SPECIES_COLORS[species] || 'bg-gray-400'} transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

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
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Appointment Details"
      >
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
=======
import { useState, useEffect, useMemo } from 'react';
import VetLayout from '../../components/VetLayout';
import Modal from '../../components/Modal';
import { vetService } from '../../services/vetService';

const FILTER_OPTIONS = ['week', 'month', 'year'];

const SERVICE_LABELS = {
  consultation: 'Consultation',
  'anti-rabies': 'Rabies Vaccination',
  spay: 'Spay',
  neuter: 'Neuter',
};

const SERVICE_COLORS = {
  consultation: 'bg-green-500',
  'anti-rabies': 'bg-blue-500',
  spay: 'bg-purple-500',
  neuter: 'bg-orange-500',
};

const SPECIES_COLORS = {
  dog: 'bg-yellow-500',
  cat: 'bg-pink-500',
  bird: 'bg-sky-500',
  other: 'bg-gray-400',
};

const STATUS_STYLES = {
  confirmed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
};

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

const getSpecies = (appointment) => {
  const breeds = appointment.pets.map(p => (p.breed || '').toLowerCase()).join(' ');
  if (/retriever|labrador|beagle|bulldog|poodle/.test(breeds)) return 'dog';
  if (/persian|siamese|maine coon|tabby/.test(breeds)) return 'cat';
  if (/parrot|cockatiel|canary/.test(breeds)) return 'bird';
  return 'other';
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
        const data = await vetService.getAllAppointments(1, 100);
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

  const serviceStats = useMemo(() => {
    const counts = {};
    filtered.forEach(a => {
      counts[a.type] = (counts[a.type] || 0) + 1;
    });
    return counts;
  }, [filtered]);

  const speciesStats = useMemo(() => {
    const counts = {};
    filtered.forEach(a => {
      const s = getSpecies(a);
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [filtered]);

  const maxServiceCount = Math.max(1, ...Object.values(serviceStats));
  const maxSpeciesCount = Math.max(1, ...Object.values(speciesStats));

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
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex bg-gray-100 rounded-lg p-1 space-x-1">
            {FILTER_OPTIONS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${filter === f ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-900'
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

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Service Usage */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Service Usage</h2>
            {filtered.length === 0 ? (
              <p className="text-gray-400 text-sm">No data for this period.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(SERVICE_LABELS).map(([key, label]) => {
                  const count = serviceStats[key] || 0;
                  const pct = Math.round((count / maxServiceCount) * 100);
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{label}</span>
                        <span className="font-semibold text-gray-900">{count}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${SERVICE_COLORS[key] || 'bg-gray-400'} transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Species Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Species Distribution</h2>
            {Object.keys(speciesStats).length === 0 ? (
              <p className="text-gray-400 text-sm">No data for this period.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(speciesStats).map(([species, count]) => {
                  const pct = Math.round((count / maxSpeciesCount) * 100);
                  return (
                    <div key={species}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 capitalize">{species}</span>
                        <span className="font-semibold text-gray-900">{count}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${SPECIES_COLORS[species] || 'bg-gray-400'} transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
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
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Appointment Details"
      >
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
>>>>>>> 8555e327320ce828f5dfb4efd072c21355eac3c7
