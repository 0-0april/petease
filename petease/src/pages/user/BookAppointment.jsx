import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { petService } from '../../services/petService';
import { appointmentService } from '../../services/appointmentService';

const BookAppointment = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [myPets, setMyPets] = useState([]);
  const [selectedPets, setSelectedPets] = useState([]);
  const [appointmentType, setAppointmentType] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);

  useEffect(() => {
    fetchMyPets();
  }, []);

  useEffect(() => {
    if (appointmentType) {
      fetchAvailableDates();
    }
  }, [appointmentType]);

  const fetchMyPets = async () => {
    try {
      const data = await petService.getMyPets();
      setMyPets(data);
    } catch (error) {
      console.error('Error fetching pets:', error);
    }
  };

  const fetchAvailableDates = async () => {
    try {
      const data = await appointmentService.getAvailableDates(appointmentType);
      setAvailableDates(data);
    } catch (error) {
      console.error('Error fetching available dates:', error);
    }
  };

  const handlePetSelection = (petId) => {
    setSelectedPets(prev =>
      prev.includes(petId) ? prev.filter(id => id !== petId) : [...prev, petId]
    );
  };

  const handleSubmit = async () => {
    try {
      await appointmentService.bookAppointment({
        petIds: selectedPets,
        type: appointmentType,
        date: selectedDate
      });
      alert('Appointment booked successfully');
      navigate('/appointments');
    } catch (error) {
      alert('Failed to book appointment');
    }
  };

  const isDateAvailable = (date) => {
    const day = new Date(date).getDay();
    if (day === 0 || day === 6) return false;
    
    if (appointmentType === 'consultation' && day !== 1) return false;
    if (appointmentType === 'spay' && !availableDates.includes(date)) return false;
    
    return true;
  };

  const renderCalendar = () => {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(today.getFullYear(), today.getMonth(), day);
      const dateStr = date.toISOString().split('T')[0];
      const available = isDateAvailable(dateStr);
      const isPast = date < today;

      days.push(
        <button
          key={day}
          onClick={() => available && !isPast && setSelectedDate(dateStr)}
          disabled={!available || isPast}
          className={`p-2 rounded-md ${
            selectedDate === dateStr
              ? 'bg-primary text-white'
              : available && !isPast
              ? 'bg-white hover:bg-gray-100 border border-gray-300'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Book Appointment</h1>
        
        <div className="mb-6 flex justify-between items-center">
          <div className="flex space-x-4">
            {[1, 2, 3].map(s => (
              <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= s ? 'bg-primary text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {s}
              </div>
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Pets</h2>
            <div className="space-y-3">
              {myPets.map(pet => (
                <label key={pet.id} className="flex items-center space-x-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedPets.includes(pet.id)}
                    onChange={() => handlePetSelection(pet.id)}
                    className="w-5 h-5 text-primary"
                  />
                  <img src={pet.image || '/placeholder-pet.jpg'} alt={pet.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-gray-900">{pet.name}</p>
                    <p className="text-sm text-gray-600">{pet.breed}</p>
                  </div>
                </label>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={selectedPets.length === 0}
              className="w-full mt-6 bg-primary text-white py-2 rounded-md hover:bg-primary-dark disabled:bg-gray-300"
            >
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Appointment Type</h2>
            <div className="space-y-3">
              {['consultation', 'anti-rabies', 'spay'].map(type => (
                <label key={type} className="flex items-center space-x-3 p-4 border rounded-md cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="appointmentType"
                    value={type}
                    checked={appointmentType === type}
                    onChange={(e) => setAppointmentType(e.target.value)}
                    className="w-5 h-5 text-primary"
                  />
                  <div>
                    <p className="font-semibold text-gray-900 capitalize">{type}</p>
                    <p className="text-sm text-gray-600">
                      {type === 'consultation' && 'Available on Mondays only'}
                      {type === 'anti-rabies' && 'Available weekdays'}
                      {type === 'spay' && 'Available on specific dates set by admin'}
                    </p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex space-x-4 mt-6">
              <button onClick={() => setStep(1)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-50">
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!appointmentType}
                className="flex-1 bg-primary text-white py-2 rounded-md hover:bg-primary-dark disabled:bg-gray-300"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Date</h2>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-semibold text-gray-700 p-2">
                  {day}
                </div>
              ))}
              {renderCalendar()}
            </div>
            <div className="flex space-x-4 mt-6">
              <button onClick={() => setStep(2)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-50">
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedDate}
                className="flex-1 bg-primary text-white py-2 rounded-md hover:bg-primary-dark disabled:bg-gray-300"
              >
                Book Appointment
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BookAppointment;
