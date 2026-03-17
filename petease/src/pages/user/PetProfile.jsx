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
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPetDetails();
    fetchMedicalHistory();
  }, [id]);

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
    try {
      await adoptionService.requestAdoption(id);
      alert('Adoption request sent successfully');
      navigate('/browse-pets');
    } catch (error) {
      alert('Failed to send adoption request');
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
              {pet.ownerId !== user.id && pet.status === 'available' && (
                <button onClick={handleAdoptionRequest} className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark">
                  Request Adoption
                </button>
              )}
              {pet.ownerId !== user.id && (
                <button onClick={() => setShowMessageModal(true)} className="border border-primary text-primary px-6 py-2 rounded-md hover:bg-primary hover:text-white">
                  Message Owner
                </button>
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
    </Layout>
  );
};

export default PetProfile;
