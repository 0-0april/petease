import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Pagination from '../../components/Pagination';
import { adoptionService } from '../../services/adoptionService';
import { petService } from '../../services/petService';
import { useBadge } from '../../contexts/BadgeContext';

const PAGE_SIZE = 10;

const STATUS_STYLES = {
  pending:   'bg-yellow-100 text-yellow-800',
  approved:  'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  rejected:  'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-600',
};

const PRESET_REASONS = [
  'Pet has already been adopted',
  'Applicant does not meet our requirements',
  'We have concerns about the living environment',
  'The adopter already has too many pets',
  'Request was incomplete or missing information',
];

const RejectModal = ({ request, onConfirm, onClose }) => {
  const [selected, setSelected] = useState('');
  const [custom, setCustom] = useState('');
  const finalReason = selected === '__other__' ? custom.trim() : selected;
  const toggle = (val) => setSelected(prev => prev === val ? '' : val);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject</h3>
        <div className="space-y-2 mb-3">
          {PRESET_REASONS.map(r => (
            <button key={r} onClick={() => toggle(r)}
              className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                selected === r ? 'border-red-400 bg-red-50 text-red-700 font-medium' : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }`}>
              {selected === r && <span className="mr-2">✓</span>}{r}
            </button>
          ))}
          <button onClick={() => toggle('__other__')}
            className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
              selected === '__other__' ? 'border-red-400 bg-red-50 text-red-700 font-medium' : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
            }`}>
            {selected === '__other__' && <span className="mr-2">✓</span>}Other…
          </button>
        </div>
        {selected === '__other__' && (
          <textarea value={custom} onChange={e => setCustom(e.target.value)} rows={3}
            placeholder="Reason…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none mb-3" autoFocus />
        )}
        <div className="flex space-x-3 mt-1">
          <button onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium">
            Cancel
          </button>
          <button onClick={() => onConfirm(finalReason)} disabled={!finalReason}
            className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const ConfirmModal = ({ message, onConfirm, onClose, confirmLabel = 'Confirm', danger = false }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="glass-card w-full max-w-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm</h3>
      <p className="text-sm text-gray-600 mb-5">{message}</p>
      <div className="flex space-x-3">
        <button onClick={onClose}
          className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium">
          Cancel
        </button>
        <button onClick={onConfirm}
          className={`flex-1 py-2 rounded-lg text-sm font-medium text-white ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary-dark'}`}>
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

const ADOPT_SEEN_KEY = 'adoptions_seen_pending_ids';

const AdoptionRequests = () => {
  const navigate = useNavigate();
  const { clear } = useBadge();
  const [incoming, setIncoming] = useState([]);
  const [sent, setSent] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('incoming');
  const [rejectTarget, setRejectTarget] = useState(null);
  const [approveTarget, setApproveTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Pagination
  const [incomingPage, setIncomingPage] = useState(1);
  const [sentPage, setSentPage] = useState(1);

  // Multi-select delete
  const [selectedIncoming, setSelectedIncoming] = useState([]);
  const [selectedSent, setSelectedSent] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null); // { ids, tab }

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [inc, snt, allPets] = await Promise.all([
        adoptionService.getIncomingRequests(),
        adoptionService.getMyAdoptionRequests(),
        petService.getAllPets()
      ]);
      setIncoming(inc);
      setSent(snt);
      setPets(allPets);
      const pendingIds = inc.filter(r => r.status === 'pending').map(r => String(r.id));
      localStorage.setItem(ADOPT_SEEN_KEY, JSON.stringify(pendingIds));
      clear('/adoption-requests');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getPetImage = (petId) => {
    const pet = pets.find(p => p.id === petId);
    return pet?.image || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23e8f5e9'/%3E%3Ctext x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-size='28' fill='%2381c784'%3E🐾%3C/text%3E%3C/svg%3E`;
  };

  const showFeedback = (msg, type = 'success') => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleApprove = async () => {
    setActionLoading(approveTarget + '-approve');
    try {
      await adoptionService.approveAdoption(approveTarget);
      setApproveTarget(null);
      showFeedback('Adoption request approved.');
      await fetchAll();
    } finally { setActionLoading(null); }
  };

  const handleRejectConfirm = async (reason) => {
    setActionLoading(rejectTarget.id + '-reject');
    try {
      await adoptionService.rejectAdoption(rejectTarget.id, reason);
      setRejectTarget(null);
      showFeedback('Adoption request rejected.');
      await fetchAll();
    } finally { setActionLoading(null); }
  };

  const handleCancel = async () => {
    setActionLoading(cancelTarget + '-cancel');
    try {
      await adoptionService.cancelAdoption(cancelTarget);
      setCancelTarget(null);
      showFeedback('Adoption request cancelled.');
      await fetchAll();
    } finally { setActionLoading(null); }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      const { ids, tab } = deleteTarget;
      if (tab === 'incoming') {
        await Promise.all(ids.map(id => adoptionService.softDeleteIncoming(id)));
        setSelectedIncoming([]);
      } else {
        await Promise.all(ids.map(id => adoptionService.softDeleteSent(id)));
        setSelectedSent([]);
      }
      setDeleteTarget(null);
      showFeedback(`${ids.length} record${ids.length > 1 ? 's' : ''} deleted.`);
      await fetchAll();
    } catch {
      showFeedback('Failed to delete.', 'error');
      setDeleteTarget(null);
    }
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const openChat = (userId) => navigate('/messages', { state: { userId } });

  // Pagination helpers
  const paginateIncoming = () => {
    const total = Math.max(1, Math.ceil(incoming.length / PAGE_SIZE));
    const page  = incoming.slice((incomingPage - 1) * PAGE_SIZE, incomingPage * PAGE_SIZE);
    return { page, total };
  };
  const paginateSent = () => {
    const total = Math.max(1, Math.ceil(sent.length / PAGE_SIZE));
    const page  = sent.slice((sentPage - 1) * PAGE_SIZE, sentPage * PAGE_SIZE);
    return { page, total };
  };

  // Select-all helpers (operates on current page only)
  const toggleAllIncoming = (e, pageRows) => {
    const ids = pageRows.map(r => r.id);
    setSelectedIncoming(e.target.checked ? [...new Set([...selectedIncoming, ...ids])] : selectedIncoming.filter(id => !ids.includes(id)));
  };
  const toggleAllSent = (e, pageRows) => {
    const ids = pageRows.map(r => r.id);
    setSelectedSent(e.target.checked ? [...new Set([...selectedSent, ...ids])] : selectedSent.filter(id => !ids.includes(id)));
  };

  const pendingIncoming = incoming.filter(r => r.status === 'pending').length;
  const { page: incomingRows, total: incomingTotalPages } = paginateIncoming();
  const { page: sentRows,     total: sentTotalPages }     = paginateSent();

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Adoptions</h1>

        {feedback && (
          <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
            feedback.type === 'error'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {feedback.msg}
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 w-fit">
          <button onClick={() => setActiveTab('incoming')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'incoming' ? 'bg-white text-primary shadow' : 'text-gray-600 hover:text-gray-900'
            }`}>
            <span>Received</span>
            {pendingIncoming > 0 && (
              <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pendingIncoming}
              </span>
            )}
          </button>
          <button onClick={() => setActiveTab('sent')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'sent' ? 'bg-white text-primary shadow' : 'text-gray-600 hover:text-gray-900'
            }`}>
            Sent
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        ) : activeTab === 'incoming' ? (
          /* ── RECEIVED TAB ── */
          <div className="space-y-4">
            {/* Toolbar */}
            {selectedIncoming.length > 0 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDeleteTarget({ ids: selectedIncoming, tab: 'incoming' })}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Selected ({selectedIncoming.length})
                </button>
                <button onClick={() => setSelectedIncoming([])}
                  className="text-sm text-gray-500 hover:text-gray-700">
                  Clear
                </button>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 w-10 text-center">
                        <input type="checkbox"
                          className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                          checked={incomingRows.length > 0 && incomingRows.every(r => selectedIncoming.includes(r.id))}
                          onChange={e => toggleAllIncoming(e, incomingRows)} />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pet</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adopter</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {incomingRows.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-10 text-center text-gray-400 text-sm">No requests.</td>
                      </tr>
                    ) : incomingRows.map(req => (
                      <tr key={req.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-center">
                          <input type="checkbox"
                            className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                            checked={selectedIncoming.includes(req.id)}
                            onChange={() => setSelectedIncoming(prev =>
                              prev.includes(req.id) ? prev.filter(x => x !== req.id) : [...prev, req.id]
                            )} />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <img src={getPetImage(req.petId)} alt={req.petName}
                              className="w-10 h-10 rounded-lg object-cover shrink-0" />
                            <span className="text-sm font-medium text-gray-900">{req.petName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <button onClick={() => openChat(req.adopterId)}
                            className="text-sm font-medium text-primary hover:underline">
                            {req.adopterName}
                          </button>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          <div>{req.adopterEmail}</div>
                          <div className="text-xs text-gray-400">{req.adopterPhone}</div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {formatDate(req.createdAt)}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLES[req.status] || ''}`}>
                            {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                          </span>
                          {req.status === 'rejected' && req.rejectionReason && (
                            <p className="text-xs text-red-600 mt-1 max-w-[160px] truncate" title={req.rejectionReason}>
                              {req.rejectionReason}
                            </p>
                          )}
                          {req.status === 'approved' && (
                            <p className="text-xs text-blue-600 mt-1">Awaiting waiver visit</p>
                          )}
                          {req.status === 'completed' && (
                            <p className="text-xs text-green-600 mt-1">✓ Completed by vet</p>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {req.status === 'pending' && (
                              <>
                                <button onClick={() => setApproveTarget(req.id)} disabled={!!actionLoading}
                                  className="px-3 py-1.5 bg-primary text-white text-xs rounded-lg hover:bg-primary-dark disabled:opacity-50 font-medium">
                                  {actionLoading === req.id + '-approve' ? '…' : 'Approve'}
                                </button>
                                <button onClick={() => setRejectTarget(req)} disabled={!!actionLoading}
                                  className="px-3 py-1.5 border border-red-300 text-red-600 text-xs rounded-lg hover:bg-red-50 disabled:opacity-50 font-medium">
                                  Reject
                                </button>
                              </>
                            )}
                            {req.status === 'completed' && req.waiverUrl && (
                              <a href={req.waiverUrl} target="_blank" rel="noopener noreferrer" download
                                className="px-3 py-1.5 bg-green-700 text-white text-xs rounded-lg hover:bg-green-800 font-semibold">
                                Waiver
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <Pagination currentPage={incomingPage} totalPages={incomingTotalPages} onPageChange={setIncomingPage} />
          </div>
        ) : (
          /* ── SENT TAB ── */
          <div className="space-y-4">
            {/* Toolbar */}
            {selectedSent.length > 0 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDeleteTarget({ ids: selectedSent, tab: 'sent' })}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Selected ({selectedSent.length})
                </button>
                <button onClick={() => setSelectedSent([])}
                  className="text-sm text-gray-500 hover:text-gray-700">
                  Clear
                </button>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 w-10 text-center">
                        <input type="checkbox"
                          className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                          checked={sentRows.length > 0 && sentRows.every(r => selectedSent.includes(r.id))}
                          onChange={e => toggleAllSent(e, sentRows)} />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pet</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sentRows.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-gray-400 text-sm">No applications.</td>
                      </tr>
                    ) : sentRows.map(req => (
                      <tr key={req.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-center">
                          <input type="checkbox"
                            className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                            checked={selectedSent.includes(req.id)}
                            onChange={() => setSelectedSent(prev =>
                              prev.includes(req.id) ? prev.filter(x => x !== req.id) : [...prev, req.id]
                            )} />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <img src={getPetImage(req.petId)} alt={req.petName}
                              className="w-10 h-10 rounded-lg object-cover shrink-0" />
                            <span className="text-sm font-medium text-gray-900">{req.petName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <button onClick={() => openChat(req.ownerId)}
                            className="text-sm font-medium text-primary hover:underline">
                            {req.ownerName || 'Pet Owner'}
                          </button>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {formatDate(req.createdAt)}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLES[req.status] || ''}`}>
                            {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                          </span>
                          {req.status === 'rejected' && req.rejectionReason && (
                            <p className="text-xs text-red-600 mt-1 max-w-[160px] truncate" title={req.rejectionReason}>
                              {req.rejectionReason}
                            </p>
                          )}
                          {req.status === 'approved' && (
                            <p className="text-xs text-blue-600 mt-1">Visit PVO to sign waiver</p>
                          )}
                          {req.status === 'completed' && (
                            <p className="text-xs text-green-600 mt-1">✓ Congratulations!</p>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {req.status === 'pending' && (
                              <button onClick={() => setCancelTarget(req.id)} disabled={!!actionLoading}
                                className="px-3 py-1.5 border border-gray-300 text-gray-600 text-xs rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium">
                                {actionLoading === req.id + '-cancel' ? '…' : 'Cancel'}
                              </button>
                            )}
                            {req.status === 'completed' && req.waiverUrl && (
                              <a href={req.waiverUrl} target="_blank" rel="noopener noreferrer" download
                                className="px-3 py-1.5 bg-green-700 text-white text-xs rounded-lg hover:bg-green-800 font-semibold">
                                Waiver
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <Pagination currentPage={sentPage} totalPages={sentTotalPages} onPageChange={setSentPage} />
          </div>
        )}
      </div>

      {/* Modals */}
      {rejectTarget && (
        <RejectModal request={rejectTarget} onConfirm={handleRejectConfirm} onClose={() => setRejectTarget(null)} />
      )}
      {approveTarget && (
        <ConfirmModal
          message="Approve this adoption request? The adopter will be notified to visit the Provincial Veterinary Office."
          onConfirm={handleApprove}
          onClose={() => setApproveTarget(null)}
        />
      )}
      {cancelTarget && (
        <ConfirmModal
          message="Are you sure you want to cancel this adoption request?"
          onConfirm={handleCancel}
          onClose={() => setCancelTarget(null)}
        />
      )}
      {deleteTarget && (
        <ConfirmModal
          message={`Delete ${deleteTarget.ids.length} record${deleteTarget.ids.length > 1 ? 's' : ''}? This will hide ${deleteTarget.ids.length > 1 ? 'them' : 'it'} from your list.`}
          confirmLabel="Delete"
          danger
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </Layout>
  );
};

export default AdoptionRequests;
