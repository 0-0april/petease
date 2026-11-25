import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Pagination from '../../components/Pagination';
import { appointmentService } from '../../services/appointmentService';
import { useBadge } from '../../contexts/BadgeContext';

const PAGE_SIZE = 10;

const SEEN_KEY = 'appointments_seen_ids';

const STATUS_STYLES = {
  confirmed: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
  pending:   'bg-yellow-100 text-yellow-800',
};

const getSeenIds = () => {
  try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]')); }
  catch { return new Set(); }
};

const CANCEL_REASONS = [
  'I have a scheduling conflict',
  'My pet is feeling better and no longer needs the appointment',
  'I need to reschedule for a different date',
  'Financial reasons',
  'I found an alternative veterinary service',
  'Personal emergency or family obligation',
];

const CancelModal = ({ onConfirm, onClose }) => {
  const [selected, setSelected] = useState('');
  const [custom, setCustom] = useState('');
  const finalReason = selected === '__other__' ? custom.trim() : selected;
  const toggle = (val) => setSelected(prev => prev === val ? '' : val);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancel Appointment</h3>
        <div className="space-y-2 mb-3">
          {CANCEL_REASONS.map(r => (
            <button key={r} onClick={() => toggle(r)}
              className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                selected === r
                  ? 'border-red-400 bg-red-50 text-red-700 font-medium'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }`}>
              {selected === r && <span className="mr-2">✓</span>}{r}
            </button>
          ))}
          <button onClick={() => toggle('__other__')}
            className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
              selected === '__other__'
                ? 'border-red-400 bg-red-50 text-red-700 font-medium'
                : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
            }`}>
            {selected === '__other__' && <span className="mr-2">✓</span>}Other…
          </button>
        </div>
        {selected === '__other__' && (
          <textarea value={custom} onChange={e => setCustom(e.target.value)} rows={3}
            placeholder="Reason…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none mb-3"
            autoFocus />
        )}
        <div className="flex space-x-3 mt-1">
          <button onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium">
            Keep
          </button>
          <button onClick={() => onConfirm(finalReason)} disabled={!finalReason}
            className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium">
            Confirm Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

/* Bulk-cancel confirmation — no reason required, just a quick confirm */
const BulkCancelModal = ({ count, onConfirm, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="glass-card w-full max-w-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Cancel Appointments</h3>
      <p className="text-sm text-gray-600 mb-5">
        Cancel {count} selected appointment{count > 1 ? 's' : ''}? This cannot be undone.
      </p>
      <div className="flex space-x-3">
        <button onClick={onClose}
          className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium">
          Keep
        </button>
        <button onClick={onConfirm}
          className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 text-sm font-medium">
          Confirm Cancel
        </button>
      </div>
    </div>
  </div>
);

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);   // single appointment id
  const [bulkCancelOpen, setBulkCancelOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const { notify, clear } = useBadge();

  useEffect(() => {
    fetchAppointments();
    return () => clear('/appointments');
  }, []);

  const fetchAppointments = async () => {
    try {
      const data = await appointmentService.getMyAppointments();
      setAppointments(data);
      const seen = getSeenIds();
      const unseen = data.filter(a =>
        (a.status === 'pending' || a.status === 'confirmed') && !seen.has(String(a.id))
      ).length;
      const allIds = data.map(a => String(a.id));
      localStorage.setItem(SEEN_KEY, JSON.stringify(allIds));
      notify('/appointments', unseen);
      clear('/appointments');
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const showFeedback = (msg, type = 'success') => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleCancelConfirmed = async (reason) => {
    try {
      await appointmentService.cancelAppointment(cancelTarget, reason);
      setCancelTarget(null);
      setSelectedIds(prev => prev.filter(id => id !== cancelTarget));
      showFeedback('Appointment cancelled.');
      fetchAppointments();
    } catch {
      showFeedback('Failed to cancel appointment.', 'error');
    }
  };

  const handleBulkCancelConfirmed = async () => {
    try {
      await Promise.all(
        selectedIds.map(id => appointmentService.cancelAppointment(id, 'Cancelled by user'))
      );
      setSelectedIds([]);
      setBulkCancelOpen(false);
      showFeedback(`${selectedIds.length} appointment${selectedIds.length > 1 ? 's' : ''} cancelled.`);
      fetchAppointments();
    } catch {
      showFeedback('Failed to cancel appointments.', 'error');
      setBulkCancelOpen(false);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    });

  const typeLabel = (type) => {
    if (type === 'anti-rabies') return 'Anti-Rabies Vaccine';
    if (type === 'spay') return 'Spay / Neuter';
    return type ? type.charAt(0).toUpperCase() + type.slice(1) : '—';
  };

  // Only pending/confirmed rows are selectable for bulk cancel
  const selectableIds = appointments
    .filter(a => a.status === 'pending' || a.status === 'confirmed')
    .map(a => a.id);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(appointments.length / PAGE_SIZE));
  const pageRows   = appointments.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const pageSelectableIds = pageRows
    .filter(a => a.status === 'pending' || a.status === 'confirmed')
    .map(a => a.id);

  const allPageSelected =
    pageSelectableIds.length > 0 &&
    pageSelectableIds.every(id => selectedIds.includes(id));

  const toggleSelectAll = (e) => {
    setSelectedIds(e.target.checked
      ? [...new Set([...selectedIds, ...pageSelectableIds])]
      : selectedIds.filter(id => !pageSelectableIds.includes(id))
    );
  };
  const toggleSelect = (id) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <Link to="/book-appointment"
            className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary-dark font-medium text-sm">
            + New
          </Link>
        </div>

        {feedback && (
          <div className={`px-4 py-3 rounded-lg text-sm font-medium border ${
            feedback.type === 'error'
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-green-50 text-green-700 border-green-200'
          }`}>
            {feedback.msg}
          </div>
        )}

        {/* Bulk cancel toolbar */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setBulkCancelOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel Selected ({selectedIds.length})
            </button>
            <button onClick={() => setSelectedIds([])}
              className="text-sm text-gray-500 hover:text-gray-700">
              Clear
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading…</div>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-600 font-medium mb-2">No appointments</p>
            <Link to="/book-appointment" className="text-primary hover:underline text-sm">Book now</Link>
          </div>
        ) : (
          <>
            {/* ── Mobile cards (< sm) ── */}
            <div className="sm:hidden space-y-3">
              {pageRows.map(appointment => {
                const cancellable = appointment.status === 'confirmed' || appointment.status === 'pending';
                return (
                  <div key={appointment.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {cancellable && (
                          <input type="checkbox"
                            className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4 shrink-0"
                            checked={selectedIds.includes(appointment.id)}
                            onChange={() => toggleSelect(appointment.id)} />
                        )}
                        <span className="text-sm font-semibold text-gray-900 truncate">
                          {appointment.pets?.map(p => p.name).join(', ') || '—'}
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${
                        STATUS_STYLES[appointment.status] || 'bg-gray-100 text-gray-600'
                      }`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Service</p>
                        <p className="text-gray-700">{typeLabel(appointment.type)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Scheduled</p>
                        <p className="text-gray-700">{formatDate(appointment.date)}</p>
                      </div>
                    </div>
                    {cancellable && (
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => setCancelTarget(appointment.id)}
                          className="px-3 py-1.5 border border-red-300 text-red-600 text-xs rounded-lg hover:bg-red-50 font-medium">
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ── Desktop table (sm+) ── */}
            <div className="hidden sm:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 w-10 text-center">
                        <input type="checkbox"
                          className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                          checked={allPageSelected}
                          onChange={toggleSelectAll} />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pet(s)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pageRows.map(appointment => {
                      const cancellable = appointment.status === 'confirmed' || appointment.status === 'pending';
                      return (
                        <tr key={appointment.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 text-center">
                            {cancellable && (
                              <input type="checkbox"
                                className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                                checked={selectedIds.includes(appointment.id)}
                                onChange={() => toggleSelect(appointment.id)} />
                            )}
                          </td>
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">
                            {appointment.pets?.map(p => p.name).join(', ') || '—'}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600">
                            {typeLabel(appointment.type)}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                            {formatDate(appointment.date)}
                          </td>
                          <td className="px-4 py-4">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              STATUS_STYLES[appointment.status] || 'bg-gray-100 text-gray-600'
                            }`}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {cancellable && (
                              <button
                                onClick={() => setCancelTarget(appointment.id)}
                                className="px-3 py-1.5 border border-red-300 text-red-600 text-xs rounded-lg hover:bg-red-50 font-medium">
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </>
        )}
      </div>

      {/* Single-appointment cancel modal */}
      {cancelTarget && (
        <CancelModal
          onConfirm={handleCancelConfirmed}
          onClose={() => setCancelTarget(null)}
        />
      )}

      {/* Bulk cancel confirmation modal */}
      {bulkCancelOpen && (
        <BulkCancelModal
          count={selectedIds.length}
          onConfirm={handleBulkCancelConfirmed}
          onClose={() => setBulkCancelOpen(false)}
        />
      )}
    </Layout>
  );
};

export default Appointments;
