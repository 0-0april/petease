import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import { petService } from '../../services/petService';
import { adoptionService } from '../../services/adoptionService';

const MyPets = () => {
  const [pets, setPets] = useState([]);
  const [adoptionRequests, setAdoptionRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'dog',
    breed: '',
    age: '',
    gender: 'male',
    description: '',
    image: ''
  });

  useEffect(() => {
    fetchMyPets();
    fetchAdoptionRequests();
  }, []);

  const fetchMyPets = async () => {
    try {
      const data = await petService.getMyPets();
      setPets(data);
    } catch (error) {
      console.error('Error fetching pets:', error);
    }
  };

  const fetchAdoptionRequests = async () => {
    try {
      const data = await adoptionService.getMyAdoptionRequests();
      setAdoptionRequests(data);
    } catch (error) {
      console.error('Error fetching adoption requests:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPet) {
        await petService.updatePet(editingPet.id, formData);
      } else {
        await petService.createPet(formData);
      }
      setShowModal(false);
      setEditingPet(null);
      resetForm();
      fetchMyPets();
    } catch (error) {
      alert('Failed to save pet');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this pet?')) {
      try {
        await petService.deletePet(id);
        fetchMyPets();
      } catch (error) {
        alert('Failed to delete pet');
      }
    }
  };

  const handleEdit = (pet) => {
    setEditingPet(pet);
    setFormData({
      name: pet.name,
      type: pet.type,
      breed: pet.breed,
      age: pet.age,
      gender: pet.gender,
      description: pet.description,
      image: pet.image
    });
    setShowModal(true);
  };

  const handleApprove = async (requestId) => {
    try {
      await adoptionService.approveAdoption(requestId);
      fetchAdoptionRequests();
      fetchMyPets();
    } catch (error) {
      alert('Failed to approve adoption');
    }
  };

  const handleReject = async (requestId) => {
    try {
      await adoptionService.rejectAdoption(requestId);
      fetchAdoptionRequests();
    } catch (error) {
      alert('Failed to reject adoption');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'dog',
      breed: '',
      age: '',
      gender: 'male',
      description: '',
      image: ''
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">My Pets</h1>
          <button
            onClick={() => { setShowModal(true); setEditingPet(null); resetForm(); }}
            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark"
          >
            Add Pet
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map(pet => (
            <div key={pet.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img src={pet.image || '/placeholder-pet.jpg'} alt={pet.name} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900">{pet.name}</h3>
                <p className="text-sm text-gray-600">{pet.breed} • {pet.age} years old</p>
                <div className="mt-4 flex space-x-2">
                  <button onClick={() => handleEdit(pet)} className="flex-1 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark text-sm">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(pet.id)} className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {adoptionRequests.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Adoption Requests</h2>
            <div className="space-y-4">
              {adoptionRequests.map(request => (
                <div key={request.id} className="flex justify-between items-center border-b pb-4">
                  <div>
                    <p className="font-semibold text-gray-900">{request.adopterName}</p>
                    <p className="text-sm text-gray-600">Pet: {request.petName}</p>
                    <p className="text-sm text-gray-500">{new Date(request.createdAt).toLocaleDateString()}</p>
                  </div>
                  {request.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button onClick={() => handleApprove(request.id)} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                        Approve
                      </button>
                      <button onClick={() => handleReject(request.id)} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
                        Reject
                      </button>
                    </div>
                  )}
                  {request.status !== 'pending' && (
                    <span className={`px-4 py-2 rounded-full ${
                      request.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {request.status}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingPet(null); }} title={editingPet ? 'Edit Pet' : 'Add Pet'}>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="bird">Bird</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Breed</label>
              <input
                type="text"
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                rows="3"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Image URL</label>
              <input
                type="file"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <button type="submit" className="w-full mt-6 bg-primary text-white py-2 rounded-md hover:bg-primary-dark">
            {editingPet ? 'Update Pet' : 'Add Pet'}
          </button>
        </form>
      </Modal>
    </Layout>
  );
};

export default MyPets;
