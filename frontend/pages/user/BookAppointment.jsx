import React from 'react';
<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { petService } from '../../services/petService';
import { appointmentService } from '../../services/appointmentService';

const STEPS = ['Select Pets', 'Appointment Type', 'Choose Date'];

const formatAvailability = (service) => {
  if (service.specificDate) {
    return `Date: ${new Date(service.specificDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}`;
  }
  if (service.daysAvailable?.length) {
    return service.daysAvailable.join(', ');
  }
  return 'Contact clinic for schedule';
};

const BookAppointment = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Step 1
  const [myPets, setMyPets] = useState([]);
  const [loadingPets, setLoadingPets] = useState(true);
  const [selectedPets, setSelectedPets] = useState([]);

  // Step 2
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [selectedService, setSelectedService] = useState(null); // full service object

  // Step 3
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());

  useEffect(() => { fetchMyPets(); }, []);

  useEffect(() => {
    if (step === 2 && services.length === 0) fetchServices();
  }, [step]);

  useEffect(() => {
    if (selectedService) fetchAvailableDates(selectedService.id);
  }, [selectedService]);

  const fetchMyPets = async () => {
    try {
      const data = await petService.getMyPets();
      setMyPets(data);
    } catch (error) {
      console.error('Error fetching pets:', error);
    } finally {
      setLoadingPets(false);
    }
  };

  const fetchServices = async () => {
    setLoadingServices(true);
    try {
      const data = await appointmentService.getServices();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchAvailableDates = async (serviceId) => {
    try {
      const data = await appointmentService.getAvailableDates(serviceId);
      setAvailableDates(data);
    } catch (error) {
      console.error('Error fetching available dates:', error);
    }
  };

  const togglePet = (petId) => {
    setSelectedPets(prev =>
      prev.includes(petId) ? prev.filter(id => id !== petId) : [...prev, petId]
    );
  };

  const handleSelectService = (service) => {
    setSelectedService(service);
    setSelectedDate('');
    setAvailableDates([]);
  };

  const handleSubmit = async () => {
    try {
      await appointmentService.bookAppointment({
        petIds: selectedPets,
        serviceId: selectedService.id,
        date: selectedDate,
      });
      alert('Appointment booked successfully');
      navigate('/appointments');
    } catch (error) {
      alert('Failed to book appointment');
    }
  };

  const goToPrevMonth = () => {
    if (calendarYear === today.getFullYear() && calendarMonth === today.getMonth()) return;
    if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(y => y - 1); }
    else setCalendarMonth(m => m - 1);
  };

  const goToNextMonth = () => {
    if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(y => y + 1); }
    else setCalendarMonth(m => m + 1);
  };

  const isCurrentMonth = calendarYear === today.getFullYear() && calendarMonth === today.getMonth();

  const renderCalendar = () => {
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`e-${i}`} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(calendarYear, calendarMonth, day);
      const mm = String(calendarMonth + 1).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      const dateStr = `${calendarYear}-${mm}-${dd}`;
      const isPast = date < today;
      const available = !isPast && availableDates.includes(dateStr);
      const isSelected = selectedDate === dateStr;

      days.push(
        <button
          key={day}
          onClick={() => available && setSelectedDate(dateStr)}
          disabled={!available}
          className={`aspect-square rounded-lg text-sm font-medium transition-colors ${
            isSelected
              ? 'bg-primary text-white shadow'
              : available
              ? 'bg-white border border-gray-300 hover:border-primary hover:text-primary'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {day}
        </button>
      );
    }
    return days;
  };

  const selectedPetObjects = myPets.filter(p => selectedPets.includes(p.id));

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Book Appointment</h1>

        {/* Step indicator */}
        <div className="flex items-center mb-8">
          {STEPS.map((label, i) => {
            const s = i + 1;
            const active = step === s;
            const done = step > s;
            return (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                    done ? 'bg-primary text-white' :
                    active ? 'bg-primary text-white ring-4 ring-green-100' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {done ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : s}
                  </div>
                  <span className={`text-xs mt-1 whitespace-nowrap ${active ? 'text-primary font-semibold' : 'text-gray-500'}`}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 mb-4 ${done ? 'bg-primary' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step 1 — Select Pets */}
        {step === 1 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Select Your Pets</h2>
            <p className="text-sm text-gray-500 mb-5">Choose one or more pets to include in this appointment.</p>

            {loadingPets ? (
              <div className="text-center py-10 text-gray-500">Loading your pets...</div>
            ) : myPets.length === 0 ? (
              <div className="text-center py-10">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <p className="text-gray-600 font-medium">No pets registered yet</p>
                <p className="text-sm text-gray-500 mt-1">Go to My Pets to register a pet first.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {myPets.map(pet => {
                  const isSelected = selectedPets.includes(pet.id);
                  return (
                    <button
                      key={pet.id}
                      onClick={() => togglePet(pet.id)}
                      className={`flex items-center space-x-4 p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected ? 'border-primary bg-green-50' : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={pet.image || 'https://via.placeholder.com/60'}
                          alt={pet.name}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold truncate ${isSelected ? 'text-primary' : 'text-gray-900'}`}>{pet.name}</p>
                        <p className="text-sm text-gray-500 truncate">{pet.breed}</p>
                        <p className="text-xs text-gray-400 capitalize">{pet.type} · {pet.age} yr{pet.age !== 1 ? 's' : ''} · {pet.gender}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {selectedPets.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-primary font-medium">
                  {selectedPets.length} pet{selectedPets.length > 1 ? 's' : ''} selected:&nbsp;
                  {selectedPetObjects.map(p => p.name).join(', ')}
                </p>
              </div>
            )}

            <button
              onClick={() => setStep(2)}
              disabled={selectedPets.length === 0}
              className="w-full mt-6 bg-primary text-white py-3 rounded-lg hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
            >
              Next: Choose Appointment Type
            </button>
          </div>
        )}

        {/* Step 2 — Appointment Type (from DB) */}
        {step === 2 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Select a Service</h2>
            <p className="text-sm text-gray-500 mb-5">Choose the veterinary service for your pet(s).</p>

            {loadingServices ? (
              <div className="text-center py-10 text-gray-400">Loading services...</div>
            ) : services.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-xl">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-600 font-medium">No services available</p>
                <p className="text-sm text-gray-400 mt-1">Please check back later or contact the clinic.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {services.map(service => {
                  const isSelected = selectedService?.id === service.id;
                  return (
                    <button
                      key={service.id}
                      onClick={() => handleSelectService(service)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        isSelected ? 'border-primary bg-green-50' : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`font-semibold ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
                              {service.name}
                            </p>
                            {isSelected && (
                              <svg className="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>

                          {/* Availability */}
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {service.specificDate ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {new Date(service.specificDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            ) : service.daysAvailable?.length > 0 ? (
                              service.daysAvailable.map(d => (
                                <span key={d} className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{d}</span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400">Contact clinic for schedule</span>
                            )}
                          </div>

                          {/* Slots */}
                          {service.slots != null && (
                            <p className="text-xs text-gray-400 mt-1.5">
                              {service.slots} slot{service.slots !== 1 ? 's' : ''} available per day
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex space-x-3 mt-6">
              <button onClick={() => setStep(1)} className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 font-medium">
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!selectedService}
                className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                Next: Choose Date
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Calendar */}
        {step === 3 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Choose a Date</h2>
            <p className="text-sm text-gray-500 mb-1">
              Select an available date for <span className="font-medium text-gray-700">{selectedService?.name}</span>.
            </p>
            {selectedService && (
              <p className="text-xs text-gray-400 mb-5">
                Available: {formatAvailability(selectedService)}
              </p>
            )}

            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={goToPrevMonth}
                disabled={isCurrentMonth}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="font-semibold text-gray-900">
                {new Date(calendarYear, calendarMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <button onClick={goToNextMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-center text-xs font-semibold text-gray-500 py-2">{d}</div>
              ))}
              {renderCalendar()}
            </div>

            {/* Legend */}
            <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
              <span className="flex items-center space-x-1">
                <span className="w-3 h-3 rounded bg-primary inline-block" />
                <span>Selected</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-3 h-3 rounded border border-gray-300 bg-white inline-block" />
                <span>Available</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-3 h-3 rounded bg-gray-100 inline-block" />
                <span>Unavailable</span>
              </span>
            </div>

            {selectedDate && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-primary font-medium">
                  Selected: {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            )}

            <div className="flex space-x-3 mt-6">
              <button onClick={() => setStep(2)} className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 font-medium">
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedDate}
                className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BookAppointment;
=======
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { petService } from '../../services/petService';
import { appointmentService } from '../../services/appointmentService';

const STEPS = ['Select Pets', 'Appointment Type', 'Choose Date'];

const BookAppointment = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [myPets, setMyPets] = useState([]);
  const [loadingPets, setLoadingPets] = useState(true);
  const [selectedPets, setSelectedPets] = useState([]);
  const [appointmentType, setAppointmentType] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());

  useEffect(() => {
    fetchMyPets();
  }, []);

  useEffect(() => {
    if (appointmentType) fetchAvailableDates();
  }, [appointmentType]);

  const fetchMyPets = async () => {
    try {
      const data = await petService.getMyPets();
      setMyPets(data);
    } catch (error) {
      console.error('Error fetching pets:', error);
    } finally {
      setLoadingPets(false);
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

  const togglePet = (petId) => {
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

  const goToPrevMonth = () => {
    if (calendarYear === today.getFullYear() && calendarMonth === today.getMonth()) return;
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(y => y - 1);
    } else {
      setCalendarMonth(m => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(y => y + 1);
    } else {
      setCalendarMonth(m => m + 1);
    }
  };

  const isCurrentMonth = calendarYear === today.getFullYear() && calendarMonth === today.getMonth();

  const isDateAvailable = (dateStr) => {
    const day = new Date(dateStr).getDay();
    if (day === 0 || day === 6) return false;
    if (appointmentType === 'consultation' && day !== 1) return false;
    if (appointmentType === 'spay' && !availableDates.includes(dateStr)) return false;
    return true;
  };

  const renderCalendar = () => {
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`e-${i}`} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(calendarYear, calendarMonth, day);
      const dateStr = date.toISOString().split('T')[0];
      const isPast = date < today;
      const available = !isPast && isDateAvailable(dateStr);
      const isSelected = selectedDate === dateStr;

      days.push(
        <button
          key={day}
          onClick={() => available && setSelectedDate(dateStr)}
          disabled={!available}
          className={`aspect-square rounded-lg text-sm font-medium transition-colors ${
            isSelected
              ? 'bg-primary text-white shadow'
              : available
              ? 'bg-white border border-gray-300 hover:border-primary hover:text-primary'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {day}
        </button>
      );
    }
    return days;
  };

  const selectedPetObjects = myPets.filter(p => selectedPets.includes(p.id));

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Book Appointment</h1>

        {/* Step indicator */}
        <div className="flex items-center mb-8">
          {STEPS.map((label, i) => {
            const s = i + 1;
            const active = step === s;
            const done = step > s;
            return (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                    done ? 'bg-primary text-white' :
                    active ? 'bg-primary text-white ring-4 ring-green-100' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {done ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : s}
                  </div>
                  <span className={`text-xs mt-1 whitespace-nowrap ${active ? 'text-primary font-semibold' : 'text-gray-500'}`}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 mb-4 ${done ? 'bg-primary' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step 1 — Select Pets */}
        {step === 1 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Select Your Pets</h2>
            <p className="text-sm text-gray-500 mb-5">Choose one or more pets to include in this appointment.</p>

            {loadingPets ? (
              <div className="text-center py-10 text-gray-500">Loading your pets...</div>
            ) : myPets.length === 0 ? (
              <div className="text-center py-10">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <p className="text-gray-600 font-medium">No pets registered yet</p>
                <p className="text-sm text-gray-500 mt-1">Go to My Pets to register a pet first.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {myPets.map(pet => {
                  const isSelected = selectedPets.includes(pet.id);
                  return (
                    <button
                      key={pet.id}
                      onClick={() => togglePet(pet.id)}
                      className={`flex items-center space-x-4 p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? 'border-primary bg-green-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={pet.image || 'https://via.placeholder.com/60'}
                          alt={pet.name}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold truncate ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
                          {pet.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">{pet.breed}</p>
                        <p className="text-xs text-gray-400 capitalize">{pet.type} · {pet.age} yr{pet.age !== 1 ? 's' : ''} · {pet.gender}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {selectedPets.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-primary font-medium">
                  {selectedPets.length} pet{selectedPets.length > 1 ? 's' : ''} selected:&nbsp;
                  {selectedPetObjects.map(p => p.name).join(', ')}
                </p>
              </div>
            )}

            <button
              onClick={() => setStep(2)}
              disabled={selectedPets.length === 0}
              className="w-full mt-6 bg-primary text-white py-3 rounded-lg hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
            >
              Next: Choose Appointment Type
            </button>
          </div>
        )}

        {/* Step 2 — Appointment Type */}
        {step === 2 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Appointment Type</h2>
            <p className="text-sm text-gray-500 mb-5">Select the type of service for your pet(s).</p>

            <div className="space-y-3">
              {[
                { value: 'consultation', label: 'Consultation', schedule: 'Mondays only', color: 'text-primary', bg: 'bg-green-50' },
                { value: 'anti-rabies', label: 'Anti-Rabies Vaccine', schedule: 'Weekdays', color: 'text-blue-600', bg: 'bg-blue-50' },
                { value: 'spay', label: 'Spay / Neuter', schedule: 'Admin-scheduled dates', color: 'text-purple-600', bg: 'bg-purple-50' }
              ].map(type => (
                <button
                  key={type.value}
                  onClick={() => setAppointmentType(type.value)}
                  className={`w-full flex items-center space-x-4 p-4 rounded-xl border-2 text-left transition-all ${
                    appointmentType === type.value
                      ? 'border-primary bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full ${type.bg} flex items-center justify-center flex-shrink-0`}>
                    <div className={`w-3 h-3 rounded-full ${appointmentType === type.value ? 'bg-primary' : 'bg-gray-300'}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{type.label}</p>
                    <p className={`text-sm ${type.color}`}>{type.schedule}</p>
                  </div>
                  {appointmentType === type.value && (
                    <svg className="w-5 h-5 text-primary ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            <div className="flex space-x-3 mt-6">
              <button onClick={() => setStep(1)} className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 font-medium">
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!appointmentType}
                className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                Next: Choose Date
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Calendar */}
        {step === 3 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Choose a Date</h2>
            <p className="text-sm text-gray-500 mb-5">
              {appointmentType === 'consultation' && 'Consultations are available on Mondays only.'}
              {appointmentType === 'anti-rabies' && 'Anti-rabies vaccines are available on weekdays.'}
              {appointmentType === 'spay' && 'Spay/neuter is available on admin-scheduled dates only.'}
            </p>

            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={goToPrevMonth}
                disabled={isCurrentMonth}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="font-semibold text-gray-900">
                {new Date(calendarYear, calendarMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={goToNextMonth}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-center text-xs font-semibold text-gray-500 py-2">{d}</div>
              ))}
              {renderCalendar()}
            </div>

            {/* Legend */}
            <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
              <span className="flex items-center space-x-1">
                <span className="w-3 h-3 rounded bg-primary inline-block" />
                <span>Selected</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-3 h-3 rounded border border-gray-300 bg-white inline-block" />
                <span>Available</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-3 h-3 rounded bg-gray-100 inline-block" />
                <span>Unavailable</span>
              </span>
            </div>

            {/* Selected date confirmation */}
            {selectedDate && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-primary font-medium">
                  Selected: {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            )}

            <div className="flex space-x-3 mt-6">
              <button onClick={() => setStep(2)} className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 font-medium">
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedDate}
                className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BookAppointment;
>>>>>>> 8555e327320ce828f5dfb4efd072c21355eac3c7
