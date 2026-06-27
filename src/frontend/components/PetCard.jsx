import React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { adoptionService } from '../services/adoptionService';

const PetCard = ({ pet }) => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  console.log('PetCard - User object:', user);
  console.log('PetCard - Pet ownerId:', pet.ownerId, 'Type:', typeof pet.ownerId);
  console.log('PetCard - user.UserID:', user?.UserID, 'Type:', typeof user?.UserID);
  console.log('PetCard - Strict comparison (===):', user?.UserID === pet.ownerId);
  console.log('PetCard - Loose comparison (==):', user?.UserID == pet.ownerId);
  console.log('PetCard - String comparison:', String(user?.UserID) === String(pet.ownerId));

  const isOwner = String(user?.UserID) === String(pet.ownerId);

  const openModal = (e) => {
    e.preventDefault();
    if (isOwner) return; // Prevent opening modal for own pets
    setDone(false);
    setMessage('');
    setShowModal(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await adoptionService.requestAdoption(pet.id, message.trim());
      setDone(true);
    } catch {
      alert('Failed to send adoption request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
        <Link to={`/pet/${pet.id}`} className="block">
          <img
            src={pet.image || '/placeholder-pet.jpg'}
            alt={pet.name}
            className="w-full h-48 object-cover"
          />
        </Link>
        <div className="p-4 flex flex-col flex-1">
          <Link to={`/pet/${pet.id}`} className="hover:text-primary">
            <h3 className="text-lg font-semibold text-gray-900">{pet.name}</h3>
          </Link>
          <p className="text-sm text-gray-600">{pet.breed} · {pet.age} yr{pet.age !== 1 ? 's' : ''} · <span className="capitalize">{pet.gender}</span></p>
          <p className="text-sm text-gray-500 mt-2 flex-1">{pet.description?.substring(0, 80)}...</p>
          <div className="mt-3 flex items-center justify-between">
            <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${
              pet.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {pet.status}
            </span>
            {isOwner ? (
              <span className="text-xs text-blue-600 font-medium px-3 py-1.5">Your pet</span>
            ) : (
              pet.status === 'available' && (
                <button
                  onClick={openModal}
                  className="text-sm bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-dark font-medium"
                >
                  Request Adoption
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Adoption Modal */}
      {showModal && !isOwner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            {done ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-semibold text-gray-900 mb-1">Request Sent!</p>
                <p className="text-sm text-gray-500 mb-4">
                  Your adoption request for <span className="font-medium">{pet.name}</span> has been sent to the owner.
                </p>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-dark font-medium"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Request Adoption</h3>
                <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
                  <img src={pet.image} alt={pet.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-gray-900">{pet.name}</p>
                    <p className="text-sm text-gray-500">{pet.breed} · {pet.age} yr{pet.age !== 1 ? 's' : ''} · {pet.gender}</p>
                  </div>
                </div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message to owner <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={4}
                  placeholder="Introduce yourself and tell the owner why you'd be a great fit for this pet..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    disabled={loading}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 font-medium text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark disabled:opacity-60 font-medium text-sm"
                  >
                    {loading ? 'Sending...' : 'Send Request'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PetCard;
