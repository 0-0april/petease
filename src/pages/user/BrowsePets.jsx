import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { petService } from '../../services/petService';
import { adoptionService } from '../../services/adoptionService';
import { messageService } from '../../services/messageService';
import { useAuth } from '../../contexts/AuthContext';

// Calculate age in months from birthday
const getAgeInMonths = (birthday) => {
  if (!birthday) return null;
  const birth = new Date(birthday);
  const now = new Date();
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  return months;
};

// Floating pet profile container shown when a pet card is clicked
const PetProfilePanel = ({ pet, onClose, onMessageSent }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOwner = user?.id === pet.ownerId;

  const [adoptStep, setAdoptStep] = useState(null); // null | 'form' | 'done'
  const [adoptMsg, setAdoptMsg] = useState('');
  const [adoptLoading, setAdoptLoading] = useState(false);

  const [msgStep, setMsgStep] = useState(null); // null | 'form' | 'done'
  const [msgContent, setMsgContent] = useState('');
  const [msgLoading, setMsgLoading] = useState(false);

  const ageInMonths = getAgeInMonths(pet.birthday);

  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleAdopt = async () => {
    setAdoptLoading(true);
    try {
      await adoptionService.requestAdoption(pet.id, adoptMsg.trim());
      setAdoptStep('done');
    } catch {
      alert('Failed to send adoption request. Please try again.');
    } finally {
      setAdoptLoading(false);
    }
  };

  const handleMessage = async () => {
    if (!msgContent.trim()) return;
    setMsgLoading(true);
    try {
      await messageService.sendMessage(pet.ownerId, msgContent.trim());
      setMsgStep('done');
      onMessageSent && onMessageSent(pet.ownerId);
    } catch {
      alert('Failed to send message. Please try again.');
    } finally {
      setMsgLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative">
          <img src={pet.image || 'https://via.placeholder.com/600x300?text=No+Image'} alt={pet.name}
            className="w-full h-56 object-cover rounded-t-2xl" />
          <button onClick={onClose}
            className="absolute top-3 right-3 bg-white/90 rounded-full p-1.5 hover:bg-white shadow">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <span className={`absolute bottom-3 left-3 px-3 py-1 text-xs font-semibold rounded-full ${
            pet.status === 'available' ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
          }`}>
            {pet.status}
          </span>
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900">{pet.name}</h2>
          <p className="text-gray-500 text-sm mt-1">
            {pet.breed} · {pet.species || pet.type} · {pet.gender}
            {pet.color && ` · ${pet.color}`}
            {ageInMonths !== null && ` · ${ageInMonths} ${ageInMonths === 1 ? 'month' : 'months'} old`}
          </p>

          <p className="text-gray-700 mt-4 text-sm leading-relaxed">{pet.description}</p>

          {pet.medicalHistory && (
            <div className="mt-4 bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Medical History</p>
              <p className="text-sm text-gray-700">{pet.medicalHistory}</p>
            </div>
          )}

          {/* Actions */}
          {!isOwner && pet.status === 'available' && (
            <div className="mt-5 space-y-3">
              {/* Adoption section */}
              {adoptStep === null && (
                <button onClick={() => setAdoptStep('form')}
                  className="w-full bg-primary text-white py-2.5 rounded-lg hover:bg-primary-dark font-medium text-sm">
                  Request Adoption
                </button>
              )}
              {adoptStep === 'form' && (
                <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-medium text-gray-700">Message to owner <span className="text-gray-400 font-normal">(optional)</span></p>
                  <textarea value={adoptMsg} onChange={e => setAdoptMsg(e.target.value)} rows={3}
                    placeholder="Introduce yourself and explain why you'd be a great fit..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                  <div className="flex space-x-2">
                    <button onClick={() => setAdoptStep(null)} disabled={adoptLoading}
                      className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium">
                      Cancel
                    </button>
                    <button onClick={handleAdopt} disabled={adoptLoading}
                      className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark disabled:opacity-60 text-sm font-medium">
                      {adoptLoading ? 'Sending...' : 'Send Request'}
                    </button>
                  </div>
                </div>
              )}
              {adoptStep === 'done' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <svg className="w-8 h-8 text-primary mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm font-semibold text-green-800">Adoption request sent!</p>
                  <p className="text-xs text-green-600 mt-1">The owner will review your request.</p>
                </div>
              )}

              {/* Message section */}
              {msgStep === null && (
                <button onClick={() => setMsgStep('form')}
                  className="w-full border border-primary text-primary py-2.5 rounded-lg hover:bg-green-50 font-medium text-sm">
                  Message Owner
                </button>
              )}
              {msgStep === 'form' && (
                <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-medium text-gray-700">Send a message to the owner</p>
                  <textarea value={msgContent} onChange={e => setMsgContent(e.target.value)} rows={3}
                    placeholder="Ask about the pet, arrange a visit..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                  <div className="flex space-x-2">
                    <button onClick={() => setMsgStep(null)} disabled={msgLoading}
                      className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium">
                      Cancel
                    </button>
                    <button onClick={handleMessage} disabled={msgLoading || !msgContent.trim()}
                      className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark disabled:opacity-60 text-sm font-medium">
                      {msgLoading ? 'Sending...' : 'Send Message'}
                    </button>
                  </div>
                </div>
              )}
              {msgStep === 'done' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                  <p className="text-sm font-semibold text-blue-800">Message sent!</p>
                  <button onClick={() => navigate('/messages')}
                    className="text-xs text-blue-600 underline mt-1">View in Messages</button>
                </div>
              )}
            </div>
          )}

          {isOwner && (
            <div className="mt-5 bg-gray-50 rounded-lg p-3 text-center text-sm text-gray-500">
              This is your pet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const BrowsePets = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedPet, setSelectedPet] = useState(null);

  useEffect(() => { fetchPets(); }, []);

  const fetchPets = async () => {
    try {
      const data = await petService.getAllPets();
      setPets(data);
    } catch (error) {
      console.error('Error fetching pets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPets = pets.filter(pet => {
    const matchesType = filter === 'all' || (pet.species || pet.type) === filter;
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      pet.name.toLowerCase().includes(q) ||
      pet.breed.toLowerCase().includes(q) ||
      (pet.species || pet.type || '').toLowerCase().includes(q);
    return matchesType && matchesSearch;
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900 flex-1">Browse Pets</h1>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or breed..."
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary w-64" />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="all">All Types</option>
            <option value="dog">Dogs</option>
            <option value="cat">Cats</option>
            <option value="bird">Birds</option>
            <option value="other">Others</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : filteredPets.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <p className="text-gray-600 font-medium">No pets found</p>
            <p className="text-sm text-gray-400 mt-1">Try a different name, breed, or type.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500">{filteredPets.length} pet{filteredPets.length !== 1 ? 's' : ''} found — click a card to view details</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPets.map(pet => (
                <button
                  key={pet.id}
                  onClick={() => setSelectedPet(pet)}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow text-left w-full"
                >
                  <img src={pet.image || 'https://via.placeholder.com/400x200?text=No+Image'} alt={pet.name}
                    className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{pet.name}</h3>
                        <p className="text-sm text-gray-500">{pet.breed} · {pet.species || pet.type} · {pet.gender}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        pet.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {pet.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{pet.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {selectedPet && (
        <PetProfilePanel
          pet={selectedPet}
          onClose={() => setSelectedPet(null)}
          onMessageSent={() => {}}
        />
      )}
    </Layout>
  );
};

export default BrowsePets;
