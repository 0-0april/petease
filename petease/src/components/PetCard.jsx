import { Link } from 'react-router-dom';

const PetCard = ({ pet }) => {
  return (
    <Link to={`/pet/${pet.id}`} className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <img src={pet.image || '/placeholder-pet.jpg'} alt={pet.name} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{pet.name}</h3>
        <p className="text-sm text-gray-600">{pet.breed} • {pet.age} years old</p>
        <p className="text-sm text-gray-500 mt-2">{pet.description?.substring(0, 80)}...</p>
        <div className="mt-3">
          <span className={`inline-block px-3 py-1 text-xs rounded-full ${
            pet.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {pet.status}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default PetCard;
