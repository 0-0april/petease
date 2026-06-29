import React from 'react';
<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import { petService } from '../../services/petService';
import { adoptionService } from '../../services/adoptionService';
import { messageService } from '../../services/messageService';
import { useAuth } from '../../contexts/AuthContext';

const PetProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [showAdoptModal, setShowAdoptModal] = useState(false);
  const [adoptMessage, setAdoptMessage] = useState('');
  const [adoptLoading, setAdoptLoading] = useState(false);
  const [adoptDone, setAdoptDone] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPetDetails();
    fetchMedicalHistory();
  }, [id]);

  useEffect(() => {
    if (pet) {
      console.log('PetProfile - User object:', user);
      console.log('PetProfile - Pet object:', pet);
      console.log('PetProfile - Pet ownerId:', pet.ownerId, 'Type:', typeof pet.ownerId);
      console.log('PetProfile - user.UserID:', user?.UserID, 'Type:', typeof user?.UserID);
      console.log('PetProfile - Strict comparison (===):', pet.ownerId === user?.UserID);
      console.log('PetProfile - Loose comparison (==):', pet.ownerId == user?.UserID);
      console.log('PetProfile - String comparison:', String(pet.ownerId) === String(user?.UserID));
    }
  }, [pet, user]);

  const fetchPetDetails = async () => {
    try {
      const data = await petService.getPetById(id);
      setPet(data);
    } catch (error) {
      console.error('Error fetching pet:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicalHistory = async () => {
    try {
      const data = await petService.getMedicalHistory(id);
      setMedicalHistory(data);
    } catch (error) {
      console.error('Error fetching medical history:', error);
    }
  };

  const handleAdoptionRequest = async () => {
    setAdoptLoading(true);
    try {
      await adoptionService.requestAdoption(id, adoptMessage.trim());
      setAdoptDone(true);
    } catch (error) {
      alert('Failed to send adoption request');
    } finally {
      setAdoptLoading(false);
    }
  };

  const handleSendMessage = async () => {
    try {
      await messageService.sendMessage(pet.ownerId, message);
      setShowMessageModal(false);
      setMessage('');
      alert('Message sent successfully');
    } catch (error) {
      alert('Failed to send message');
    }
  };

  if (loading) return <Layout><div className="text-center py-12">Loading...</div></Layout>;
  if (!pet) return <Layout><div className="text-center py-12">Pet not found</div></Layout>;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <img src={pet.image || '/placeholder-pet.jpg'} alt={pet.name} className="w-full h-96 object-cover" />
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{pet.name}</h1>
                <p className="text-lg text-gray-600 mt-2">{pet.breed} • {pet.age} years old • {pet.gender}</p>
              </div>
              <span className={`px-4 py-2 rounded-full ${
                pet.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {pet.status}
              </span>
            </div>
            <p className="text-gray-700 mt-4">{pet.description}</p>
            <div className="mt-6 flex space-x-4">
              {String(pet.ownerId) === String(user?.UserID) ? (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-6 py-2 rounded-lg font-medium">
                  You own this pet
                </div>
              ) : (
                <>
                  {pet.status === 'available' && (
                    <button
                      onClick={() => { setAdoptDone(false); setAdoptMessage(''); setShowAdoptModal(true); }}
                      className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark font-medium"
                    >
                      Request Adoption
                    </button>
                  )}
                  <button
                    onClick={() => setShowMessageModal(true)}
                    className="border border-primary text-primary px-6 py-2 rounded-lg hover:bg-primary hover:text-white font-medium"
                  >
                    Message Owner
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Medical History</h2>
          {medicalHistory.length === 0 ? (
            <p className="text-gray-600">No medical history available</p>
          ) : (
            <div className="space-y-4">
              {medicalHistory.map((record) => (
                <div key={record.id} className="border-l-4 border-primary pl-4">
                  <p className="font-semibold text-gray-900">{record.medication}</p>
                  <p className="text-sm text-gray-600">{new Date(record.date).toLocaleDateString()}</p>
                  <p className="text-gray-700 mt-1">{record.notes}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showMessageModal} onClose={() => setShowMessageModal(false)} title="Message Pet Owner">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          rows="4"
          placeholder="Type your message..."
        />
        <button onClick={handleSendMessage} className="w-full mt-4 bg-primary text-white py-2 rounded-md hover:bg-primary-dark">
          Send Message
        </button>
      </Modal>

      {/* Adoption Request Modal */}
      <Modal isOpen={showAdoptModal} onClose={() => !adoptLoading && setShowAdoptModal(false)} title="Request Adoption">
        {adoptDone ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-semibold text-gray-900 mb-1">Request Sent!</p>
            <p className="text-sm text-gray-500 mb-4">Your adoption request for <span className="font-medium">{pet.name}</span> has been sent to the owner.</p>
            <button
              onClick={() => setShowAdoptModal(false)}
              className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-dark font-medium"
            >
              Done
            </button>
          </div>
        ) : (
          <>
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
              value={adoptMessage}
              onChange={e => setAdoptMessage(e.target.value)}
              rows={4}
              placeholder="Introduce yourself and tell the owner why you'd be a great fit for this pet..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            <div className="flex space-x-3 mt-4">
              <button
                onClick={() => setShowAdoptModal(false)}
                disabled={adoptLoading}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAdoptionRequest}
                disabled={adoptLoading}
                className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark disabled:opacity-60 font-medium text-sm"
              >
                {adoptLoading ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </>
        )}
      </Modal>
    </Layout>
  );
};

export default PetProfile;
=======
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import { petService } from '../../services/petService';
import { adoptionService } from '../../services/adoptionService';
import { messageService } from '../../services/messageService';
import { useAuth } from '../../contexts/AuthContext';

const PetProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [showAdoptModal, setShowAdoptModal] = useState(false);
  const [adoptMessage, setAdoptMessage] = useState('');
  const [adoptLoading, setAdoptLoading] = useState(false);
  const [adoptDone, setAdoptDone] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPetDetails();
    fetchMedicalHistory();
  }, [id]);

  useEffect(() => {
    if (pet) {
      console.log('PetProfile - User object:', user);
      console.log('PetProfile - Pet object:', pet);
      console.log('PetProfile - Pet ownerId:', pet.ownerId, 'Type:', typeof pet.ownerId);
      console.log('PetProfile - user.UserID:', user?.UserID, 'Type:', typeof user?.UserID);
      console.log('PetProfile - Strict comparison (===):', pet.ownerId === user?.UserID);
      console.log('PetProfile - Loose comparison (==):', pet.ownerId == user?.UserID);
      console.log('PetProfile - String comparison:', String(pet.ownerId) === String(user?.UserID));
    }
  }, [pet, user]);

  const fetchPetDetails = async () => {
    try {
      const data = await petService.getPetById(id);
      setPet(data);
    } catch (error) {
      console.error('Error fetching pet:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicalHistory = async () => {
    try {
      const data = await petService.getMedicalHistory(id);
      setMedicalHistory(data);
    } catch (error) {
      console.error('Error fetching medical history:', error);
    }
  };

  const handleAdoptionRequest = async () => {
    setAdoptLoading(true);
    try {
      await adoptionService.requestAdoption(id, adoptMessage.trim());
      setAdoptDone(true);
    } catch (error) {
      alert('Failed to send adoption request');
    } finally {
      setAdoptLoading(false);
    }
  };

  const handleSendMessage = async () => {
    try {
      await messageService.sendMessage(pet.ownerId, message);
      setShowMessageModal(false);
      setMessage('');
      alert('Message sent successfully');
    } catch (error) {
      alert('Failed to send message');
    }
  };

  if (loading) return <Layout><div className="text-center py-12">Loading...</div></Layout>;
  if (!pet) return <Layout><div className="text-center py-12">Pet not found</div></Layout>;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <img src={pet.image || '/placeholder-pet.jpg'} alt={pet.name} className="w-full h-96 object-cover" />
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{pet.name}</h1>
                <p className="text-lg text-gray-600 mt-2">{pet.breed} • {pet.age} years old • {pet.gender}</p>
              </div>
              <span className={`px-4 py-2 rounded-full ${
                pet.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {pet.status}
              </span>
            </div>
            <p className="text-gray-700 mt-4">{pet.description}</p>
            <div className="mt-6 flex space-x-4">
              {String(pet.ownerId) === String(user?.UserID) ? (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-6 py-2 rounded-lg font-medium">
                  You own this pet
                </div>
              ) : (
                <>
                  {pet.status === 'available' && (
                    <button
                      onClick={() => { setAdoptDone(false); setAdoptMessage(''); setShowAdoptModal(true); }}
                      className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark font-medium"
                    >
                      Request Adoption
                    </button>
                  )}
                  <button
                    onClick={() => setShowMessageModal(true)}
                    className="border border-primary text-primary px-6 py-2 rounded-lg hover:bg-primary hover:text-white font-medium"
                  >
                    Message Owner
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Medical History</h2>
          {medicalHistory.length === 0 ? (
            <p className="text-gray-600">No medical history available</p>
          ) : (
            <div className="space-y-4">
              {medicalHistory.map((record) => (
                <div key={record.id} className="border-l-4 border-primary pl-4">
                  <p className="font-semibold text-gray-900">{record.medication}</p>
                  <p className="text-sm text-gray-600">{new Date(record.date).toLocaleDateString()}</p>
                  <p className="text-gray-700 mt-1">{record.notes}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showMessageModal} onClose={() => setShowMessageModal(false)} title="Message Pet Owner">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          rows="4"
          placeholder="Type your message..."
        />
        <button onClick={handleSendMessage} className="w-full mt-4 bg-primary text-white py-2 rounded-md hover:bg-primary-dark">
          Send Message
        </button>
      </Modal>

      {/* Adoption Request Modal */}
      <Modal isOpen={showAdoptModal} onClose={() => !adoptLoading && setShowAdoptModal(false)} title="Request Adoption">
        {adoptDone ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-semibold text-gray-900 mb-1">Request Sent!</p>
            <p className="text-sm text-gray-500 mb-4">Your adoption request for <span className="font-medium">{pet.name}</span> has been sent to the owner.</p>
            <button
              onClick={() => setShowAdoptModal(false)}
              className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-dark font-medium"
            >
              Done
            </button>
          </div>
        ) : (
          <>
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
              value={adoptMessage}
              onChange={e => setAdoptMessage(e.target.value)}
              rows={4}
              placeholder="Introduce yourself and tell the owner why you'd be a great fit for this pet..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            <div className="flex space-x-3 mt-4">
              <button
                onClick={() => setShowAdoptModal(false)}
                disabled={adoptLoading}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAdoptionRequest}
                disabled={adoptLoading}
                className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark disabled:opacity-60 font-medium text-sm"
              >
                {adoptLoading ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </>
        )}
      </Modal>
    </Layout>
  );
};

export default PetProfile;
>>>>>>> 8555e327320ce828f5dfb4efd072c21355eac3c7
