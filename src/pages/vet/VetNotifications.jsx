import { useState, useEffect } from 'react';
import VetLayout from '../../components/VetLayout';
import { vetService } from '../../services/vetService';

const VetNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { appointments } = await vetService.getAllAppointments(1, 100);
      const recentAppointments = appointments
        .filter(apt => apt.status === 'pending' || apt.status === 'confirmed')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);

      const notifs = recentAppointments.map(apt => ({
        id: apt.id,
        title: `New ${apt.type} Appointment`,
        message: `${apt.userName} booked a ${apt.type} appointment for ${apt.pets.map(p => p.name).join(', ')} on ${apt.date} at ${apt.time}`,
        type: apt.status,
        createdAt: apt.createdAt
      }));

      setNotifications(notifs);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  return (
    <VetLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>

        <div className="space-y-3">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className="bg-white rounded-lg shadow-md p-4 border-l-4 border-primary"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{notification.title}</p>
                  <p className="text-gray-600 mt-1">{notification.message}</p>
                  <div className="flex items-center space-x-3 mt-2">
                    <p className="text-sm text-gray-500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      notification.type === 'confirmed' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {notification.type}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {notifications.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600">No new notifications</p>
          </div>
        )}
      </div>
    </VetLayout>
  );
};

export default VetNotifications;
