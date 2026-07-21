import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { petService } from '../../services/petService';
import { adoptionService } from '../../services/adoptionService';
import { messageService } from '../../services/messageService';
import { useAuth } from '../../contexts/AuthContext';

const getAgeInMonths = (birthday) => {
  if (!birthday) return null;
  const birth = new Date(birthday);
  const now = new Date();
  return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
};

const SpeciesIcon = ({ species }) => {
  const s = (species || '').toLowerCase();
  if (s === 'dog') {
    return (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 14a6 6 0 110-12 6 6 0 010 12z" />
      </svg>
    );
  }
  return (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 14a6 6 0 110-12 6 6 0 010 12z" clipRule="evenodd" />
    </svg>
  );
};

const PetProfilePanel = ({ pet, onClose, onMessageSent }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  console.log('PetProfilePanel - FULL User object:', user);
  console.log('PetProfilePanel - User keys:', user ? Object.keys(user) : 'no user');
  console.log('PetProfilePanel - Pet ownerId:', pet.ownerId);
  console.log('PetProfilePanel - user.UserID:', user?.UserID);
  console.log('PetProfilePanel - Comparison:', String(user?.UserID) === String(pet.ownerId));

  const isOwner = String(user?.UserID) === String(pet.ownerId);

  const [adoptStep, setAdoptStep] = useState(null);
  const [adoptMsg, setAdoptMsg] = useState('');
  const [adoptLoading, setAdoptLoading] = useState(false);
  const [msgStep, setMsgStep] = useState(null);
  const [msgContent, setMsgContent] = useState('');
  const [msgLoading, setMsgLoading] = useState(false);

  const ageInMonths = getAgeInMonths(pet.birthday);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
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
      <div className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="relative">
          <img src={pet.image || 'https://via.placeholder.com/600x300?text=No+Image'} alt={pet.name}
            className="w-full h-56 object-cover rounded-t-2xl" />
          <button onClick={onClose} className="absolute top-3 right-3 bg-white/90 rounded-full p-1.5 hover:bg-white shadow">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <span className={`absolute bottom-3 left-3 px-3 py-1 text-xs font-semibold rounded-full ${pet.status === 'available' ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
            {pet.status}
          </span>
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900">{pet.name}</h2>
          <p className="text-gray-500 text-sm mt-1">
            {pet.breed} {pet.species || pet.type} {pet.gender}
            {pet.color && ` ${pet.color}`}
            {ageInMonths !== null && ` ${ageInMonths} ${ageInMonths === 1 ? 'month' : 'months'} old`}
          </p>
          <p className="text-gray-700 mt-4 text-sm leading-relaxed">{pet.description}</p>
          {pet.medicalHistory && (
            <div className="mt-4 bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Medical History</p>
              <p className="text-sm text-gray-700">{pet.medicalHistory}</p>
            </div>
          )}

          {isOwner ? (
            <div className="mt-5 bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <p className="text-sm font-medium text-blue-700">You own this pet</p>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {pet.status === 'available' && (
                <div>
                  {adoptStep === null && (
                    <button onClick={() => setAdoptStep('form')} className="w-full bg-primary text-white py-2.5 rounded-lg hover:bg-primary-dark font-medium text-sm">
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
                          className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium">Cancel</button>
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
                </div>
              )}

              {msgStep === null && (
                <button onClick={() => setMsgStep('form')} className="w-full border border-primary text-primary py-2.5 rounded-lg hover:bg-green-50 font-medium text-sm">
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
                      className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium">Cancel</button>
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
                  <button onClick={() => navigate('/messages')} className="text-xs text-blue-600 underline mt-1">View in Messages</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PetCard = ({ pet, onClick }) => {
  const ageInMonths = getAgeInMonths(pet.birthday);
  const ageLabel = ageInMonths !== null ? `${ageInMonths} ${ageInMonths === 1 ? 'mo' : 'mos'}` : 'Age N/A';
  const speciesRaw = pet.species || pet.type || 'Pet';
  const speciesLabel = speciesRaw.charAt(0).toUpperCase() + speciesRaw.slice(1);

  return (
    <div
      className="group relative bg-white rounded-2xl text-left w-full flex flex-col overflow-hidden transition-all duration-200 cursor-pointer"
      style={{ border: '1.5px dashed hsla(135,95%,18%,0.22)', boxShadow: '0 2px 12px 0 rgba(6,50,12,0.07)' }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
    >
      <div className="relative overflow-hidden">
        <img
          src={pet.image || 'https://via.placeholder.com/400x220?text=No+Image'}
          alt={pet.name}
          className="w-full h-48 object-cover rounded-t-2xl transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm text-white"
          style={{ background: 'hsla(130,100%,30%,0.90)', backdropFilter: 'blur(6px)' }}>
          <SpeciesIcon species={speciesRaw} />
          {speciesLabel}
        </span>
        <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm bg-white/90 ${pet.status === 'available' ? 'text-green-700' : 'text-gray-500'}`}>
          {pet.status}
        </span>
      </div>

      <div className="flex flex-col flex-1 p-4 gap-2">
        <div>
          <h3 className="text-base font-bold truncate" style={{ color: 'hsl(140,100%,7%)' }}>{pet.name}</h3>
          <p className="text-xs mt-0.5 truncate" style={{ color: 'hsla(140,100%,7%,0.50)' }}>
            {pet.breed || 'Unknown breed'} &middot; {pet.gender || '—'}
          </p>
        </div>
        <p className="text-sm line-clamp-2 flex-1" style={{ color: 'hsla(140,100%,7%,0.60)' }}>
          {pet.description || 'No description available.'}
        </p>
        <div className="flex items-center gap-3 pt-1">
          <span className="inline-flex items-center gap-1 text-xs" style={{ color: 'hsla(140,100%,7%,0.55)' }}>
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {ageLabel}
          </span>
          <span className="inline-flex items-center gap-1 text-xs" style={{ color: 'hsla(140,100%,7%,0.55)' }}>
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {speciesLabel}
          </span>
        </div>
        <div className="mt-2 w-full py-2 rounded-full text-sm font-semibold text-center text-white transition-all duration-150"
          style={{ background: 'hsl(135,95%,18%)' }}>
          View Profile
        </div>
      </div>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden animate-pulse"
    style={{ border: '1.5px dashed hsla(135,95%,18%,0.15)', boxShadow: '0 2px 12px 0 rgba(6,50,12,0.05)' }}>
    <div className="h-48 bg-gray-200 rounded-t-2xl" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="h-3 bg-gray-100 rounded w-full" />
      <div className="h-3 bg-gray-100 rounded w-5/6" />
      <div className="h-8 bg-gray-200 rounded-full mt-3" />
    </div>
  </div>
);

const WELCOME_DURATION_MS = 60_000; // 1 minute

const BrowsePets = () => {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedPet, setSelectedPet] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const stamp = localStorage.getItem('newUserRegisteredAt');
    if (stamp) {
      const elapsed = Date.now() - Number(stamp);
      if (elapsed < WELCOME_DURATION_MS) {
        setShowWelcome(true);
        const remaining = WELCOME_DURATION_MS - elapsed;
        const timer = setTimeout(() => {
          setShowWelcome(false);
          localStorage.removeItem('newUserRegisteredAt');
        }, remaining);
        return () => clearTimeout(timer);
      } else {
        localStorage.removeItem('newUserRegisteredAt');
      }
    }
  }, []);

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
      {showWelcome && (
        <div
          className="relative overflow-hidden rounded-2xl mb-8 px-6 py-10 text-center"
          style={{ background: 'transparent', border: 'none' }}
        >
          <div className="absolute inset-0 opacity-0 rounded-2xl" aria-hidden="true"
            style={{ backgroundImage: 'radial-gradient(hsla(135,95%,18%,0.30) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          <div className="relative">
            <h1 className="text-3xl sm:text-4xl font-black mb-2" style={{ color: 'hsl(140,100%,7%)' }}>
              Welcome, {user?.username || user?.name || 'there'}
            </h1>
            <p className="text-sm sm:text-base max-w-md mx-auto font-light"
              style={{ color: 'hsla(140,100%,7%,0.58)', lineHeight: '1.75' }}>
              Browse adorable pets looking for a loving home.
            </p>
          </div>
        </div>
      )}

      <div className={`flex flex-col sm:flex-row sm:items-center gap-3 mb-6 ${!showWelcome ? 'mt-6' : ''}`}>
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or breed..."
            className="pl-9 pr-9 py-2.5 w-full border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white shadow-sm" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white shadow-sm">
          <option value="all">All Types</option>
          <option value="dog">Dogs</option>
          <option value="cat">Cats</option>
          <option value="bird">Birds</option>
          <option value="other">Others</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredPets.length === 0 ? (
        <div className="rounded-2xl py-16 text-center"
          style={{ border: '1.5px dashed hsla(135,95%,18%,0.20)', background: 'rgba(255,255,255,0.6)' }}>
          <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            style={{ color: 'hsla(135,95%,18%,0.25)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <p className="font-semibold" style={{ color: 'hsl(140,100%,7%)' }}>No pets found</p>
          <p className="text-sm mt-1" style={{ color: 'hsla(140,100%,7%,0.45)' }}>Try a different name, breed, or type.</p>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPets.map(pet => (
              <PetCard key={pet.id} pet={pet} onClick={() => setSelectedPet(pet)} />
            ))}
          </div>
        </div>
      )}

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
