import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { adoptionService } from '../../services/adoptionService';
import { petService } from '../../services/petService';

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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Reject Adoption Request</h3>
        <p className="text-sm text-gray-500 mb-4">
          Rejecting <span className="font-medium text-gray-700">{request.adopterName}</span>'s
          request for <span className="font-medium text-gray-700">{request.petName}</span>.
        </p>
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
            {selected === '__other__' && <span className="mr-2">✓</span>}Other reason...
          </button>
        </div>
        {selected === '__other__' && (
          <textarea value={custom} onChange={e => setCustom(e.target.value)} rows={3}
            placeholder="Write your reason here..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none mb-3" autoFocus />
        )}
        <div className="flex space-x-3 mt-1">
          <button onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium">
            Cancel
          </button>
          <button onClick={() => onConfirm(finalReason)} disabled={!finalReason}
            className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium">
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
};

const ConfirmModal = ({ message, onConfirm, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Action</h3>
      <p className="text-sm text-gray-600 mb-5">{message}</p>
      <div className="flex space-x-3">
        <button onClick={onClose}
          className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium">
          Cancel
        </button>
        <button onClick={onConfirm}
          className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark text-sm font-medium">
          Confirm
        </button>
      </div>
    </div>
  </div>
);

const AdoptionRequests = () => {
  const navigate = useNavigate();
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getPetImage = (petId) => {
    const pet = pets.find(p => p.id === petId);
    return pet?.image || 'https://via.placeholder.com/80?text=Pet';
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
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectConfirm = async (reason) => {
    setActionLoading(rejectTarget.id + '-reject');
    try {
      await adoptionService.rejectAdoption(rejectTarget.id, reason);
      setRejectTarget(null);
      showFeedback('Adoption request rejected.');
      await fetchAll();
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    setActionLoading(cancelTarget + '-cancel');
    try {
      await adoptionService.cancelAdoption(cancelTarget);
      setCancelTarget(null);
      showFeedback('Adoption request cancelled.');
      await fetchAll();
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const openChat = (userId) => {
    navigate('/messages', { state: { userId } });
  };

  const pendingIncoming = incoming.filter(r => r.status === 'pending').length;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Adoption Requests</h1>
        <p className="text-gray-500 mb-6">Manage requests for your pets and track your own adoption applications.</p>

        {feedback && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
            feedback.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {feedback.msg}
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
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
          /* RECEIVED tab — shows pet image, pet name, adopter name */
          incoming.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm">
              <p className="text-gray-600 font-medium">No incoming requests</p>
              <p className="text-sm text-gray-400 mt-1">When someone wants to adopt your pet, it will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {incoming.map(req => (
                <div key={req.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-start gap-4">
                    {/* Pet image */}
                    <img src={getPetImage(req.petId)} alt={req.petName}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-0.5">
                        <span className="font-semibold text-gray-900">{req.petName}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[req.status]}`}>
                          {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Adopter:{' '}
                        <button
                          onClick={() => openChat(req.adopterId)}
                          className="font-medium text-primary hover:underline"
                        >
                          {req.adopterName}
                        </button>
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{req.adopterEmail} · {req.adopterPhone} · {formatDate(req.createdAt)}</p>
                      {req.message && (
                        <p className="mt-2 text-sm text-gray-600 italic bg-gray-50 rounded-lg px-3 py-2">"{req.message}"</p>
                      )}
                      {req.status === 'rejected' && req.rejectionReason && (
                        <div className="mt-2 bg-red-50 rounded-lg px-3 py-2 text-sm text-red-700">
                          Rejection reason: {req.rejectionReason}
                        </div>
                      )}
                      {req.status === 'approved' && (
                        <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm text-blue-800">
                          Adoption approved. Both parties must visit the Provincial Veterinary Office to sign the waiver.
                        </div>
                      )}
                      {req.status === 'completed' && (
                        <div className="mt-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-800 font-medium">
                          Adoption completed by vet staff.
                        </div>
                      )}
                    </div>
                    {req.status === 'pending' && (
                      <div className="flex flex-col space-y-2 flex-shrink-0">
                        <button onClick={() => setApproveTarget(req.id)} disabled={!!actionLoading}
                          className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark disabled:opacity-50 font-medium">
                          {actionLoading === req.id + '-approve' ? 'Approving...' : 'Approve'}
                        </button>
                        <button onClick={() => setRejectTarget(req)} disabled={!!actionLoading}
                          className="px-4 py-2 border border-red-300 text-red-600 text-sm rounded-lg hover:bg-red-50 disabled:opacity-50 font-medium">
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* SENT tab — shows pet image, pet name, owner name */
          sent.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm">
              <p className="text-gray-600 font-medium">No applications yet</p>
              <p className="text-sm text-gray-400 mt-1">Browse pets and submit an adoption request to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sent.map(req => (
                <div key={req.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-start gap-4">
                    {/* Pet image */}
                    <img src={getPetImage(req.petId)} alt={req.petName}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-0.5">
                        <span className="font-semibold text-gray-900">{req.petName}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[req.status]}`}>
                          {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Owner:{' '}
                        <button
                          onClick={() => openChat(req.ownerId)}
                          className="font-medium text-primary hover:underline"
                        >
                          {req.ownerName || 'Pet Owner'}
                        </button>
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">Submitted {formatDate(req.createdAt)}</p>
                      {req.message && (
                        <p className="mt-2 text-sm text-gray-600 italic bg-gray-50 rounded-lg px-3 py-2">"{req.message}"</p>
                      )}
                      {req.status === 'rejected' && req.rejectionReason && (
                        <div className="mt-2 bg-red-50 rounded-lg px-3 py-2 text-sm text-red-700">
                          Reason: {req.rejectionReason}
                        </div>
                      )}
                      {req.status === 'approved' && (
                        <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm text-blue-800">
                          Your request was approved. Please visit the Provincial Veterinary Office with the owner to sign the adoption waiver.
                        </div>
                      )}
                      {req.status === 'completed' && (
                        <div className="mt-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-800 font-medium">
                          Adoption completed. Congratulations on your new pet!
                        </div>
                      )}
                    </div>
                    {req.status === 'pending' && (
                      <button onClick={() => setCancelTarget(req.id)} disabled={!!actionLoading}
                        className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium flex-shrink-0">
                        {actionLoading === req.id + '-cancel' ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {rejectTarget && (
        <RejectModal request={rejectTarget} onConfirm={handleRejectConfirm} onClose={() => setRejectTarget(null)} />
      )}
      {approveTarget && (
        <ConfirmModal
          message={`Approve this adoption request? The adopter will be notified to visit the Provincial Veterinary Office.`}
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
    </Layout>
  );
};

export default AdoptionRequests;
